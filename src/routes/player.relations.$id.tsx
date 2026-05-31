import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MessageSquareQuote } from "lucide-react";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { charactersById, getRelationBetween, type CharacterId } from "@/data/mock";

export const Route = createFileRoute("/player/relations/$id")({
  head: () => ({ meta: [{ title: "Relation — Murder Party" }] }),
  component: RelationDetailPage,
});

function RelationDetailPage() {
  const { character } = useCurrentCharacter();
  const { id } = useParams({ from: "/player/relations/$id" });
  if (!character) return null;

  const target = charactersById[id as CharacterId];
  if (!target) {
    return (
      <div className="px-4 pt-6">
        <p className="text-muted-foreground">Personnage introuvable.</p>
        <Link to="/player/relations" className="text-primary underline">Retour</Link>
      </div>
    );
  }

  const rel = getRelationBetween(character.id, target.id);

  return (
    <div className="pb-6">
      <div className="relative">
        <img
          src={target.image}
          alt={target.fullName}
          width={1024}
          height={1024}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <Link
          to="/player/relations"
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur px-3 py-1.5 text-sm border border-border shadow-paper"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      <div className="px-4 -mt-12 relative">
        <div className="paper-texture rounded-2xl border border-border shadow-paper p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Fiche d'invité
          </p>
          <h1 className="font-serif text-3xl leading-tight">{target.fullName}</h1>
          <p className="text-sm text-muted-foreground italic">{target.profession}</p>

          {rel ? (
            <div className="mt-5 rounded-lg border border-gold/50 bg-gold/5 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquareQuote className="h-4 w-4 text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">
                  Ce que vous savez · {rel.label}
                </p>
              </div>
              <p className="text-[15px] leading-relaxed text-foreground italic">
                « {rel.description} »
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground italic">
              Vous ne connaissez pas vraiment cette personne. Profitez-en pour faire connaissance.
            </p>
          )}

          <div className="mt-5 pt-5 border-t border-border">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Histoire publique
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">{target.publicStory}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
