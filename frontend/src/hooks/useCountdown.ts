import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffToParts(targetMs: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/**
 * Ticks a countdown to `targetDate` every second. Pure presentational timing
 * utility — carries no wedding/domain logic, so it is safe to reuse anywhere
 * a countdown to a date is needed.
 */
export function useCountdown(targetDate: Date): CountdownParts {
  const targetMs = targetDate.getTime();
  const [parts, setParts] = useState<CountdownParts>(() => diffToParts(targetMs));

  useEffect(() => {
    setParts(diffToParts(targetMs));

    const intervalId = setInterval(() => {
      setParts(diffToParts(targetMs));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetMs]);

  return parts;
}
