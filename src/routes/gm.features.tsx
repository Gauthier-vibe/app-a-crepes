import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { toast } from "sonner";

export const Route = createFileRoute("/gm/features")({
  head: () => ({ meta: [{ title: "Fonctionnalités — Game Master" }] }),
  component: GmFeaturesPage,
});

function GmFeaturesPage() {
  const { rows, loading, setBetaOnly } = useFeatureFlags();

  const toggle = async (key: string, label: string, next: boolean) => {
    await setBetaOnly(key, next);
    toast.success(
      next
        ? `« ${label} » masqué (réservé aux bêta-testeurs)`
        : `« ${label} » visible par tous les joueurs`,
    );
  };

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <header className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Console d'administration
        </p>
        <h1 className="font-serif text-4xl">Fonctionnalités</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Active ou désactive le mode bêta de chaque fonctionnalité. Quand le mode bêta est activé,
          seuls les bêta-testeurs y ont accès. Sinon, elle est visible par tous les joueurs.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune fonctionnalité enregistrée.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.feature_key}
              className="paper-texture rounded-xl border border-border shadow-paper p-4 flex items-center gap-4"
            >
              <span className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <FlaskConical className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-serif text-lg leading-none">{row.label}</p>
                  {row.beta_only ? (
                    <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-1.5">
                      BÊTA
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      Public
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  {row.feature_key}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {row.beta_only
                    ? "Visible uniquement par les bêta-testeurs."
                    : "Visible par tous les joueurs."}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={row.beta_only}
                  onCheckedChange={(v) => toggle(row.feature_key, row.label, v)}
                  aria-label={`Mode bêta pour ${row.label}`}
                />
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Mode bêta
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
