import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CharacterId } from "@/data/mock";

export interface CharacterClueRow {
  character_id: string;
  key_phrase: string | null;
  key_phrase_clue: string | null;
  holder_character_id: string | null;
  delivered: boolean;
  updated_at: string;
}

export function useCharacterClues() {
  const [rows, setRows] = useState<CharacterClueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("character_clues").select("*");
      if (!cancelled) {
        setRows((data ?? []) as CharacterClueRow[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("character_clues:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "character_clues" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as CharacterClueRow;
              return prev.filter((r) => r.character_id !== old.character_id);
            }
            const next = payload.new as CharacterClueRow;
            const idx = prev.findIndex((r) => r.character_id === next.character_id);
            if (idx === -1) return [...prev, next];
            const copy = [...prev];
            copy[idx] = next;
            return copy;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const byId = useCallback(
    (id: CharacterId) => rows.find((r) => r.character_id === id) ?? null,
    [rows],
  );

  const upsert = useCallback(
    async (id: CharacterId, patch: Partial<Omit<CharacterClueRow, "character_id" | "updated_at">>) => {
      const existing = rows.find((r) => r.character_id === id);
      const merged = {
        character_id: id,
        key_phrase: patch.key_phrase ?? existing?.key_phrase ?? null,
        key_phrase_clue: patch.key_phrase_clue ?? existing?.key_phrase_clue ?? null,
        holder_character_id:
          patch.holder_character_id !== undefined
            ? patch.holder_character_id
            : existing?.holder_character_id ?? null,
        delivered: patch.delivered ?? existing?.delivered ?? false,
        updated_at: new Date().toISOString(),
      };
      await supabase.from("character_clues").upsert(merged, { onConflict: "character_id" });
    },
    [rows],
  );

  return { rows, byId, upsert, loading };
}
