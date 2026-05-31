import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookText,
  Lock,
  Target,
  Backpack,
  Sparkles,
  ChevronRight,
  Check,
  X,
  Clock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import {
  getInventoryFor,
  getObjectivesFor,
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
  const [openSecret, setOpenSecret] = useState<Secret | null>(null);

  if (!character) return null;
  const secrets = getSecretsFor(character.id);
  const objectives = getObjectivesFor(character.id);
  const items = getInventoryFor(character.id);

  return (
    <div className="px-4 pt-5 pb-6 space-y-6">
      {/* Carte profil */}
      <section className="relative paper-texture rounded-2xl border border-border shadow-paper p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-gold to-primary/40 blur-sm opacity-60" />
            <img
              src={character.image}
              alt={character.fullName}
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
              {character.fullName}
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

        {!character.isInvestigator && character.anecdoteHint !== "—" && (
          <div className="mt-5 rounded-lg border border-dashed border-gold/60 bg-gold/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold-foreground/80 mb-1">
              Ton anecdote-clé
            </p>
            <p className="text-sm text-foreground">{character.anecdoteHint}</p>
            <p className="text-xs text-muted-foreground mt-1.5 italic">
              Si les mariés évoquent ce souvenir avec toi, tu peux leur livrer ton indice principal.
            </p>
          </div>
        )}
      </section>

      {/* Accordéons */}
      <Accordion type="multiple" defaultValue={["story"]} className="space-y-3">
        <AccordionShell value="story" icon={BookText} label="Histoire publique">
          <p className="text-sm leading-relaxed text-foreground/90">{character.publicStory}</p>
        </AccordionShell>

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

        <AccordionShell
          value="objectives"
          icon={Target}
          label="Mes objectifs"
          count={objectives.length}
        >
          <ul className="space-y-2.5">
            {objectives.map((o) => (
              <li
                key={o.id}
                className="rounded-md border border-border bg-background/60 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <ObjectiveStatusBadge status={o.status} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{o.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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

function ObjectiveStatusBadge({ status }: { status: "pending" | "done" | "failed" }) {
  if (status === "done")
    return (
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shrink-0">
        <Check className="h-3 w-3" />
      </span>
    );
  if (status === "failed")
    return (
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shrink-0">
        <X className="h-3 w-3" />
      </span>
    );
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
      <Clock className="h-3 w-3" />
    </span>
  );
}
