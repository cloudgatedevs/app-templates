import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async function on mount (and when deps change), tracking loading/error/data.
 * @param {() => Promise<any>} fn
 * @param {any[]} deps
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const mounted = useRef(true);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => {
        if (mounted.current) setState({ loading: false, error: null, data });
      })
      .catch((err) => {
        if (mounted.current) setState({ loading: false, error: err, data: null });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, [run]);

  return { ...state, reload: run };
}
