import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Feather,
  FlaskConical,
  Inbox,
  KeyRound,
  Loader2,
  NotebookPen,
  Save,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSuspectStatuses, type SuspectStatus } from "@/hooks/useSuspectStatuses";
import { characters } from "@/data/mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { useRevealedClues } from "@/hooks/useRevealedClues";
import { charactersById, type Character } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsBetaTester } from "@/lib/beta";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export const Route = createFileRoute("/player/role")({
  head: () => ({ meta: [{ title: "Rôle caché — Murder Party" }] }),
  component: RolePage,
});

function RolePage() {
  const { character } = useCurrentCharacter();
  const { isBetaOnly } = useFeatureFlags();
  const beta = useIsBetaTester(character?.id);
  if (!character) return null;

  if (isBetaOnly("role") && !beta) {
    return (
      <div className="px-4 pt-10 pb-10 max-w-md mx-auto text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <FlaskConical className="h-7 w-7 text-primary" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Bêta test
        </p>
        <h1 className="font-serif text-2xl mb-2">Fonctionnalité en cours de test</h1>
        <p className="text-sm text-muted-foreground">
          L'onglet « Rôle » est actuellement réservé aux bêta-testeurs.
          Il sera ouvert à tous les joueurs prochainement.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/player">Retour à ma fiche</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-4">
      {/* Carte rôle caché */}
      <section className="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-gold/5 p-5 shadow-paper">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-paper">
            <Feather className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Rôle caché — ne pas révéler
            </p>
            <h2 className="font-serif text-2xl leading-tight">{character.hiddenRole.name}</h2>
            <p className="mt-1.5 text-sm">
              <span className="font-medium text-primary">Pouvoir :</span>{" "}
              <span className="text-foreground/90">{character.hiddenRole.power}</span>
            </p>
            <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
              {character.hiddenRole.description}
            </p>
          </div>
        </div>
      </section>

      {character.isInvestigator ? (
        <InvestigatorPanel character={character} />
      ) : character.id === "victorine" ? (
        <CorbeauPanel />
      ) : (
        <DefaultRolePanel character={character} />
      )}
    </div>
  );
}

/* ====================== INVESTIGATOR ====================== */

function InvestigatorPanel({ character }: { character: Character }) {
  const { revealed } = useRevealedClues();
  const [notes, setNotes] = useState("");
  const { statusOf, setStatus } = useSuspectStatuses(character.id);

  useEffect(() => {
    const saved = localStorage.getItem(`mp:notes:${character.id}`);
    if (saved) setNotes(saved);
  }, [character.id]);

  const save = () => {
    localStorage.setItem(`mp:notes:${character.id}`, notes);
    toast.success("Carnet sauvegardé");
  };

  const revealedChars = revealed.map((id) => charactersById[id]).filter((c) => c && !c.isInvestigator);

  const suspectsList = characters
    .filter((c) => !c.isInvestigator && c.id !== character.id)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const coupableCount = suspectsList.filter((c) => statusOf(c.id) === "coupable").length;

  return (
    <Tabs defaultValue="clues" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="clues">
          <KeyRound className="h-4 w-4 mr-1.5" />
          Indices ({revealedChars.length})
        </TabsTrigger>
        <TabsTrigger value="suspects">
          <Users className="h-4 w-4 mr-1.5" />
          Suspects{coupableCount > 0 ? ` (${coupableCount})` : ""}
        </TabsTrigger>
        <TabsTrigger value="notes">
          <NotebookPen className="h-4 w-4 mr-1.5" />
          Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clues" className="mt-4">
        {revealedChars.length === 0 ? (
          <div className="paper-texture rounded-xl border border-dashed border-border p-8 text-center">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 font-serif text-lg">Aucun indice révélé</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Faites parler les invités. Chaque anecdote bien posée débloque un indice clé.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {revealedChars.map((c) => (
              <li key={c.id} className="paper-texture rounded-xl border border-accent/40 shadow-paper p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={c.image}
                    alt={c.name}
                    width={96}
                    height={96}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-accent shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-lg leading-tight">{c.name}</p>
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent text-accent-foreground">
                        <KeyRound className="h-3 w-3" />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{c.profession}</p>
                    <p className="mt-2 text-sm text-foreground">{c.mainClue}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="suspects" className="mt-4">
        <p className="text-xs text-muted-foreground mb-3">
          Classe les invités au fil de ton enquête. Cette liste reste personnelle.
        </p>
        <ul className="space-y-2">
          {suspectsList.map((c) => {
            const current = statusOf(c.id);
            return (
              <li
                key={c.id}
                className="paper-texture rounded-xl border border-border shadow-paper p-3 flex items-center gap-3"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  width={80}
                  height={80}
                  className="h-11 w-11 rounded-full object-cover ring-1 ring-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base leading-tight truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground italic truncate">{c.profession}</p>
                </div>
                <SuspectStatusPicker
                  value={current}
                  onChange={(s) => setStatus(c.id, s)}
                />
              </li>
            );
          })}
        </ul>
      </TabsContent>



      <TabsContent value="notes" className="mt-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">Sauvegardé sur cet appareil.</p>
          <Button onClick={save} size="sm" className="shrink-0">
            <Save className="h-4 w-4 mr-1.5" />
            Sauver
          </Button>
        </div>
        <div className="relative paper-texture rounded-xl border border-border shadow-paper">
          <div className="flex items-center gap-2 border-b border-dashed border-border px-4 py-2">
            <NotebookPen className="h-4 w-4 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Suspects · Indices · Hypothèses
            </span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`— Arthur transpire beaucoup.\n— Eugénie tient son sac comme si sa vie en dépendait.\n— Le Corbeau écrit que…`}
            className="min-h-[50vh] border-0 focus-visible:ring-0 bg-transparent resize-none font-mono text-sm leading-relaxed"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent 0 27px, oklch(0.55 0.1 60 / 0.18) 27px 28px)",
              backgroundAttachment: "local",
            }}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

/* ====================== CORBEAU ====================== */

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

function CorbeauPanel() {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<LiveMessage[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel", "global")
        .eq("sender_character_id", "corbeau")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!mounted) return;
      if (data) setHistory(data as LiveMessage[]);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        channel: "global",
        sender_character_id: "corbeau",
        sender_display_name: "Le Corbeau",
        content: value,
      })
      .select()
      .single();
    if (error) {
      toast.error("Message non envoyé", { description: error.message });
    } else {
      setDraft("");
      if (data) setHistory((h) => [data as LiveMessage, ...h]);
      toast.success("Message du Corbeau publié");
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="paper-texture rounded-xl border border-primary/40 shadow-paper p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
          <Feather className="h-3 w-3" />
          Publier un message anonyme dans le chat
        </p>
        <form onSubmit={send} className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="« La marraine cache un sac… »"
            className="bg-background"
            maxLength={500}
          />
          <Button type="submit" disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-[11px] text-muted-foreground italic mt-2">
          Signé automatiquement « Le Corbeau ». Personne ne doit deviner que c'est toi.
        </p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Tes messages déjà envoyés
        </p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Aucun message envoyé pour l'instant.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((m) => (
              <li
                key={m.id}
                className="rounded-md border border-dashed border-primary/60 bg-primary/5 px-3 py-2"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-0.5">
                  ✉ {formatTime(m.created_at)}
                </p>
                <p className="font-serif italic text-[15px]">{m.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ====================== DEFAULT ====================== */

function DefaultRolePanel({ character }: { character: Character }) {
  return (
    <div className="paper-texture rounded-xl border border-border shadow-paper p-5 space-y-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-gold" />
          Pouvoir
        </p>
        <p className="font-serif text-lg">{character.hiddenRole.power}</p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Consigne
        </p>
        <p className="text-sm">{character.directive}</p>
      </div>
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Comment utiliser ton pouvoir
        </p>
        <p className="text-xs text-foreground/80">
          Va voir un game master en personne, ou envoie-lui un message via l'onglet{" "}
          <strong>Help</strong> pour activer ton pouvoir au bon moment.
        </p>
      </div>
    </div>
  );

/* ====================== SUSPECT STATUS PICKER ====================== */

const SUSPECT_OPTIONS: { value: SuspectStatus; label: string; activeClass: string }[] = [
  {
    value: "coupable",
    label: "Coupable",
    activeClass: "bg-destructive text-destructive-foreground border-destructive",
  },
  {
    value: "suspect",
    label: "Suspect",
    activeClass: "bg-muted text-foreground border-border",
  },
  {
    value: "innocent",
    label: "Innocent",
    activeClass: "bg-accent text-accent-foreground border-accent",
  },
];

function SuspectStatusPicker({
  value,
  onChange,
}: {
  value: SuspectStatus;
  onChange: (s: SuspectStatus) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden shrink-0">
      {SUSPECT_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors border-r last:border-r-0 border-border",
              active
                ? opt.activeClass
                : "bg-background text-muted-foreground hover:bg-muted/60",
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

