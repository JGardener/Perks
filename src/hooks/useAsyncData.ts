import { useCallback, useEffect, useEffectEvent, useState } from "react";

export function useAsyncData<T>(fetcher: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  // Starts true: the mount effect fetches immediately, so the first render is
  // already "loading" — no need to flip it synchronously inside the effect.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  // Effect Event: calls the latest `fetcher` without making it an effect
  // dependency — refetching is driven by `attempt` alone.
  const runFetcher = useEffectEvent(() => fetcher());

  useEffect(() => {
    let cancelled = false;
    runFetcher()
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "An error occurred."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attempt]);

  // Reset request state in the event that triggers the refetch, rather than
  // syncing it from inside the effect.
  const retry = useCallback(() => {
    setError("");
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  return { data, loading, error, retry };
}
