"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseSecurityProps {
  attemptId: string;
  enabled: boolean;
}

type SecurityEventType =
  | "TAB_SWITCH"
  | "FULLSCREEN_EXIT"
  | "COPY_ATTEMPT"
  | "RIGHT_CLICK"
  | "KEYBOARD_SHORTCUT"
  | "WINDOW_BLUR"
  | "DEVTOOLS_OPEN";

export function useSecurity({ attemptId, enabled }: UseSecurityProps) {
  const logQueue = useRef<{ type: SecurityEventType; details?: Record<string, unknown> }[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  const sendEvents = useCallback(async () => {
    if (logQueue.current.length === 0) return;
    const events = [...logQueue.current];
    logQueue.current = [];

    try {
      await fetch("/api/student/security-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, events }),
      });
    } catch {
      // Qayta qo'shish
      logQueue.current.push(...events);
    }
  }, [attemptId]);

  const logEvent = useCallback(
    (type: SecurityEventType, details?: Record<string, unknown>) => {
      logQueue.current.push({ type, details });
      // 2 sekunddan keyin yuborish (batch)
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(sendEvents, 2000);
    },
    [sendEvents]
  );

  useEffect(() => {
    if (!enabled) return;

    // 1. Fullscreen
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logEvent("FULLSCREEN_EXIT");
      }
    };

    // 2. Tab switch / visibility
    const onVisibilityChange = () => {
      if (document.hidden) {
        logEvent("TAB_SWITCH");
      }
    };

    // 3. Window blur
    const onBlur = () => {
      logEvent("WINDOW_BLUR");
    };

    // 4. Copy/cut/paste block
    const onCopy = (e: Event) => {
      e.preventDefault();
      logEvent("COPY_ATTEMPT");
    };

    // 5. Context menu block
    const onContextMenu = (e: Event) => {
      e.preventDefault();
      logEvent("RIGHT_CLICK");
    };

    // 6. Keyboard shortcuts block
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["U", "S", "P"].includes(e.key)) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        logEvent("KEYBOARD_SHORTCUT", { key: e.key });
      }
    };

    // 7. DevTools detection
    const checkDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        logEvent("DEVTOOLS_OPEN");
      }
    };
    const devtoolsInterval = setInterval(checkDevTools, 3000);

    // 8. Text selection bloklash
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // Event listener'larni qo'shish
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("paste", onCopy);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      // Tozalash
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(devtoolsInterval);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      if (flushTimer.current) clearTimeout(flushTimer.current);
      sendEvents(); // Qolgan eventlarni yuborish
    };
  }, [enabled, logEvent, sendEvents]);

  // Fullscreen yoqish funksiyasi
  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Ba'zi brauzerlarda ishlamasligi mumkin
    }
  }, []);

  return { logEvent, requestFullscreen };
}
