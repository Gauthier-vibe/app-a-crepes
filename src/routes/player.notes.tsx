import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NotebookPen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { toast } from "sonner";

export const Route = createFileRoute("/player/notes")({
  head: () => ({ meta: [{ title: "Carnet — Murder Party" }] }),
  component: NotesPage,
});

function NotesPage() {
  const { character } = useCurrentCharacter();
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

  return (
    <div className="px-4 pt-5 pb-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Carnet d'enquête
          </p>
          <h1 className="font-serif text-3xl leading-tight">Mes notes</h1>
          <p className="text-sm text-muted-foreground">Sauvegardé sur cet appareil.</p>
        </div>
        <Button onClick={save} size="sm" className="shrink-0">
          <Save className="h-4 w-4 mr-1.5" />
          Sauver
        </Button>
      </header>

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
          className="min-h-[60vh] border-0 focus-visible:ring-0 bg-transparent resize-none font-mono text-sm leading-relaxed"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent 0 27px, oklch(0.55 0.1 60 / 0.18) 27px 28px)",
            backgroundAttachment: "local",
          }}
        />
      </div>
    </div>
  );
}
