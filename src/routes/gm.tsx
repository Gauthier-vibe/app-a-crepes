import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, LayoutDashboard, MessageCircle, ListChecks, LifeBuoy, LogOut, PanelLeftOpen, PanelLeftClose, User, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { characters, type CharacterId } from "@/data/mock";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gm")({
  head: () => ({ meta: [{ title: "Game Master — Murder Party" }] }),
  component: GmLayout,
});

function GmLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { character, setCharacter } = useCurrentCharacter();
  const [authorized, setAuthorized] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("mp:is-gm") === "1") {
      setAuthorized(true);
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const handleLoginAs = (id: CharacterId) => {
    setCharacter(id);
    navigate({ to: "/player" });
  };

  const handleLogout = () => {
    localStorage.removeItem("mp:is-gm");
    navigate({ to: "/login" });
  };

  if (!authorized) return null;


  const items = [
    { to: "/gm", label: "Vue d'ensemble", icon: LayoutDashboard, match: pathname === "/gm" },
    { to: "/gm/timeline", label: "Scénario", icon: ListChecks, match: pathname.startsWith("/gm/timeline") },
    { to: "/gm/chat", label: "Chat & indices", icon: MessageCircle, match: pathname.startsWith("/gm/chat") },
    { to: "/gm/help", label: "Boîte d'aide", icon: LifeBuoy, match: pathname.startsWith("/gm/help") },
  ] as const;

  return (
    <div className="min-h-screen flex">
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16 items-center" : "w-64",
        )}
      >
        <div className={cn("border-b border-sidebar-border flex items-center justify-between", collapsed ? "px-2 py-4" : "px-5 py-5")}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-paper">
                <Crown className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                  Game Master
                </p>
                <p className="font-serif text-lg leading-none">Pâte à crêpes</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            className={cn("shrink-0", collapsed && "mx-auto")}
            aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        <nav className={cn("flex-1", collapsed ? "p-2" : "p-3")}>
          <ul className="space-y-1">
            {items.map(({ to, label, icon: Icon, match }) => (
              <li key={to}>
                <Link
                  to={to}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md transition-colors",
                    collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm",
                    match
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={cn("border-t border-sidebar-border space-y-1", collapsed ? "p-2" : "p-3")}>
          {!collapsed ? (
            <div className="space-y-1.5 pb-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/60 flex items-center gap-1.5">
                <UserCog className="h-3 w-3" />
                Se connecter en tant que
              </p>
              <Select
                value={character?.id ?? ""}
                onValueChange={(v) => handleLoginAs(v as CharacterId)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choisir un personnage…" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name} <span className="text-muted-foreground">— {c.code}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              title="Se connecter en tant que…"
              className="mx-auto"
            >
              <UserCog className="h-4 w-4" />
            </Button>
          )}
          <Link
            to="/player"
            title={collapsed ? "Mon personnage" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
            )}
          >
            <User className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Mon personnage{character ? ` (${character.name})` : ""}</span>}
          </Link>
          <Button
            variant="ghost"
            className={cn(
              "justify-start text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center px-2",
            )}
            onClick={handleLogout}
            title={collapsed ? "Quitter" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Quitter</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              <Crown className="h-4 w-4" />
            </span>
            <span className="font-serif text-base">GM</span>
          </div>
          <nav className="flex gap-1 items-center">
            {items.map(({ to, label, icon: Icon, match }) => (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={cn(
                  "p-2 rounded-md",
                  match ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
            <Link
              to="/player"
              aria-label="Mon personnage"
              className="p-2 rounded-md text-muted-foreground"
            >
              <User className="h-4 w-4" />
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Quitter">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-12 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
