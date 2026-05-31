import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookText,
  Lock,
  Backpack,
  Sparkles,
  ChevronRight,
  KeyRound,
  Eye,
  EyeOff,
  ShieldQuestion,
  Drama,
  Save,
  MessageSquareQuote,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { useRevealedClues } from "@/hooks/useRevealedClues";
import { useCharacterClues } from "@/hooks/useCharacterClues";
import {
  charactersById,
  getInventoryFor,
  getSecretsFor,
  type Secret,
} from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/player/")({
  head: () => ({
    meta: [{ title: "Ma fiche — Murder Party" }],
  }),
  component: FichePage,
});

function FichePage() {
  const { character } = useCurrentCharacter();
  const { isRevealed, reveal, unreveal } = useRevealedClues();
  const { byId, upsert } = useCharacterClues();
  const [openSecret, setOpenSecret] = useState<Secret | null>(null);
  const [phrase, setPhrase] = useState("");
  const [clue, setClue] = useState("");
  const [saving, setSaving] = useState(false);

  const stored = character ? byId(character.id) : null;
  useEffect(() => {
    if (stored) {
      setPhrase(stored.key_phrase ?? "");
      setClue(stored.key_phrase_clue ?? "");
    }
  }, [stored?.character_id, stored?.key_phrase, stored?.key_phrase_clue]);

  if (!character) return null;
  const secrets = getSecretsFor(character.id);
  const items = getInventoryFor(character.id);
  const clueRevealed = isRevealed(character.id);
  const hasKeyClue = !character.isInvestigator && character.anecdoteHint !== "—";
  const holder = stored?.holder_character_id
    ? charactersById[stored.holder_character_id as keyof typeof charactersById]
    : null;

  const savePhrase = async () => {
    if (!character) return;
    setSaving(true);
    try {
      await upsert(character.id, {
        key_phrase: phrase.trim() || null,
        key_phrase_clue: clue.trim() || null,
      });
      toast.success("Phrase clé et indice enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-6">
      {/* Carte profil */}
      <section className="relative paper-texture rounded-2xl border border-border shadow-paper p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-gold to-primary/40 blur-sm opacity-60" />
            <img
              src={character.image}
              alt={character.name}
              width={256}
              height={256}
              className="relative h-24 w-24 rounded-full object-cover ring-2 ring-gold"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Personnage
            </p>
            <h1 className="font-serif text-3xl leading-tight text-foreground">
              {character.name}
            </h1>
            <p className="text-sm text-muted-foreground italic mt-0.5">
              {character.profession}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {character.isInvestigator ? (
                <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                  Enquêteur·rice en chef
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gold text-foreground">
                  Invité·e suspect·e
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Histoire publique */}
      <section className="paper-texture rounded-2xl border border-border shadow-paper p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <BookText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Histoire publique
            </p>
            <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
              {character.publicStory}
            </p>
          </div>
        </div>
      </section>

      {/* Alibi & consigne de jeu (suspects uniquement) */}
      {!character.isInvestigator && (
        <section className="grid grid-cols-1 gap-3">
          <div className="paper-texture rounded-2xl border border-border shadow-paper p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <ShieldQuestion className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ton alibi (à raconter)
                </p>
                <p className="mt-1 text-sm italic text-foreground/90 leading-relaxed">
                  {character.alibi}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-accent/50 bg-accent/10 p-4 shadow-paper">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Drama className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Consigne pour la soirée
                </p>
                <p className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {character.directive}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Indice clé */}
      {hasKeyClue && (
        <section
          className={cn(
            "relative rounded-2xl border p-5 shadow-paper transition-colors",
            clueRevealed
              ? "border-accent/60 bg-accent/10"
              : "border-dashed border-gold/60 bg-gold/5",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-paper",
                clueRevealed
                  ? "bg-accent text-accent-foreground"
                  : "bg-gold text-gold-foreground",
              )}
            >
              <KeyRound className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Ton indice clé
              </p>
              <h2 className="font-serif text-xl leading-tight mt-0.5">
                Ton anecdote personnelle
              </h2>
              <p className="mt-2 text-sm text-foreground/90">{character.anecdoteHint}</p>

              <div className="mt-3 rounded-md border border-border bg-background/70 p-3 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ta phrase clé (à personnaliser)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Si un·e enquêteur·rice prononce cette phrase, tu livres ton indice ci-dessous.
                </p>
                <Input
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  placeholder="Ex. : « Tu te souviens de notre voyage à Bali ? »"
                  className="text-sm italic"
                />
              </div>

              <div className="mt-3 rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <MessageSquareQuote className="h-3 w-3" />
                  Indice phrase-clé (transmis par un autre)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {holder
                    ? `Cet indice sera transmis aux enquêteurs par ${holder.name}.`
                    : "Un autre invité transmettra cet indice aux enquêteurs."}
                </p>
                <Textarea
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  placeholder="Décris en une phrase l'indice qui permettra aux enquêteurs de deviner ta phrase clé."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={savePhrase} disabled={saving}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Enregistrement…" : "Enregistrer phrase & indice"}
                </Button>
              </div>

              <div className="mt-3 rounded-md border border-border bg-background/70 p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Indice à livrer (si ta phrase clé est prononcée)
                </p>
                <p className="text-sm text-foreground">{character.mainClue}</p>
              </div>


              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground italic">
                  {clueRevealed
                    ? "Indice livré aux enquêteurs."
                    : "À livrer uniquement si on prononce ta phrase clé."}
                </p>
                {clueRevealed ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unreveal(character.id)}
                  >
                    <EyeOff className="h-4 w-4 mr-1.5" />
                    Annuler
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => reveal(character.id)}>
                    <Eye className="h-4 w-4 mr-1.5" />
                    J'ai livré mon indice
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Accordéons */}
      <Accordion type="multiple" className="space-y-3">

        <AccordionShell
          value="secrets"
          icon={Lock}
          label="Mes sombres secrets"
          count={secrets.length}
          tone="primary"
        >
          {secrets.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Aucun secret. Tu es la pureté incarnée.
            </p>
          ) : (
            <ul className="space-y-2">
              {secrets.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setOpenSecret(s)}
                    className="w-full flex items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="font-medium text-sm truncate">{s.title}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AccordionShell>

        <AccordionShell value="inventory" icon={Backpack} label="Mon inventaire" count={items.length}>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Les poches vides.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="rounded-md border border-border bg-background/60 p-3"
                >
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    {i.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{i.description}</p>
                </li>
              ))}
            </ul>
          )}
        </AccordionShell>
      </Accordion>

      <Dialog open={!!openSecret} onOpenChange={(o) => !o && setOpenSecret(null)}>
        <DialogContent className="max-w-md paper-texture border-primary/30">
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2 shadow-paper">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="font-serif text-2xl text-center">
              {openSecret?.title}
            </DialogTitle>
            <DialogDescription className="text-center font-mono text-[10px] tracking-widest uppercase">
              Lettre cachetée — pour vos yeux seulement
            </DialogDescription>
          </DialogHeader>
          <div className="border-y border-dashed border-border py-4 my-2">
            <p className="text-[15px] leading-relaxed text-foreground italic">
              {openSecret?.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccordionShell({
  value,
  icon: Icon,
  label,
  count,
  tone,
  children,
}: {
  value: string;
  icon: typeof BookText;
  label: string;
  count?: number;
  tone?: "primary";
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="paper-texture rounded-xl border border-border shadow-paper px-4 [&[data-state=open]]:shadow-paper"
    >
      <AccordionTrigger className="py-3.5 hover:no-underline">
        <span className="flex items-center gap-2.5 text-left">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              tone === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg leading-none">{label}</span>
          {typeof count === "number" && (
            <Badge variant="secondary" className="ml-1">
              {count}
            </Badge>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}
