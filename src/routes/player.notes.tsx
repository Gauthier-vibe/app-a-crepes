import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NotebookPen, Save, KeyRound, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { useRevealedClues } from "@/hooks/useRevealedClues";
import { charactersById } from "@/data/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/player/notes")({
  head: () => ({ meta: [{ title: "Carnet d'enquête — Murder Party" }] }),
  component: NotesPage,
});

function NotesPage() {
  const { character } = useCurrentCharacter();
  const { revealed } = useRevealedClues();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!character) return;
    if (!character.isInvestigator) {
      navigate({ to: "/player" });
      return;
    }
    const saved = localStorage.getItem(`mp:notes:${character.id}`);
    if (saved) setNotes(saved);
  }, [character, navigate]);

  if (!character || !character.isInvestigator) return null;

  const save = () => {
    localStorage.setItem(`mp:notes:${character.id}`, notes);
    toast.success("Carnet sauvegardé");
  };

  const revealedChars = revealed
    .map((id) => charactersById[id])
    .filter((c) => c && !c.isInvestigator);

  return (
    <div className="px-4 pt-5 pb-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Espace enquêteur·rice
        </p>
        <h1 className="font-serif text-3xl leading-tight">Carnet d'enquête</h1>
      </header>

      <Tabs defaultValue="clues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clues">
            <KeyRound className="h-4 w-4 mr-1.5" />
            Indices ({revealedChars.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            <NotebookPen className="h-4 w-4 mr-1.5" />
            Mes notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clues" className="mt-4">
          {revealedChars.length === 0 ? (
            <div className="paper-texture rounded-xl border border-dashed border-border p-8 text-center">
              <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-3 font-serif text-lg">Aucun indice révélé</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Faites parler les invités. Chaque anecdote personnelle bien posée
                débloque un indice clé.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {revealedChars.map((c) => (
                <li
                  key={c.id}
                  className="paper-texture rounded-xl border border-accent/40 shadow-paper p-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={c.image}
                      alt={c.fullName}
                      width={96}
                      height={96}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-accent shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-serif text-lg leading-tight">{c.fullName}</p>
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent text-accent-foreground">
                          <KeyRound className="h-3 w-3" />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">{c.profession}</p>
                      <p className="mt-2 text-sm text-foreground">{c.mainClue}</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Anecdote déclenchante
                      </p>
                      <p className="text-xs text-foreground/80 italic">{c.anecdoteHint}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
              className="min-h-[55vh] border-0 focus-visible:ring-0 bg-transparent resize-none font-mono text-sm leading-relaxed"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent 0 27px, oklch(0.55 0.1 60 / 0.18) 27px 28px)",
                backgroundAttachment: "local",
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
