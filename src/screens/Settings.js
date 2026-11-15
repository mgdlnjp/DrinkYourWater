import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHydration, reminderTimes } from '../store';
import { Card, Chip, SectionTitle, Stepper, formatMl, hhmm, tap, useTheme } from '../components/ui';
import { radius, space, type } from '../theme';

export const GOALS = [1500, 2000, 2500, 3000];
export const GLASSES = [
  { ml: 200, emoji: '🥃' },
  { ml: 250, emoji: '🥛' },
  { ml: 330, emoji: '🥤' },
  { ml: 500, emoji: '🍶' },
];
export const INTERVALS = [
  { min: 60, label: '1 h' },
  { min: 90, label: '1 h 30' },
  { min: 120, label: '2 h' },
  { min: 180, label: '3 h' },
];
const THEMES = [
  { key: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Clair', icon: 'sunny-outline' },
  { key: 'dark', label: 'Sombre', icon: 'moon-outline' },
];

export default function Settings() {
  const t = useTheme();
  const { settings: s, updateSettings, resetToday } = useHydration();
  const [confirmReset, setConfirmReset] = useState(false);
  const count = reminderTimes(s).length;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: t.text, marginBottom: space.xl }]}>Réglages</Text>

      <SectionTitle>Objectif quotidien</SectionTitle>
      <Card>
        <View style={styles.centerRow}>
          <Stepper
            value={s.goalMl}
            format={formatMl}
            onMinus={() => updateSettings({ goalMl: Math.max(500, s.goalMl - 250) })}
            onPlus={() => updateSettings({ goalMl: Math.min(5000, s.goalMl + 250) })}
          />
        </View>
        <View style={[styles.chips, { marginTop: space.lg }]}>
          {GOALS.map((g) => (
            <Chip key={g} label={formatMl(g)} selected={s.goalMl === g} onPress={() => updateSettings({ goalMl: g })} />
          ))}
        </View>
      </Card>

      <View style={styles.gap} />
      <SectionTitle>Ton verre habituel</SectionTitle>
      <View style={styles.chips}>
        {GLASSES.map((g) => (
          <Chip
            key={g.ml}
            emoji={g.emoji}
            label={`${g.ml} ml`}
            selected={s.glassMl === g.ml}
            onPress={() => updateSettings({ glassMl: g.ml })}
          />
        ))}
      </View>

      <View style={styles.gap} />
      <SectionTitle>Rappels</SectionTitle>
      <Card>
        <View style={styles.row}>
          <View style={[styles.icon, { backgroundColor: t.accentSoft }]}>
            <Ionicons name="notifications" size={18} color={t.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.body, { color: t.text, fontWeight: type.bold }]}>Notifications</Text>
            <Text style={[styles.caption, { color: t.textMuted }]}>
              {s.remindersOn ? `${count} rappels par jour` : 'Désactivées'}
            </Text>
          </View>
          <Switch
            value={s.remindersOn}
            onValueChange={(v) => {
              tap('light');
              updateSettings({ remindersOn: v });
            }}
            trackColor={{ true: t.accent, false: t.accentTrack }}
            thumbColor="#fff"
            activeThumbColor="#fff"
          />
        </View>

        {s.remindersOn && (
          <>
            <View style={[styles.divider, { backgroundColor: t.border }]} />
            <View style={styles.row}>
              <Text style={[styles.body, styles.flex, { color: t.textBody }]}>☀️ Réveil</Text>
              <Stepper
                value={s.wakeHour}
                format={(h) => hhmm(h)}
                onMinus={() => updateSettings({ wakeHour: Math.max(4, s.wakeHour - 1) })}
                onPlus={() => updateSettings({ wakeHour: Math.min(s.sleepHour - 2, s.wakeHour + 1) })}
              />
            </View>
            <View style={[styles.row, { marginTop: space.md }]}>
              <Text style={[styles.body, styles.flex, { color: t.textBody }]}>🌙 Coucher</Text>
              <Stepper
                value={s.sleepHour}
                format={(h) => hhmm(h)}
                onMinus={() => updateSettings({ sleepHour: Math.max(s.wakeHour + 2, s.sleepHour - 1) })}
                onPlus={() => updateSettings({ sleepHour: Math.min(23, s.sleepHour + 1) })}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: t.border }]} />
            <Text style={[styles.caption, { color: t.textMuted, marginBottom: space.md }]}>Un rappel toutes les…</Text>
            <View style={styles.chips}>
              {INTERVALS.map((i) => (
                <Chip
                  key={i.min}
                  label={i.label}
                  selected={s.intervalMin === i.min}
                  onPress={() => updateSettings({ intervalMin: i.min })}
                />
              ))}
            </View>
          </>
        )}
      </Card>

      <View style={styles.gap} />
      <SectionTitle>Apparence</SectionTitle>
      <View style={[styles.segment, { backgroundColor: t.accentSoft }]}>
        {THEMES.map((th) => {
          const on = s.theme === th.key;
          return (
            <Pressable
              key={th.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                tap('light');
                updateSettings({ theme: th.key });
              }}
              style={[styles.segItem, on && { backgroundColor: t.card }]}
            >
              <Ionicons name={th.icon} size={16} color={on ? t.accent : t.textMuted} />
              <Text style={[styles.caption, { color: on ? t.text : t.textMuted, fontWeight: type.bold }]}>{th.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.gap} />
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (!confirmReset) return setConfirmReset(true);
          tap('medium');
          resetToday();
          setConfirmReset(false);
        }}
        style={[styles.reset, { borderColor: confirmReset ? t.danger : t.border }]}
      >
        <Ionicons name="refresh" size={18} color={t.danger} />
        <Text style={[styles.body, { color: t.danger, fontWeight: type.bold }]}>
          {confirmReset ? 'Appuie encore pour confirmer' : 'Remettre la journée à zéro'}
        </Text>
      </Pressable>

      <Text style={[styles.caption, { color: t.textMuted, textAlign: 'center', marginTop: space.xl }]}>
        DrinkYourWater · v2.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xxxl },
  flex: { flex: 1 },
  title: { fontSize: type.title, fontWeight: type.bold },
  body: { fontSize: type.body, lineHeight: 24 },
  caption: { fontSize: type.caption, lineHeight: 18 },
  gap: { height: space.xxl },
  centerRow: { alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginVertical: space.lg },
  segment: { flexDirection: 'row', padding: space.xs, borderRadius: radius.md },
  segItem: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  reset: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
});
