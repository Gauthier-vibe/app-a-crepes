import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Users, MessageCircle, VenetianMask, LifeBuoy } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { isBetaTester } from "@/lib/beta";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

type NavItem = {
  to: "/player" | "/player/relations" | "/player/chat" | "/player/role" | "/player/help";
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  match: (path: string) => boolean;
  featureKey?: string;
};

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { character } = useCurrentCharacter();
  const beta = isBetaTester(character?.id);
  const { isBetaOnly } = useFeatureFlags();

  const allItems: NavItem[] = [
    { to: "/player", label: "Fiche", icon: BookOpen, match: (p) => p === "/player" || p === "/player/" },
    { to: "/player/relations", label: "Relations", icon: Users, match: (p) => p.startsWith("/player/relations"), featureKey: "relations" },
    { to: "/player/chat", label: "Chat", icon: MessageCircle, match: (p) => p.startsWith("/player/chat") },
    { to: "/player/role", label: "Rôle", icon: VenetianMask, match: (p) => p.startsWith("/player/role"), featureKey: "role" },
    { to: "/player/help", label: "Help", icon: LifeBuoy, match: (p) => p.startsWith("/player/help") },
  ];
  const items = allItems.filter((i) => !i.featureKey || beta || !isBetaOnly(i.featureKey));

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-4px_16px_-8px_oklch(0.2_0.04_40/0.15)]"
      aria-label="Navigation principale"
    >
      <ul
        className="grid mx-auto max-w-screen-sm"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    active && "bg-primary/10",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {active && (
                    <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
