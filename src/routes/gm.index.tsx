import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Sparkles, UserCog, MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { characters, type CharacterId } from "@/data/mock";
import { useCharacterClues } from "@/hooks/useCharacterClues";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { toast } from "sonner";

export const Route = createFileRoute("/gm/")({
  head: () => ({ meta: [{ title: "Vue d'ensemble — Game Master" }] }),
  component: GmDashboard,
});

function GmDashboard() {
  const [cluesUnlocked] = useState<Record<string, number>>({});
  const { byId, upsert } = useCharacterClues();
  const { setCharacter } = useCurrentCharacter();
  const navigate = useNavigate();

  const loginAs = (id: CharacterId, name: string) => {
    setCharacter(id);
    toast.success(`Connecté en tant que ${name}`);
    navigate({ to: "/player" });
  };

  const assignHolder = async (charId: CharacterId, holderId: string) => {
    await upsert(charId, { holder_character_id: holderId === "__none" ? null : holderId });
    toast.success("Porteur d'indice mis à jour");
  };


  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <header className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Mariage Agathe & Lucas — Normandie
        </p>
        <h1 className="font-serif text-4xl">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          {characters.length} personnages connectés · 2 enquêteurs · 2 coupables
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Joueurs actifs" value="9" />
        <StatCard label="Indices envoyés" value={String(Object.values(cluesUnlocked).reduce((a, b) => a + b, 0))} />
        <StatCard label="Étape en cours" value="2 / 4" />
        <StatCard label="Messages chat" value="11" />
      </section>

      <h2 className="font-serif text-2xl mb-3">Personnages</h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map((c) => {
          const row = byId(c.id);
          return (
            <li
              key={c.id}
              className="paper-texture rounded-xl border border-border shadow-paper p-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={c.image}
                  alt={c.name}
                  width={128}
                  height={128}
                  loading="lazy"
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-gold shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-serif text-lg leading-none">{c.name}</p>
                    {c.isInvestigator && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-1.5">
                        ENQ
                      </Badge>
                    )}
                    {c.isCulprit && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                        Coupable
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{c.profession}</p>
                  <p className="font-mono text-[10px] mt-1 text-muted-foreground">{c.code}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-gold" /> {cluesUnlocked[c.id] ?? 0} indice(s) envoyés
                </span>
              </div>


              {!c.isInvestigator && (
                <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                    <MessageSquareQuote className="h-3 w-3" />
                    Porteur de son indice phrase-clé
                  </p>
                  <Select
                    value={row?.holder_character_id ?? "__none"}
                    onValueChange={(v) => assignHolder(c.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— Aucun —</SelectItem>
                      {characters
                        .filter((other) => other.id !== c.id && !other.isInvestigator)
                        .map((other) => (
                          <SelectItem key={other.id} value={other.id}>
                            {other.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link to="/gm/player/$id" params={{ id: c.id }}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Fiche
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => sendClue(c.id, c.name)}
                >
                  <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Indice
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="paper-texture rounded-xl border border-border shadow-paper p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-serif text-3xl mt-1">{value}</p>
    </div>
  );
}
