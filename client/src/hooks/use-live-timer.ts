import { useState, useEffect, useRef } from "react";

/**
 * useLiveTimer — computes elapsed seconds from a startTime ISO string.
 * Updates every second while active.
 */
export const useLiveTimer = (startTime: string | null | undefined) => {
  const getElapsed = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  };

  const [elapsed, setElapsed] = useState(getElapsed);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    setElapsed(getElapsed());
    intervalRef.current = setInterval(() => {
      setElapsed(getElapsed());
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  /**
   * Formats seconds into HH:MM:SS
   */
  const format = (secs: number) => {
    const h = Math.floor(secs / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return {
    elapsed,
    formatted: format(elapsed),
  };
};

/**
 * Formats a duration in seconds into a human-readable string.
 * e.g. 3723 → "1h 2m 3s"
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && h === 0) parts.push(`${s}s`); // only show seconds if < 1 hour
  return parts.join(" ") || "0m";
};

/**
 * Formats total seconds as decimal hours string: "1.50h"
 */
export const formatDecimalHours = (seconds: number): string => {
  return (seconds / 3600).toFixed(2) + "h";
};
