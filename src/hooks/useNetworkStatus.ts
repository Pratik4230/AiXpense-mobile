import { useEffect, useMemo, useState } from "react";
import * as Network from "expo-network";

/**
 * True when the device can likely reach the API.
 * Unknown reachability counts as online to avoid false offline queues.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Network.getNetworkStateAsync().then((state) => {
      if (cancelled) return;
      setIsConnected(state.isConnected ?? null);
      setIsInternetReachable(state.isInternetReachable ?? null);
      setReady(true);
    });

    const sub = Network.addNetworkStateListener((state) => {
      setIsConnected(state.isConnected ?? null);
      setIsInternetReachable(state.isInternetReachable ?? null);
      setReady(true);
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const isOnline = useMemo(() => {
    if (isConnected === false) return false;
    if (isInternetReachable === false) return false;
    return true;
  }, [isConnected, isInternetReachable]);

  return { isOnline, ready };
}
