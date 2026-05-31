import { useState } from "react";
import { Crosshair, Skull, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { charactersById, type CharacterId } from "@/data/mock";
import { useKillerMissions } from "@/hooks/useKillerMissions";
import { toast } from "sonner";

export function KillerGameCard({ characterId }: { characterId: CharacterId }) {
  const { byId, confirmKill, loading } = useKillerMissions();
  const [open, setOpen] = useState(false);
  const row = byId(characterId);

  if (loading || !row) return null;

  const isAlive = row.alive;
  const isWinner = row.target_character_id === characterId && isAlive;
  const target = charactersById[row.target_character_id as CharacterId];

  return (
    <section className="paper-texture rounded-2xl border border-border shadow-paper p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-8 w-8 rounded-md bg-foreground text-background flex items-center justify-center">
          <Crosshair className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Jeu du Killer
          </p>
          <h2 className="font-serif text-xl leading-tight">Mission secrète</h2>
        </div>
        {row.kills_count > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2 py-0.5 text-[11px] font-mono">
            <Skull className="h-3 w-3" />
            {row.kills_count}
          </span>
        )}
      </div>

      {!isAlive ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-center">
          <Skull className="h-6 w-6 mx-auto text-destructive mb-1" />
          <p className="font-serif text-lg">Tu as été éliminé·e</p>
          {row.killed_by && (
            <p className="text-xs text-muted-foreground italic mt-1">
              par {charactersById[row.killed_by as CharacterId]?.name ?? "un·e inconnu·e"}
            </p>
          )}
        </div>
      ) : isWinner ? (
        <div className="rounded-lg border border-gold bg-gold/10 p-3 text-center">
          <Trophy className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="font-serif text-lg">Tu es le·la dernier·e Killer en vie !</p>
          <p className="text-xs text-muted-foreground italic mt-1">{row.mission}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-3">
            <img
              src={target?.image}
              alt={target?.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-gold shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Ta cible
              </p>
              <p className="font-serif text-base leading-tight truncate">
                {target?.name ?? "—"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{target?.profession}</p>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-primary/40 bg-primary/5 p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
              Ta mission
            </p>
            <p className="text-sm text-foreground leading-snug">« {row.mission} »</p>
          </div>

          <Button
            className="w-full mt-3"
            variant="default"
            onClick={() => setOpen(true)}
          >
            <Skull className="h-4 w-4 mr-2" />
            J'ai éliminé ma cible
          </Button>

          <p className="mt-2 text-[11px] text-muted-foreground italic text-center">
            Tu hériteras de sa cible et de sa mission en cours.
          </p>
        </>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'élimination</AlertDialogTitle>
            <AlertDialogDescription>
              Tu confirmes avoir accompli ta mission sur{" "}
              <strong>{target?.name}</strong> ? Cette action est irréversible : sa cible
              et sa mission deviendront les tiennes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await confirmKill(characterId);
                toast.success(`Tu as éliminé ${target?.name}. Nouvelle cible attribuée.`);
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
