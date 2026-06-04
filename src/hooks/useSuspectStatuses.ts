import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SuspectStatus = "coupable" | "suspect" | "innocent";

export interface SuspectStatusRow {
  investigator_character_id: string;
  target_character_id: string;
  status: SuspectStatus;
  updated_at: string;
}

type State = { rows: SuspectStatusRow[]; loading: boolean };

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
    const { data, error } = await supabase.from("suspect_statuses").select("*");
    if (error) console.error("[useSuspectStatuses] fetch error", error);
    setState({ rows: (data ?? []) as SuspectStatusRow[], loading: false });
  })();

  try {
    supabase
      .channel("suspect_statuses:shared")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suspect_statuses" },
        (payload) => {
          const prev = state.rows;
          let next = prev;
          const keyOf = (r: { investigator_character_id: string; target_character_id: string }) =>
            `${r.investigator_character_id}::${r.target_character_id}`;
          if (payload.eventType === "DELETE") {
            const old = payload.old as SuspectStatusRow;
            next = prev.filter((r) => keyOf(r) !== keyOf(old));
          } else {
            const row = payload.new as SuspectStatusRow;
            const idx = prev.findIndex((r) => keyOf(r) === keyOf(row));
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
    console.error("[useSuspectStatuses] channel error", err);
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

export function useSuspectStatuses(investigatorId: string | null | undefined) {
  useEffect(() => {
    start();
  }, []);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const statusOf = useCallback(
    (targetId: string): SuspectStatus => {
      if (!investigatorId) return "suspect";
      const row = snap.rows.find(
        (r) =>
          r.investigator_character_id === investigatorId &&
          r.target_character_id === targetId,
      );
      return (row?.status as SuspectStatus) ?? "suspect";
    },
    [snap.rows, investigatorId],
  );

  const setStatus = useCallback(
    async (targetId: string, status: SuspectStatus) => {
      if (!investigatorId) return;
      // Optimistic local update
      const prev = state.rows;
      const idx = prev.findIndex(
        (r) =>
          r.investigator_character_id === investigatorId &&
          r.target_character_id === targetId,
      );
      const optimistic: SuspectStatusRow = {
        investigator_character_id: investigatorId,
        target_character_id: targetId,
        status,
        updated_at: new Date().toISOString(),
      };
      const nextRows = [...prev];
      if (idx === -1) nextRows.push(optimistic);
      else nextRows[idx] = optimistic;
      setState({ ...state, rows: nextRows });

      const { error } = await supabase.from("suspect_statuses").upsert(optimistic, {
        onConflict: "investigator_character_id,target_character_id",
      });
      if (error) console.error("[useSuspectStatuses] upsert error", error);
    },
    [investigatorId],
  );

  return { loading: snap.loading, statusOf, setStatus };
}
