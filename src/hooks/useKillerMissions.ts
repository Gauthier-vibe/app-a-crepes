import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CharacterId } from "@/data/mock";

export interface KillerMissionRow {
  character_id: string;
  target_character_id: string;
  mission: string;
  alive: boolean;
  killed_at: string | null;
  killed_by: string | null;
  kills_count: number;
  updated_at: string;
}

export function useKillerMissions() {
  const [rows, setRows] = useState<KillerMissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("killer_missions" as never).select("*");
      if (!cancelled) {
        setRows(((data ?? []) as unknown) as KillerMissionRow[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("killer_missions:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "killer_missions" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as KillerMissionRow;
              return prev.filter((r) => r.character_id !== old.character_id);
            }
            const next = payload.new as KillerMissionRow;
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

  /**
   * Mark the kill: target is eliminated, killer inherits target's current mission + target.
   * If target's target is the killer himself (self-loop), killer keeps own mission marked done.
   */
  const confirmKill = useCallback(
    async (killerId: CharacterId) => {
      const killer = rows.find((r) => r.character_id === killerId);
      if (!killer || !killer.alive) return;
      const victim = rows.find((r) => r.character_id === killer.target_character_id);
      if (!victim) return;

      const now = new Date().toISOString();

      // Mark victim dead
      await supabase
        .from("killer_missions" as never)
        .update({
          alive: false,
          killed_at: now,
          killed_by: killerId,
          updated_at: now,
        } as never)
        .eq("character_id", victim.character_id);

      // Determine new target/mission for killer
      let newTarget = victim.target_character_id;
      let newMission = victim.mission;

      // If victim was targeting the killer himself, find next alive target by walking the chain
      if (newTarget === killerId) {
        // Killer wins essentially — keep self as target placeholder
        newTarget = killerId;
        newMission = "Tu as bouclé la chaîne. Tu es le dernier Killer en vie !";
      }

      await supabase
        .from("killer_missions" as never)
        .update({
          target_character_id: newTarget,
          mission: newMission,
          kills_count: killer.kills_count + 1,
          updated_at: now,
        } as never)
        .eq("character_id", killerId);
    },
    [rows],
  );

  return { rows, byId, confirmKill, loading };
}
