import { useCallback, useEffect, useState } from "react";
import { charactersById, type Character, type CharacterId } from "@/data/mock";

const STORAGE_KEY = "mp:current-character";

export function useCurrentCharacter(): {
  character: Character | null;
  setCharacter: (id: CharacterId | null) => void;
  loading: boolean;
} {
  const [character, setCharacterState] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in charactersById) {
        setCharacterState(charactersById[stored as CharacterId]);
      }
    } catch {
      /* noop */
    }
    setLoading(false);
  }, []);

  const setCharacter = useCallback((id: CharacterId | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
      setCharacterState(charactersById[id]);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setCharacterState(null);
    }
  }, []);

  return { character, setCharacter, loading };
}
