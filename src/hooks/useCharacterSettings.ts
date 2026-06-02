import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CharacterId } from "@/data/mock";

export interface CharacterSettingsRow {
  character_id: string;
  hidden_role_key: string | null;
  is_beta_tester: boolean;
  updated_at: string;
}

export function useCharacterSettings() {
  const [rows, setRows] = useState<CharacterSettingsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("character_settings").select("*");
      if (!cancelled) {
        setRows((data ?? []) as CharacterSettingsRow[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("character_settings:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "character_settings" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as CharacterSettingsRow;
              return prev.filter((r) => r.character_id !== old.character_id);
            }
            const next = payload.new as CharacterSettingsRow;
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
    async (
      id: CharacterId,
      patch: Partial<Omit<CharacterSettingsRow, "character_id" | "updated_at">>,
    ) => {
      const existing = rows.find((r) => r.character_id === id);
      const merged = {
        character_id: id,
        hidden_role_key:
          patch.hidden_role_key !== undefined
            ? patch.hidden_role_key
            : existing?.hidden_role_key ?? null,
        is_beta_tester: patch.is_beta_tester ?? existing?.is_beta_tester ?? false,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("character_settings")
        .upsert(merged, { onConflict: "character_id" });
    },
    [rows],
  );

  return { rows, loading, byId, upsert };
}
