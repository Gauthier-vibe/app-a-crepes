import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, LifeBuoy, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/player/help")({
  head: () => ({ meta: [{ title: "Aide — Murder Party" }] }),
  component: HelpPage,
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

function HelpPage() {
  const { character } = useCurrentCharacter();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel = character ? `help:${character.id}` : null;

  useEffect(() => {
    if (!channel) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel", channel)
        .order("created_at", { ascending: true })
        .limit(500);
      if (!mounted) return;
      if (error) toast.error("Chat indisponible", { description: error.message });
      else setMessages(data as LiveMessage[]);
      setLoading(false);
    })();

    const sub = supabase
      .channel(`chat_messages:${channel}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel=eq.${channel}` },
        (payload) => {
          setMessages((m) => {
            const next = payload.new as LiveMessage;
            if (m.some((x) => x.id === next.id)) return m;
            return [...m, next];
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(sub);
    };
  }, [channel]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!character || !channel) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || sending) return;
    setSending(true);
    setDraft("");
    const { error } = await supabase.from("chat_messages").insert({
      channel,
      sender_character_id: character.id,
      sender_display_name: character.name,
      content: value,
    });
    if (error) {
      toast.error("Message non envoyé", { description: error.message });
      setDraft(value);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)]">
      <header className="px-4 py-3 border-b border-border bg-card/60">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <LifeBuoy className="h-3 w-3" />
          Canal privé avec l'organisation
        </p>
        <h1 className="font-serif text-xl leading-none mt-0.5">Demander de l'aide</h1>
        <p className="text-[11px] text-muted-foreground mt-1 italic">
          Ce salon est confidentiel : seuls les organisateurs voient tes messages.
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Chargement…
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground italic py-6">
              Pose une question, signale un problème, ou demande à activer ton pouvoir secret.
            </p>
          )}
          {messages.map((m) => {
            const isMine = m.sender_character_id === character.id;
            const isStaff = m.sender_character_id === "gm" || m.sender_character_id === "system";
            return (
              <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className="max-w-[80%]">
                  {!isMine && (
                    <p className="text-[11px] text-muted-foreground ml-2 mb-0.5 font-medium">
                      {isStaff ? "🎭 Organisation" : m.sender_display_name}
                    </p>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-paper",
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : isStaff
                          ? "bg-accent text-accent-foreground border border-accent rounded-bl-sm"
                          : "bg-card text-foreground border border-border rounded-bl-sm",
                    )}
                  >
                    <p>{m.content}</p>
                  </div>
                  <p
                    className={cn(
                      "text-[10px] text-muted-foreground mt-0.5 font-mono",
                      isMine ? "text-right mr-1" : "ml-2",
                    )}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border bg-card/80 backdrop-blur px-3 py-2.5"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Décris ta demande…"
          className="flex-1 bg-background"
          maxLength={500}
        />
        <Button type="submit" size="icon" aria-label="Envoyer" disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
