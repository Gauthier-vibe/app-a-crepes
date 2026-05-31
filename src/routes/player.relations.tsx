import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, KeyRound } from "lucide-react";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { useRevealedClues } from "@/hooks/useRevealedClues";
import { characters, getRelationBetween } from "@/data/mock";

export const Route = createFileRoute("/player/relations")({
  head: () => ({ meta: [{ title: "Relations — Murder Party" }] }),
  component: RelationsPage,
});

function RelationsPage() {
  const { character } = useCurrentCharacter();
  const { isRevealed } = useRevealedClues();
  if (!character) return null;

  const others = characters.filter((c) => c.id !== character.id);
  const showClueMarker = character.isInvestigator;

  return (
    <div className="px-4 pt-5 pb-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Trombinoscope
        </p>
        <h1 className="font-serif text-3xl">Les autres convives</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Touchez un visage pour découvrir ce que vous savez de cette personne.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {others.map((c) => {
          const rel = getRelationBetween(character.id, c.id);
          return (
            <li key={c.id}>
              <Link
                to="/player/relations/$id"
                params={{ id: c.id }}
                className="group block paper-texture rounded-xl border border-border shadow-paper overflow-hidden hover:border-gold transition-colors"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.fullName}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/70 to-transparent" />
                  {c.isInvestigator && (
                    <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      Enquêteur
                    </span>
                  )}
                </div>
                <div className="px-3 pb-3 -mt-7 relative">
                  <p className="font-serif text-lg leading-tight">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{c.profession}</p>
                  {rel && (
                    <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px] text-foreground/80">
                      <span className="italic truncate">{rel.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
