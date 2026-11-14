'use client';

import { useEffect, useState } from 'react';

/**
 * Debounce a value.
 *
 * A full chart costs about 130 ms. The birth fields are controlled inputs, so
 * without this every keystroke in the minute or second field rebuilt the whole
 * chart — which is what made typing in the form feel heavy. The value settles
 * for `delay` ms before the expensive work runs.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [settled, setSettled] = useState<T>(value);

  useEffect(() => {
    if (Object.is(value, settled)) return;
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
    // `settled` is deliberately not a dependency: it changes only when the
    // timer fires, and including it would restart the timer every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return settled;
}
