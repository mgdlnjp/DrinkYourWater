import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleReminders } from './notifications';

const KEY = 'dyw:v2';

export const DEFAULT_SETTINGS = {
  goalMl: 2000,
  glassMl: 250,
  wakeHour: 8,
  sleepHour: 22,
  intervalMin: 90,
  remindersOn: true,
  theme: 'system', // 'system' | 'light' | 'dark'
};

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function sumDay(entries = []) {
  return entries.reduce((acc, e) => acc + e.ml, 0);
}

// Heures de rappel entre le réveil et le coucher, selon l'intervalle choisi.
export function reminderTimes(s) {
  const out = [];
  const start = s.wakeHour * 60 + 30;
  const end = s.sleepHour * 60;
  for (let m = start; m <= end; m += s.intervalMin) {
    out.push({ hour: Math.floor(m / 60), minute: m % 60 });
  }
  return out;
}

export function nextReminder(s, now = new Date()) {
  if (!s.remindersOn) return null;
  const mins = now.getHours() * 60 + now.getMinutes();
  const times = reminderTimes(s);
  const today = times.find((t) => t.hour * 60 + t.minute > mins);
  return today ? { ...today, tomorrow: false } : times[0] ? { ...times[0], tomorrow: true } : null;
}

export function streak(log, goalMl, now = new Date()) {
  let count = 0;
  const d = new Date(now);
  // Si l'objectif du jour n'est pas encore atteint, la série part d'hier.
  if (sumDay(log[dayKey(d)]) < goalMl) d.setDate(d.getDate() - 1);
  while (sumDay(log[dayKey(d)]) >= goalMl) {
    count += 1;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

// Reprend les réglages de l'ancienne version (clés séparées) si présents.
async function migrateLegacy() {
  try {
    const [goal, reminders] = await Promise.all([
      AsyncStorage.getItem('totalWater'),
      AsyncStorage.getItem('remindersPerDay'),
    ]);
    if (!goal) return null;
    const goalMl = Math.min(5000, Math.max(500, Number(goal) || 2000));
    const n = Math.max(1, Number(reminders) || 6);
    const intervalMin = Math.max(30, Math.round(((22 - 8) * 60) / n / 30) * 30);
    return { ...DEFAULT_SETTINGS, goalMl, intervalMin };
  } catch {
    return null;
  }
}

const Ctx = createContext(null);

export function HydrationProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [log, setLog] = useState({});
  const [now, setNow] = useState(new Date());
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const data = JSON.parse(raw);
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          setLog(data.log || {});
          setOnboarded(!!data.onboarded);
        } else {
          const legacy = await migrateLegacy();
          if (legacy) setSettings(legacy);
        }
      } catch {}
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ settings, log, onboarded })).catch(() => {});
  }, [settings, log, onboarded]);

  useEffect(() => {
    if (!loaded.current || !onboarded) return;
    scheduleReminders(settings);
  }, [onboarded, settings.remindersOn, settings.wakeHour, settings.sleepHour, settings.intervalMin, settings.glassMl]);

  // Horloge : passage à minuit et retour au premier plan.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 60000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && tick());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const today = dayKey(now);
  const todayEntries = log[today] || [];
  const drankMl = sumDay(todayEntries);

  const addDrink = useCallback(
    (ml) => {
      const at = new Date();
      const k = dayKey(at);
      setLog((prev) => ({
        ...prev,
        [k]: [...(prev[k] || []), { id: `${at.getTime()}`, ml, t: at.toISOString() }],
      }));
      setNow(at);
    },
    []
  );

  const removeDrink = useCallback((id) => {
    setLog((prev) => {
      const k = dayKey();
      return { ...prev, [k]: (prev[k] || []).filter((e) => e.id !== id) };
    });
  }, []);

  const updateSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const resetToday = useCallback(() => {
    setLog((prev) => ({ ...prev, [dayKey()]: [] }));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      onboarded,
      setOnboarded,
      settings,
      updateSettings,
      log,
      now,
      todayEntries,
      drankMl,
      addDrink,
      removeDrink,
      resetToday,
    }),
    [ready, onboarded, settings, log, now, todayEntries, drankMl, addDrink, removeDrink, updateSettings, resetToday]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHydration() {
  return useContext(Ctx);
}
