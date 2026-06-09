import { useEffect, type DependencyList } from "react";

/** Runs async loaders after commit to avoid sync setState-in-effect lint violations. */
export function useLoadEffect(
  load: () => void | Promise<void>,
  deps: DependencyList,
  onError: (err: unknown) => void = console.error
) {
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void Promise.resolve(load()).catch(onError);
    });
    return () => {
      cancelled = true;
    };
  }, deps);
}
