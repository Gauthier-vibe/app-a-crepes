import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Feather, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findCharacterByCode, GM_CODE } from "@/data/mock";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Le Drame de Pâte à Crêpes" },
      { name: "description", content: "Entrez votre code d'invitation pour ouvrir votre fiche de personnage." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [code, setCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const { setCharacter } = useCurrentCharacter();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;

    if (value.toUpperCase() === GM_CODE) {
      setUnlocking(true);
      localStorage.setItem("mp:is-gm", "1");
      setTimeout(() => navigate({ to: "/gm" }), 600);
      return;
    }


    const character = findCharacterByCode(value);
    if (!character) {
      toast.error("Code inconnu", { description: "Vérifiez votre carton d'invitation." });
      return;
    }
    setUnlocking(true);
    if (character.isGameMaster) {
      localStorage.setItem("mp:is-gm", "1");
    }
    setTimeout(() => {
      setCharacter(character.id);
      navigate({ to: "/player" });
    }, 600);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 paper-texture" />
      <div className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-paper mb-4">
            <Feather className="h-6 w-6" />
          </div>
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">
            Mariage Agathe & Lucas · Normandie
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground mt-3 leading-tight">
            Le Drame de
            <span className="block italic text-primary">Pâte à Crêpes</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground italic">
            « Un drame terrible vient de se produire.
            <br />
            Une enquête criminelle est ouverte. »
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative paper-texture rounded-xl border border-border shadow-paper p-7"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-card border border-gold rounded-full">
            <span className="font-mono text-[10px] tracking-widest uppercase text-gold-foreground">
              Carton d'invitation
            </span>
          </div>

          <label htmlFor="code" className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Votre code secret
          </label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ex. MARRAINE-004"
            autoComplete="off"
            autoFocus
            className="font-mono text-center text-base tracking-wider uppercase h-12 bg-background"
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Le code figure au dos de votre carton.
          </p>

          <Button type="submit" size="lg" className="w-full mt-6 font-serif text-base" disabled={unlocking}>
            {unlocking ? "Ouverture des sceaux…" : "Ouvrir ma fiche"}
          </Button>

          <div className="mt-5 pt-5 border-t border-border/60 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Organisateur : utilisez votre code dédié pour accéder au dashboard
            </p>
          </div>
        </form>

        <details className="mt-6 text-xs text-muted-foreground">
          <summary className="cursor-pointer text-center hover:text-foreground transition-colors">
            Codes de démo (joueurs)
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-1.5 font-mono text-[11px]">
            {([
              ["MARIEE-001", "Agathe — Enquêtrice"],
              ["MARIE-002", "Lucas — Enquêteur"],
              ["PARRAIN-003", "Arthur"],
              ["MARRAINE-004", "Eugénie"],
              ["PAPY-005", "Papy Hervé"],
              ["TONTON-006", "Gauthier"],
              ["PHOTO-007", "Julie"],
              ["PAPA-008", "Antoine"],
              ["MAMAN-009", "Lénaïc"],
              ["TONTON-010", "Léopold"],
              ["MAMIE-011", "Mamie Christelle"],
              ["MEDIUM-012", "Claire"],
              ["CORBEAU-013", "Victorine"],
            ] as const).map(([c, label]) => (
              <div key={c} className="flex items-center justify-between gap-2 px-2 py-1 bg-muted rounded">
                <code>{c}</code>
                <span className="text-muted-foreground not-italic">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground/80 italic">
            Le code organisateur est transmis en privé à l'animateur.
          </p>
        </details>

      </div>
    </main>
  );
}
