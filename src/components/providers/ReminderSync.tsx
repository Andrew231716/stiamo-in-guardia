"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  flushDueReminders,
  getNotificationPermission,
  scheduleLocalReminders,
  wereRemindersArmed,
} from "@/lib/notifications/reminders";

/**
 * Riattiva i promemoria quando l'app è pronta / torna in primo piano,
 * se il permesso è già concesso e l'utente li aveva attivati.
 */
export function ReminderSync() {
  const { ready, data } = useApp();
  const settings = data.preferences.notificationSettings;

  useEffect(() => {
    if (!ready) return;
    if (getNotificationPermission() !== "granted") return;
    if (!wereRemindersArmed()) return;
    void scheduleLocalReminders(settings);
  }, [ready, settings]);

  useEffect(() => {
    if (!ready) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (getNotificationPermission() !== "granted") return;
      if (!wereRemindersArmed()) return;
      void flushDueReminders(settings);
      void scheduleLocalReminders(settings);
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [ready, settings]);

  return null;
}
