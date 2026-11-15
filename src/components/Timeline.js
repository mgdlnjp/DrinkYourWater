import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reminderTimes } from '../store';
import { Txt, hhmm, useTheme } from './ui';
import { radius, space } from '../theme';

// Frise de la journée : réveil → coucher, verres bus (gouttes), rappels (points), et « maintenant ».
export default function Timeline({ settings, entries, now }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const start = settings.wakeHour * 60;
  const end = settings.sleepHour * 60;
  const pos = (mins) => Math.min(1, Math.max(0, (mins - start) / (end - start))) * w;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const reminders = settings.remindersOn ? reminderTimes(settings) : [];
  const mid = Math.round((settings.wakeHour + settings.sleepHour) / 2);

  return (
    <View>
      <View style={styles.area} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && (
          <>
            <View style={[styles.track, { backgroundColor: t.accentTrack }]} />
            <View style={[styles.track, { width: pos(nowMins), backgroundColor: t.accent, opacity: 0.35 }]} />
            {reminders.map((r) => (
              <View
                key={`${r.hour}:${r.minute}`}
                style={[styles.tick, { left: pos(r.hour * 60 + r.minute) - 2, backgroundColor: t.textMuted }]}
              />
            ))}
            {entries.map((e) => {
              const d = new Date(e.t);
              return (
                <View
                  key={e.id}
                  style={[styles.drop, { left: pos(d.getHours() * 60 + d.getMinutes()) - 12, backgroundColor: t.accent, borderColor: t.card }]}
                >
                  <Ionicons name="water" size={12} color="#fff" />
                </View>
              );
            })}
            {nowMins >= start && nowMins <= end && (
              <View style={[styles.now, { left: pos(nowMins) - 1, backgroundColor: t.text }]} />
            )}
          </>
        )}
      </View>
      <View style={styles.labels}>
        <Txt v="caption" color={t.textMuted}>
          ☀️ {hhmm(settings.wakeHour)}
        </Txt>
        <Txt v="caption" color={t.textMuted}>
          {hhmm(mid)}
        </Txt>
        <Txt v="caption" color={t.textMuted}>
          {hhmm(settings.sleepHour)} 🌙
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { height: 40, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: 8, borderRadius: radius.pill },
  tick: { position: 'absolute', top: 30, width: 4, height: 4, borderRadius: 2, opacity: 0.5 },
  drop: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  now: { position: 'absolute', width: 2, height: 32, borderRadius: 1, top: 4 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
});
