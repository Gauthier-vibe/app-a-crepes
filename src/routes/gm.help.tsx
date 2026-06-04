import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, LifeBuoy, Loader2, Send, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { charactersById, type CharacterId } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SQUAD_CHANNEL = "squad:investigators";
const QUESTION_PREFIX = "[Q] ";
const MAX_QUESTIONS = 3;
type Selected = CharacterId | "squad" | null;

export const Route = createFileRoute("/gm/help")({
  head: () => ({ meta: [{ title: "Boîte d'aide — Game Master" }] }),
  component: GmHelpPage,
});

interface LiveMessage {
  id: string;
  channel: string;
  sender_character_id: string;
  sender_display_name: string;
  content: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function GmHelpPage() {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Selected>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load all help:* and squad messages + subscribe
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`channel.like.help:%,channel.eq.${SQUAD_CHANNEL}`)
        .order("created_at", { ascending: true })
        .limit(2000);
      if (!mounted) return;
      if (error) toast.error("Chargement impossible", { description: error.message });
      else setMessages(data as LiveMessage[]);
      setLoading(false);
    })();

    const sub = supabase
      .channel("chat_messages:help-all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const next = payload.new as LiveMessage;
          if (!next.channel?.startsWith("help:") && next.channel !== SQUAD_CHANNEL) return;
          setMessages((m) => (m.some((x) => x.id === next.id) ? m : [...m, next]));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(sub);
    };
  }, []);

  const squadInfo = useMemo(() => {
    const squadMessages = messages.filter((m) => m.channel === SQUAD_CHANNEL);
    const last = squadMessages[squadMessages.length - 1];
    const questionsUsed = squadMessages.filter((m) => {
      const sender = charactersById[m.sender_character_id as CharacterId];
      return sender?.isInvestigator && m.content.startsWith(QUESTION_PREFIX);
    }).length;
    return { count: squadMessages.length, last, questionsUsed };
  }, [messages]);

  const threads = useMemo(() => {
    const map = new Map<CharacterId, { last: LiveMessage; count: number }>();
    for (const m of messages) {
      if (!m.channel.startsWith("help:")) continue;
      const id = m.channel.replace("help:", "") as CharacterId;
      if (!charactersById[id]) continue;
      const cur = map.get(id);
      if (!cur || new Date(m.created_at) > new Date(cur.last.created_at)) {
        map.set(id, { last: m, count: (cur?.count ?? 0) + 1 });
      } else {
        map.set(id, { last: cur.last, count: cur.count + 1 });
      }
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => +new Date(b.last.created_at) - +new Date(a.last.created_at));
  }, [messages]);

  const threadMessages = useMemo(() => {
    if (!selected) return [];
    const channel = selected === "squad" ? SQUAD_CHANNEL : `help:${selected}`;
    return messages.filter((m) => m.channel === channel);
  }, [messages, selected]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [threadMessages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const value = draft.trim();
    if (!value || sending) return;
    setSending(true);
    setDraft("");
    const isSquad = selected === "squad";
    const { error } = await supabase.from("chat_messages").insert({
      channel: isSquad ? SQUAD_CHANNEL : `help:${selected}`,
      sender_character_id: "gm",
      sender_display_name: isSquad ? "Commissaire" : "Organisation",
      content: value,
    });
    if (error) {
      toast.error("Envoi impossible", { description: error.message });
      setDraft(value);
    }
    setSending(false);
  };

  return (
    <div className="px-5 md:px-8 py-6 max-w-6xl mx-auto">
      <header className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <LifeBuoy className="h-3 w-3" />
          Boîte d'aide
        </p>
        <h1 className="font-serif text-4xl">Demandes des invités</h1>
      </header>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        {/* Thread list */}
        <aside className="paper-texture rounded-xl border border-border shadow-paper p-2 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Chargement…
            </div>
          ) : threads.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6 px-3">
              Aucune demande pour l'instant.
            </p>
          ) : (
            <ul className="space-y-1">
              {threads.map((t) => {
                const c = charactersById[t.id];
                const active = selected === t.id;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelected(t.id)}
                      className={cn(
                        "w-full text-left rounded-md px-2.5 py-2 flex items-start gap-2.5 transition-colors",
                        active ? "bg-primary/10" : "hover:bg-muted/60",
                      )}
                    >
                      <img
                        src={c.image}
                        alt={c.name}
                        width={64}
                        height={64}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-sm leading-tight truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{t.last.content}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          {formatTime(t.last.created_at)} · {t.count} msg
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Thread view */}
        <section className="paper-texture rounded-xl border border-border shadow-paper flex flex-col min-h-[60vh]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic px-6 text-center">
              Sélectionne un invité pour lire et répondre à sa demande.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <img
                  src={charactersById[selected].image}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                />
                <div>
                  <p className="font-serif text-lg leading-none">{charactersById[selected].name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {charactersById[selected].profession}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {threadMessages.map((m) => {
                  const isStaff = m.sender_character_id === "gm" || m.sender_character_id === "system";
                  return (
                    <div key={m.id} className={cn("flex", isStaff ? "justify-end" : "justify-start")}>
                      <div className="max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2 text-[14px] leading-snug shadow-paper",
                            isStaff
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-card text-foreground border border-border rounded-bl-sm",
                          )}
                        >
                          <p>{m.content}</p>
                        </div>
                        <p
                          className={cn(
                            "text-[10px] text-muted-foreground mt-0.5 font-mono",
                            isStaff ? "text-right mr-1" : "ml-2",
                          )}
                        >
                          {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={send}
                className="flex items-center gap-2 border-t border-border px-3 py-2.5"
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Répondre…"
                  className="flex-1 bg-background"
                  maxLength={500}
                />
                <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>

    </div>
  );
}
