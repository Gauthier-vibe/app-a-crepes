import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, KeyRound, MessageSquareQuote, Check, FlaskConical } from "lucide-react";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { useRevealedClues } from "@/hooks/useRevealedClues";
import { useCharacterClues } from "@/hooks/useCharacterClues";
import { Button } from "@/components/ui/button";
import { characters, getRelationBetween } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { KillerGameCard } from "@/components/player/KillerGameCard";
import { isBetaTester } from "@/lib/beta";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export const Route = createFileRoute("/player/relations")({
  head: () => ({ meta: [{ title: "Relations — Murder Party" }] }),
  component: RelationsPage,
});

function RelationsPage() {
  const { character } = useCurrentCharacter();
  const { isRevealed } = useRevealedClues();
  const { rows, upsert } = useCharacterClues();
  const { isBetaOnly } = useFeatureFlags();
  if (!character) return null;

  if (isBetaOnly("relations") && !isBetaTester(character.id)) {
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
          L'onglet « Relations » est actuellement réservé aux bêta-testeurs.
          Il sera ouvert à tous les joueurs prochainement.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/player">Retour à ma fiche</Link>
        </Button>
      </div>
    );
  }

  const others = characters.filter((c) => c.id !== character.id);
  const showClueMarker = character.isInvestigator;

  const markDelivered = async (charId: string, name: string) => {
    await upsert(charId as never, { delivered: true });
    toast.success(`Indice de ${name} marqué comme transmis aux enquêteurs.`);
  };

  return (
    <div className="px-4 pt-5 pb-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Trombinoscope
        </p>
        <h1 className="font-serif text-3xl">Les autres convives</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Touchez un nom pour en savoir plus. Les indices à transmettre apparaissent en surbrillance.
        </p>
      </header>

      <KillerGameCard characterId={character.id} />

      <ul className="flex flex-col gap-2.5">
        {others.map((c) => {
          const rel = getRelationBetween(character.id, c.id);
          const clueRow = rows.find((r) => r.character_id === c.id);
          const iAmHolder = clueRow?.holder_character_id === character.id;
          const hasClueToCarry = iAmHolder && !!clueRow?.key_phrase_clue;
          const delivered = clueRow?.delivered ?? false;

          return (
            <li key={c.id}>
              <div
                className={cn(
                  "group block paper-texture rounded-xl border shadow-paper overflow-hidden transition-colors",
                  hasClueToCarry
                    ? delivered
                      ? "border-accent/60 bg-accent/5"
                      : "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-gold",
                )}
              >
                <Link
                  to="/player/relations/$id"
                  params={{ id: c.id }}
                  className="flex items-start gap-3 p-3"
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      width={128}
                      height={128}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-gold"
                    />
                    {showClueMarker && isRevealed(c.id) && (
                      <span
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-paper ring-2 ring-background"
                        title="Indice clé livré"
                      >
                        <KeyRound className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-lg leading-tight truncate">{c.name}</p>
                      {c.isInvestigator && (
                        <span className="font-mono text-[9px] uppercase tracking-widest bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                          Enquêteur
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {c.profession}
                    </p>
                    {rel && (
                      <p className="mt-1 text-xs italic text-foreground/80 line-clamp-2">
                        <span className="not-italic font-medium text-foreground">{rel.label} —</span>{" "}
                        {rel.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
                </Link>

                {hasClueToCarry && (
                  <div className="px-3 pb-3 -mt-1">
                    <div
                      className={cn(
                        "rounded-md border p-2.5",
                        delivered
                          ? "border-accent/60 bg-accent/10"
                          : "border-primary/40 bg-background/70",
                      )}
                    >
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1">
                        <MessageSquareQuote className="h-3 w-3" />
                        Indice à transmettre aux enquêteurs (de {c.name})
                      </p>
                      <p className="text-sm text-foreground leading-snug">
                        « {clueRow!.key_phrase_clue} »
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-muted-foreground italic">
                          {delivered
                            ? "Indice transmis."
                            : "À glisser aux mariés au bon moment."}
                        </p>
                        {!delivered && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              markDelivered(c.id, c.name);
                            }}
                          >
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            J'ai transmis
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
