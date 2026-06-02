export interface HiddenRoleOption {
  key: string;
  label: string;
}

/**
 * Liste des rôles cachés sélectionnables depuis la console d'administration.
 * La clé `default` permet de revenir au rôle natif du personnage.
 */
export const HIDDEN_ROLE_OPTIONS: HiddenRoleOption[] = [
  { key: "default", label: "Rôle d'origine du personnage" },
  { key: "corbeau", label: "Le Corbeau" },
  { key: "game_master", label: "Game Master" },
  { key: "enqueteur", label: "Enquêteur" },
  { key: "coupable", label: "Coupable" },
  { key: "complice", label: "Complice" },
  { key: "suspect", label: "Suspect" },
  { key: "temoin", label: "Témoin" },
];

export function hiddenRoleLabel(key: string | null | undefined): string | null {
  if (!key || key === "default") return null;
  return HIDDEN_ROLE_OPTIONS.find((o) => o.key === key)?.label ?? key;
}
