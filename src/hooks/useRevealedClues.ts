import { useCallback, useEffect, useState } from "react";
import type { CharacterId } from "@/data/mock";

const STORAGE_KEY = "mp:revealed-clues";

function read(): CharacterId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CharacterId[]) : [];
  } catch {
    return [];
  }
}

function emit() {
  window.dispatchEvent(new Event("mp:revealed-clues:change"));
}

export function useRevealedClues() {
  const [revealed, setRevealed] = useState<CharacterId[]>([]);

  useEffect(() => {
    setRevealed(read());
    const sync = () => setRevealed(read());
    window.addEventListener("mp:revealed-clues:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mp:revealed-clues:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const reveal = useCallback((id: CharacterId) => {
    const cur = read();
    if (!cur.includes(id)) {
      const next = [...cur, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      emit();
    }
  }, []);

  const unreveal = useCallback((id: CharacterId) => {
    const next = read().filter((x) => x !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emit();
  }, []);

  return { revealed, isRevealed: (id: CharacterId) => revealed.includes(id), reveal, unreveal };
}
