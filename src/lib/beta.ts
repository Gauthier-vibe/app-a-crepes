import type { CharacterId } from "@/data/mock";

/**
 * Liste des personnages flaggués comme bêta-testeurs.
 * Ces utilisateurs ont accès aux fonctionnalités en mode bêta test.
 */
export const BETA_TESTERS: ReadonlySet<CharacterId> = new Set<CharacterId>([
  "gauthier",
  "victorine",
]);

export function isBetaTester(id: CharacterId | null | undefined): boolean {
  if (!id) return false;
  return BETA_TESTERS.has(id);
}
