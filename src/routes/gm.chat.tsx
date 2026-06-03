import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { charactersById, type CharacterId } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gm/chat")({
  head: () => ({ meta: [{ title: "Modération chat — Game Master" }] }),
  component: GmChatPage,
});

interface LiveMessage {
  id: string;
  channel: string;
  sender_character_id: string;
  sender_display_name: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

function GmChatPage() {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel", "global")
        .order("created_at", { ascending: true })
        .limit(500);
      if (!mounted) return;
      if (error) toast.error("Chat indisponible", { description: error.message });
      else setMessages(data as LiveMessage[]);
      setLoading(false);
    })();

    const sub = supabase
      .channel("chat_messages:gm:global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: "channel=eq.global" },
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
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const sendAsCorbeau = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || sending) return;
    setSending(true);
    setDraft("");
    const { error } = await supabase.from("chat_messages").insert({
      channel: "global",
      sender_character_id: "corbeau",
      sender_display_name: "Le Corbeau",
      content: value,
    });
    if (error) {
      toast.error("Message non envoyé", { description: error.message });
      setDraft(value);
    } else {
      toast.success("Message du Corbeau publié");
    }
    setSending(false);
  };

  const broadcastSystem = async () => {
    const { error } = await supabase.from("chat_messages").insert({
      channel: "global",
      sender_character_id: "system",
      sender_display_name: "Système",
      content: "🔔 Nouvelle preuve matérielle remise aux mariés.",
    });
    if (error) toast.error("Annonce non envoyée", { description: error.message });
    else toast.success("Annonce système diffusée");
  };

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      <header className="mb-5 flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Modération
          </p>
          <h1 className="font-serif text-4xl">Chat & indices</h1>
        </div>
        <Button variant="outline" onClick={broadcastSystem}>
          <ShieldAlert className="h-4 w-4 mr-1.5" />
          Diffuser une annonce
        </Button>
      </header>

      <div
        ref={scrollRef}
        className="paper-texture rounded-xl border border-border shadow-paper p-3 max-h-[55vh] overflow-y-auto space-y-2"
      >
        {loading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Chargement des messages…
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground italic py-6">
            Aucun message pour l'instant.
          </p>
        )}
        {messages.map((m) => {
          if (m.sender_character_id === "system")
            return (
              <p
                key={m.id}
                className="font-mono text-[11px] text-center uppercase tracking-widest text-muted-foreground bg-muted/60 rounded-full px-3 py-1 mx-auto w-fit"
              >
                {m.content}
              </p>
            );
          if (m.sender_character_id === "corbeau")
            return (
              <div
                key={m.id}
                className="mx-auto max-w-[80%] rounded-md border border-dashed border-primary/60 bg-primary/5 px-3 py-2"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-0.5">
                  ✉ Le Corbeau · {formatTime(m.created_at)}
                </p>
                {m.content && <p className="font-serif italic text-[15px]">{m.content}</p>}
              </div>
            );
          const sender = charactersById[m.sender_character_id as CharacterId];
          const name = sender?.name ?? m.sender_display_name;
          return (
            <div key={m.id} className="flex gap-2">
              {sender?.image && (
                <img
                  src={sender.image}
                  alt={name}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
                />
              )}
              <div className={cn("flex-1 rounded-md border border-border bg-card px-3 py-1.5")}>
                <p className="text-xs flex items-center gap-2">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {formatTime(m.created_at)}
                  </span>
                </p>
                {m.image_url && (
                  <a href={m.image_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={m.image_url}
                      alt="Image partagée"
                      loading="lazy"
                      className="mt-1 rounded-md max-h-56 w-auto object-cover"
                    />
                  </a>
                )}
                {m.content && <p className="text-sm">{m.content}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendAsCorbeau} className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
          Envoyer un message du Corbeau
        </p>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="« La marraine cache un sac… »"
            className="bg-background"
            maxLength={500}
          />
          <Button type="submit" disabled={sending || !draft.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1.5" />
            )}
            Publier
          </Button>
        </div>
      </form>
    </div>
  );
}
