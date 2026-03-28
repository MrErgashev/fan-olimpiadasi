"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
}

export function useTimer({ initialSeconds, onExpire }: UseTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const isWarning = seconds <= 300 && seconds > 60; // oxirgi 5 daqiqa
  const isCritical = seconds <= 60; // oxirgi 1 daqiqa

  return { seconds, isRunning, isWarning, isCritical, pause, resume };
}
