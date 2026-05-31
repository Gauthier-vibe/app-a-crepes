import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Crown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/player/BottomNav";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";

export const Route = createFileRoute("/player")({
  component: PlayerLayout,
});

function PlayerLayout() {
  const { character, loading, setCharacter } = useCurrentCharacter();
  const navigate = useNavigate();
  const [isGm, setIsGm] = useState(false);

  useEffect(() => {
    if (!loading && !character) navigate({ to: "/login" });
  }, [loading, character, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGm(localStorage.getItem("mp:is-gm") === "1");
    }
  }, []);

  if (loading || !character) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Ouverture des sceaux…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-screen-sm flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={character.image}
              alt={character.name}
              loading="lazy"
              width={64}
              height={64}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-gold"
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                Vous incarnez
              </p>
              <p className="font-serif text-base leading-none truncate">{character.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCharacter(null);
                navigate({ to: "/login" });
              }}
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-sm">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
