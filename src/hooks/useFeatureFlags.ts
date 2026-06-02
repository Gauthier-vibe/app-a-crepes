import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureFlagRow {
  feature_key: string;
  label: string;
  beta_only: boolean;
  updated_at: string;
}

export function useFeatureFlags() {
  const [rows, setRows] = useState<FeatureFlagRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("feature_flags").select("*").order("label");
      if (!cancelled) {
        setRows((data ?? []) as FeatureFlagRow[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("feature_flags:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feature_flags" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as FeatureFlagRow;
              return prev.filter((r) => r.feature_key !== old.feature_key);
            }
            const next = payload.new as FeatureFlagRow;
            const idx = prev.findIndex((r) => r.feature_key === next.feature_key);
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

  const isBetaOnly = useCallback(
    (key: string) => rows.find((r) => r.feature_key === key)?.beta_only ?? true,
    [rows],
  );

  const setBetaOnly = useCallback(async (key: string, beta_only: boolean) => {
    await supabase
      .from("feature_flags")
      .update({ beta_only, updated_at: new Date().toISOString() })
      .eq("feature_key", key);
  }, []);

  return { rows, loading, isBetaOnly, setBetaOnly };
}
