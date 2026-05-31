import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock, PlayCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeline as seed, type TimelineStep } from "@/data/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gm/timeline")({
  head: () => ({ meta: [{ title: "Scénario — Game Master" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const [steps, setSteps] = useState<TimelineStep[]>(seed);

  const triggerStep = (id: string) => {
    setSteps((s) =>
      s.map((step, idx, arr) => {
        if (step.id === id) return { ...step, status: "done" as const };
        if (arr.findIndex((x) => x.id === id) + 1 === idx && step.status === "locked")
          return { ...step, status: "ready" as const };
        return step;
      }),
    );
    toast.success("Étape déclenchée", {
      description: "Les indices ont été distribués aux joueurs concernés.",
    });
  };

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Fil rouge de la soirée
        </p>
        <h1 className="font-serif text-4xl">Scénario</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Déclenchez les étapes au bon moment du repas. Chacune débloque des indices auprès des bons invités.
        </p>
      </header>

      <ol className="relative space-y-4 border-l-2 border-dashed border-gold/50 pl-6">
        {steps.map((step) => (
          <li key={step.id} className="relative">
            <span
              className={cn(
                "absolute -left-[34px] top-1 h-6 w-6 rounded-full flex items-center justify-center border-2",
                step.status === "done" && "bg-accent border-accent text-accent-foreground",
                step.status === "ready" && "bg-primary border-primary text-primary-foreground animate-pulse",
                step.status === "locked" && "bg-muted border-border text-muted-foreground",
              )}
            >
              {step.status === "done" ? (
                <Check className="h-3.5 w-3.5" />
              ) : step.status === "ready" ? (
                <Sparkles className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
            </span>

            <div className="paper-texture rounded-xl border border-border shadow-paper p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {step.trigger}
                  </p>
                  <h2 className="font-serif text-xl">{step.title}</h2>
                </div>
                <Badge
                  variant={step.status === "done" ? "secondary" : step.status === "ready" ? "default" : "outline"}
                >
                  {step.status === "done" ? "Terminée" : step.status === "ready" ? "À déclencher" : "Verrouillée"}
                </Badge>
              </div>
              <p className="text-sm text-foreground/85 mt-2">{step.description}</p>
              {step.status === "ready" && (
                <Button size="sm" className="mt-3" onClick={() => triggerStep(step.id)}>
                  <PlayCircle className="h-4 w-4 mr-1.5" />
                  Déclencher l'étape
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
