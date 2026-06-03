import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureFlagRow {
  feature_key: string;
  label: string;
  beta_only: boolean;
  updated_at: string;
}

type State = { rows: FeatureFlagRow[]; loading: boolean };

let state: State = { rows: [], loading: true };
const listeners = new Set<() => void>();
let started = false;

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function start() {
  if (started) return;
  started = true;
  (async () => {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("label");
    if (error) console.error("[useFeatureFlags] fetch error", error);
    setState({ rows: (data ?? []) as FeatureFlagRow[], loading: false });
  })();

  try {
    supabase
      .channel("feature_flags:shared")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feature_flags" },
        (payload) => {
          const prev = state.rows;
          let next = prev;
          if (payload.eventType === "DELETE") {
            const old = payload.old as FeatureFlagRow;
            next = prev.filter((r) => r.feature_key !== old.feature_key);
          } else {
            const row = payload.new as FeatureFlagRow;
            const idx = prev.findIndex((r) => r.feature_key === row.feature_key);
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
    console.error("[useFeatureFlags] channel error", err);
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

export function useFeatureFlags() {
  useEffect(() => {
    start();
  }, []);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Pendant le chargement initial, on n'a pas encore les flags — par défaut
  // on considère la feature ACCESSIBLE (beta_only = false) pour éviter
  // d'afficher le mur bêta à tort. Une fois chargé, on utilise la vraie valeur.
  const isBetaOnly = useCallback(
    (key: string) => {
      if (snap.loading) return false;
      return snap.rows.find((r) => r.feature_key === key)?.beta_only ?? false;
    },
    [snap.rows, snap.loading],
  );

  const setBetaOnly = useCallback(async (key: string, beta_only: boolean) => {
    const { error } = await supabase
      .from("feature_flags")
      .update({ beta_only, updated_at: new Date().toISOString() })
      .eq("feature_key", key);
    if (error) console.error("[useFeatureFlags] update error", error);
  }, []);

  return { rows: snap.rows, loading: snap.loading, isBetaOnly, setBetaOnly };
}
