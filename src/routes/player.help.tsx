import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, HelpCircle, LifeBuoy, Loader2, Send, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { charactersById, type CharacterId } from "@/data/mock";
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

const QUESTION_PREFIX = "[Q] ";
const SQUAD_CHANNEL = "squad:investigators";
const MAX_QUESTIONS = 3;

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function HelpPage() {
  const { character } = useCurrentCharacter();
  if (!character) return null;

  if (character.isInvestigator) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)]">
        <Tabs defaultValue="organisation" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid grid-cols-2 mx-3 mt-3">
            <TabsTrigger value="organisation" className="gap-1.5">
              <LifeBuoy className="h-3.5 w-3.5" /> Organisation
            </TabsTrigger>
            <TabsTrigger value="commissariat" className="gap-1.5">
              <ShieldQuestion className="h-3.5 w-3.5" /> Commissariat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="organisation" className="flex-1 min-h-0 mt-2">
            <PrivateHelpChat character={character} />
          </TabsContent>
          <TabsContent value="commissariat" className="flex-1 min-h-0 mt-2">
            <InvestigatorSquadChat character={character} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)]">
      <PrivateHelpChat character={character} />
    </div>
  );
}

// ----- Private channel (Organisation) -----
function PrivateHelpChat({ character }: { character: NonNullable<ReturnType<typeof useCurrentCharacter>["character"]> }) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel = `help:${character.id}`;

  useEffect(() => {
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
    <div className="flex flex-col h-full">
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

      {character.isGameMaster && (
        <div className="px-3 py-3">
          <div className="paper-texture rounded-xl border border-primary/40 shadow-paper p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <p className="font-serif text-lg">Console d'administration</p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Tu pilotes la soirée en coulisses. Accède à la vue d'ensemble, au scénario, à la
              modération du chat et aux demandes d'aide des invités.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild size="sm"><Link to="/gm">Vue d'ensemble</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/gm/timeline">Scénario</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/gm/chat">Chat & indices</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/gm/help">Boîte d'aide</Link></Button>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Chargement…
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
                  <p className={cn("text-[10px] text-muted-foreground mt-0.5 font-mono", isMine ? "text-right mr-1" : "ml-2")}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-card/80 backdrop-blur px-3 py-2.5">
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

// ----- Investigator squad channel (Commissariat) -----
function InvestigatorSquadChat({ character }: { character: NonNullable<ReturnType<typeof useCurrentCharacter>["character"]> }) {
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
        .eq("channel", SQUAD_CHANNEL)
        .order("created_at", { ascending: true })
        .limit(1000);
      if (!mounted) return;
      if (error) toast.error("Chat indisponible", { description: error.message });
      else setMessages(data as LiveMessage[]);
      setLoading(false);
    })();

    const sub = supabase
      .channel(`chat_messages:${SQUAD_CHANNEL}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel=eq.${SQUAD_CHANNEL}` },
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

  const questionsUsed = useMemo(
    () =>
      messages.filter((m) => {
        const sender = charactersById[m.sender_character_id as CharacterId];
        return sender?.isInvestigator && m.content.startsWith(QUESTION_PREFIX);
      }).length,
    [messages],
  );
  const questionsLeft = Math.max(0, MAX_QUESTIONS - questionsUsed);

  const sendMessage = async (asQuestion: boolean) => {
    const value = draft.trim();
    if (!value || sending) return;
    if (asQuestion && questionsLeft <= 0) {
      toast.error("Plus de questions disponibles");
      return;
    }
    setSending(true);
    setDraft("");
    const content = asQuestion ? `${QUESTION_PREFIX}${value}` : value;
    const { error } = await supabase.from("chat_messages").insert({
      channel: SQUAD_CHANNEL,
      sender_character_id: character.id,
      sender_display_name: character.name,
      content,
    });
    if (error) {
      toast.error("Message non envoyé", { description: error.message });
      setDraft(value);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-3 border-b border-border bg-card/60">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ShieldQuestion className="h-3 w-3" /> Canal du commissariat
        </p>
        <h1 className="font-serif text-xl leading-none mt-0.5">Enquêteurs &amp; commissaire</h1>
        <p className="text-[11px] text-muted-foreground mt-1 italic leading-snug">
          Chat libre entre enquêteurs. Le commissaire répond uniquement par <strong>oui</strong> ou <strong>non</strong> à vos questions.
          Vous disposez de <strong>{MAX_QUESTIONS} questions au total</strong> (compteur partagé).
          <span className="block mt-0.5 not-italic text-destructive">Interdit&nbsp;: demander si quelqu'un est coupable ou innocent.</span>
        </p>
        <p className="font-mono text-[11px] mt-1.5">
          Questions restantes&nbsp;: <span className={cn("font-bold", questionsLeft === 0 && "text-destructive")}>{questionsLeft} / {MAX_QUESTIONS}</span>
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Chargement…
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground italic py-6">
              Aucun message. Concertez-vous avant de poser une question au commissaire.
            </p>
          )}
          {messages.map((m) => {
            const isMine = m.sender_character_id === character.id;
            const isStaff = m.sender_character_id === "gm" || m.sender_character_id === "system";
            const isQuestion = m.content.startsWith(QUESTION_PREFIX);
            const displayed = isQuestion ? m.content.slice(QUESTION_PREFIX.length) : m.content;
            return (
              <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className="max-w-[80%]">
                  {!isMine && (
                    <p className="text-[11px] text-muted-foreground ml-2 mb-0.5 font-medium">
                      {isStaff ? "👮 Commissaire" : m.sender_display_name}
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
                    {isQuestion && (
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider mb-1 rounded px-1.5 py-0.5",
                        isMine ? "bg-primary-foreground/20" : "bg-muted",
                      )}>
                        <HelpCircle className="h-3 w-3" /> Question
                      </span>
                    )}
                    <p>{displayed}</p>
                  </div>
                  <p className={cn("text-[10px] text-muted-foreground mt-0.5 font-mono", isMine ? "text-right mr-1" : "ml-2")}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(false); }}
        className="flex flex-col gap-2 border-t border-border bg-card/80 backdrop-blur px-3 py-2.5"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Échange avec les autres enquêteurs ou pose une question…"
          className="bg-background"
          maxLength={500}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={sending || !draft.trim()}
          >
            <Send className="h-3.5 w-3.5" /> Message
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={sending || !draft.trim() || questionsLeft <= 0}
            onClick={() => sendMessage(true)}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {questionsLeft <= 0 ? "Quota atteint" : `Poser une question (${questionsLeft})`}
          </Button>
        </div>
      </form>
    </div>
  );
}
