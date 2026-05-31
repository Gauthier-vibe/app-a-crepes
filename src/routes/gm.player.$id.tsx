import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Lock, Target, Backpack, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  charactersById,
  getInventoryFor,
  getObjectivesFor,
  getRelationsFor,
  getSecretsFor,
  type CharacterId,
} from "@/data/mock";

export const Route = createFileRoute("/gm/player/$id")({
  head: () => ({ meta: [{ title: "Fiche personnage — Game Master" }] }),
  component: GmPlayerDetail,
});

function GmPlayerDetail() {
  const { id } = useParams({ from: "/gm/player/$id" });
  const character = charactersById[id as CharacterId];

  if (!character) {
    return (
      <div className="p-6">
        Personnage introuvable. <Link to="/gm" className="text-primary underline">Retour</Link>
      </div>
    );
  }

  const secrets = getSecretsFor(character.id);
  const objectives = getObjectivesFor(character.id);
  const inv = getInventoryFor(character.id);
  const rel = getRelationsFor(character.id);

  return (
    <div className="px-5 md:px-8 py-6 max-w-5xl mx-auto">
      <Link to="/gm" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Vue d'ensemble
      </Link>

      <header className="flex items-start gap-4 paper-texture rounded-xl border border-border shadow-paper p-5">
        <img
          src={character.image}
          alt={character.fullName}
          width={256}
          height={256}
          className="h-24 w-24 rounded-full object-cover ring-2 ring-gold shrink-0"
        />
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {character.code}
          </p>
          <h1 className="font-serif text-3xl leading-tight">{character.fullName}</h1>
          <p className="text-sm italic text-muted-foreground">{character.profession}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {character.isInvestigator && <Badge>Enquêteur</Badge>}
            {character.isCulprit && <Badge variant="destructive">Coupable</Badge>}
            {!character.isInvestigator && !character.isCulprit && (
              <Badge variant="outline">Témoin</Badge>
            )}
          </div>
        </div>
      </header>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Panel icon={Lock} title={`Secrets (${secrets.length})`}>
          {secrets.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-3">
              {secrets.map((s) => (
                <li key={s.id}>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 italic">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel icon={Target} title={`Objectifs (${objectives.length})`}>
          <ul className="space-y-2">
            {objectives.map((o) => (
              <li key={o.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
                  <span className="font-medium">{o.title}</span>
                  <span className="text-muted-foreground"> — {o.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel icon={Backpack} title={`Inventaire (${inv.length})`}>
          <ul className="space-y-2 text-sm">
            {inv.map((i) => (
              <li key={i.id}>
                <span className="font-medium">{i.name}</span>
                <span className="text-muted-foreground"> — {i.description}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel icon={Users} title={`Ce que ${character.name} sait des autres (${rel.length})`}>
          <ul className="space-y-2 text-sm">
            {rel.map((r) => (
              <li key={`${r.sourceId}-${r.targetId}`}>
                <span className="font-medium">{charactersById[r.targetId].name}</span>
                <span className="text-muted-foreground"> ({r.label}) — {r.description}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel icon={Lock} title="Anecdote-clé & Indice principal" full>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Thème à évoquer
          </p>
          <p className="text-sm italic mb-3">{character.anecdoteHint}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Indice à délivrer
          </p>
          <p className="text-sm">{character.mainClue}</p>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  full,
  children,
}: {
  icon: typeof Lock;
  title: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`paper-texture rounded-xl border border-border shadow-paper p-4 ${full ? "md:col-span-2" : ""}`}
    >
      <h2 className="flex items-center gap-2 font-serif text-lg mb-2">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground italic">Rien à signaler.</p>;
}
