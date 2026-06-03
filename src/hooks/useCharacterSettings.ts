import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CharacterId } from "@/data/mock";

export interface CharacterSettingsRow {
  character_id: string;
  hidden_role_key: string | null;
  is_beta_tester: boolean;
  updated_at: string;
}

type State = { rows: CharacterSettingsRow[]; loading: boolean };

let state: State = { rows: [], loading: true };
const listeners = new Set<() => void>();
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function start() {
  if (started) return;
  started = true;
  (async () => {
    const { data, error } = await supabase.from("character_settings").select("*");
    if (error) console.error("[useCharacterSettings] fetch error", error);
    setState({ rows: (data ?? []) as CharacterSettingsRow[], loading: false });
  })();

  try {
    channel = supabase
      .channel("character_settings:shared")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "character_settings" },
        (payload) => {
          const prev = state.rows;
          let next = prev;
          if (payload.eventType === "DELETE") {
            const old = payload.old as CharacterSettingsRow;
            next = prev.filter((r) => r.character_id !== old.character_id);
          } else {
            const row = payload.new as CharacterSettingsRow;
            const idx = prev.findIndex((r) => r.character_id === row.character_id);
            if (idx === -1) next = [...prev, row];
            else {
              next = [...prev];
              next[idx] = row;
            }
          }
          setState({ ...state, rows: next });
        },
      )
      .subscribe();
  } catch (err) {
    console.error("[useCharacterSettings] channel error", err);
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return state;
}

export function useCharacterSettings() {
  useEffect(() => {
    start();
  }, []);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const byId = useCallback(
    (id: CharacterId) => snap.rows.find((r) => r.character_id === id) ?? null,
    [snap.rows],
  );

  const upsert = useCallback(
    async (
      id: CharacterId,
      patch: Partial<Omit<CharacterSettingsRow, "character_id" | "updated_at">>,
    ) => {
      const existing = snap.rows.find((r) => r.character_id === id);
      const merged = {
        character_id: id,
        hidden_role_key:
          patch.hidden_role_key !== undefined
            ? patch.hidden_role_key
            : existing?.hidden_role_key ?? null,
        is_beta_tester: patch.is_beta_tester ?? existing?.is_beta_tester ?? false,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("character_settings")
        .upsert(merged, { onConflict: "character_id" });
      if (error) console.error("[useCharacterSettings] upsert error", error);
    },
    [snap.rows],
  );

  return { rows: snap.rows, loading: snap.loading, byId, upsert };
}

