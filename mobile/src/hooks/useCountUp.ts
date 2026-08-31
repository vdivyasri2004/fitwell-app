import { useEffect, useRef, useState } from 'react';

// Animated count-up hook. Returns the current animated integer toward `target`,
// ticking smoothly over `duration`. Works on web and native without requiring a
// native animation driver, so it's safe for both platforms.
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const durationRef = useRef(duration);
  durationRef.current = duration;

  useEffect(() => {
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationRef.current);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(from + delta * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      fromRef.current = target;
    };
  }, [target]);

  return value;
}
