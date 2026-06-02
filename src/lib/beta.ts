import type { CharacterId } from "@/data/mock";
import { useCharacterSettings } from "@/hooks/useCharacterSettings";

/**
 * Liste de secours des personnages flaggués bêta-testeurs.
 * Les overrides définis dans la console d'admin (table character_settings)
 * sont prioritaires — voir useIsBetaTester().
 */
export const BETA_TESTERS: ReadonlySet<CharacterId> = new Set<CharacterId>([
  "gauthier",
  "victorine",
]);

export function isBetaTester(id: CharacterId | null | undefined): boolean {
  if (!id) return false;
  return BETA_TESTERS.has(id);
}

/**
 * Vrai si le personnage est marqué bêta-testeur, soit via override admin,
 * soit via la liste statique de secours.
 */
export function useIsBetaTester(id: CharacterId | null | undefined): boolean {
  const { byId } = useCharacterSettings();
  if (!id) return false;
  const override = byId(id);
  if (override) return override.is_beta_tester;
  return BETA_TESTERS.has(id);
}
