import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, LayoutDashboard, MessageCircle, ListChecks, LifeBuoy, LogOut, PanelLeftOpen, PanelLeftClose, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gm")({
  head: () => ({ meta: [{ title: "Game Master — Murder Party" }] }),
  component: GmLayout,
});

function GmLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("mp:is-gm") === "1") {
      setAuthorized(true);
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

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
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-5 py-5 border-b border-sidebar-border">
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
        </div>
        <nav className="p-3 flex-1">
          <ul className="space-y-1">
            {items.map(({ to, label, icon: Icon, match }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    match
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}

          >
            <LogOut className="h-4 w-4 mr-2" />
            Quitter
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
          <nav className="flex gap-1">
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
