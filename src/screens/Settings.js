import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHydration, reminderTimes } from '../store';
import { useTabSpace } from '../components/TabBar';
import { Card, Chip, IconTile, PressableScale, RoundButton, SectionTitle, Stepper, Txt, formatMl, hhmm, tap, useTheme } from '../components/ui';
import { drinks, radius, space } from '../theme';

export const GOALS = [1500, 2000, 2500, 3000];
export const INTERVALS = [
  { min: 60, label: '1 h' },
  { min: 90, label: '1 h 30' },
  { min: 120, label: '2 h' },
  { min: 180, label: '3 h' },
];
const GLASSES = drinks.filter((d) => d.ml <= 500);
const THEMES = [
  { key: 'system', label: 'Auto', icon: 'contrast' },
  { key: 'light', label: 'Clair', icon: 'sunny' },
  { key: 'dark', label: 'Sombre', icon: 'moon' },
];

export default function Settings() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabSpace();
  const { settings: s, updateSettings, resetToday } = useHydration();
  const [confirmReset, setConfirmReset] = useState(false);
  const times = reminderTimes(s);
  const glasses = Math.round(s.goalMl / s.glassMl);

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: tabSpace + space.xl, paddingHorizontal: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Txt v="title" bold style={{ marginBottom: space.xl }}>
        Réglages
      </Txt>

      {/* Objectif : la valeur est la star */}
      <Card style={styles.goalCard}>
        <Txt v="caption" color={t.textMuted}>
          Objectif quotidien
        </Txt>
        <View style={styles.goalRow}>
          <RoundButton icon="remove" size={52} label="Diminuer l'objectif" onPress={() => updateSettings({ goalMl: Math.max(500, s.goalMl - 250) })} />
          <Txt v="hero" bold color={t.accent} style={styles.goalValue}>
            {formatMl(s.goalMl)}
          </Txt>
          <RoundButton icon="add" size={52} label="Augmenter l'objectif" onPress={() => updateSettings({ goalMl: Math.min(5000, s.goalMl + 250) })} />
        </View>
        <Txt v="caption" color={t.textMuted}>
          ≈ {glasses} verres de {s.glassMl} ml
        </Txt>
        <View style={[styles.chips, { marginTop: space.lg, justifyContent: 'center' }]}>
          {GOALS.map((g) => (
            <Chip key={g} label={formatMl(g)} selected={s.goalMl === g} onPress={() => updateSettings({ goalMl: g })} />
          ))}
        </View>
      </Card>

      <View style={styles.gap} />
      <SectionTitle>Ton verre habituel</SectionTitle>
      <View style={styles.glassRow}>
        {GLASSES.map((g) => {
          const on = s.glassMl === g.ml;
          return (
            <PressableScale
              key={g.ml}
              containerStyle={styles.flex}
              onPress={() => updateSettings({ glassMl: g.ml })}
              accessibilityLabel={`${g.label} ${g.ml} ml`}
              style={[
                styles.glassCard,
                { backgroundColor: on ? `${g.tint}1F` : t.card, borderColor: on ? g.tint : t.border },
              ]}
            >
              <Text style={styles.glassEmoji}>{g.emoji}</Text>
              <Txt v="caption" bold color={on ? t.text : t.textBody}>
                {g.ml} ml
              </Txt>
              {on && (
                <View style={[styles.check, { backgroundColor: g.tint }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.gap} />
      <SectionTitle>Rappels</SectionTitle>
      <Card style={styles.noPad}>
        <View style={styles.row}>
          <IconTile icon="notifications" color="#F59E0B" />
          <View style={styles.flex}>
            <Txt v="body" bold>
              Notifications
            </Txt>
            <Txt v="caption" color={t.textMuted}>
              {s.remindersOn ? `${times.length} rappels doux par jour` : 'Désactivées'}
            </Txt>
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
              <IconTile icon="sunny" color="#F97316" />
              <Txt v="body" style={styles.flex}>
                Réveil
              </Txt>
              <Stepper
                value={s.wakeHour}
                format={(h) => hhmm(h)}
                onMinus={() => updateSettings({ wakeHour: Math.max(4, s.wakeHour - 1) })}
                onPlus={() => updateSettings({ wakeHour: Math.min(s.sleepHour - 2, s.wakeHour + 1) })}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: t.border }]} />
            <View style={styles.row}>
              <IconTile icon="moon" color="#6366F1" />
              <Txt v="body" style={styles.flex}>
                Coucher
              </Txt>
              <Stepper
                value={s.sleepHour}
                format={(h) => hhmm(h)}
                onMinus={() => updateSettings({ sleepHour: Math.max(s.wakeHour + 2, s.sleepHour - 1) })}
                onPlus={() => updateSettings({ sleepHour: Math.min(23, s.sleepHour + 1) })}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: t.border }]} />
            <View style={styles.block}>
              <View style={[styles.row, styles.noRowPad]}>
                <IconTile icon="timer" color="#10B981" />
                <Txt v="body" style={styles.flex}>
                  Un rappel toutes les…
                </Txt>
              </View>
              <View style={[styles.chips, { marginTop: space.md }]}>
                {INTERVALS.map((i) => (
                  <Chip key={i.min} label={i.label} selected={s.intervalMin === i.min} onPress={() => updateSettings({ intervalMin: i.min })} />
                ))}
              </View>
              <View style={[styles.preview, { backgroundColor: t.accentSoft }]}>
                <Ionicons name="time-outline" size={16} color={t.accent} />
                <Txt v="caption" color={t.textBody} style={styles.flex} numberOfLines={2}>
                  {times.slice(0, 6).map((x) => hhmm(x.hour, x.minute)).join(' · ')}
                  {times.length > 6 ? ' …' : ''}
                </Txt>
              </View>
            </View>
          </>
        )}
      </Card>

      <View style={styles.gap} />
      <SectionTitle>Apparence</SectionTitle>
      <View style={styles.themeRow}>
        {THEMES.map((th) => {
          const on = s.theme === th.key;
          return (
            <PressableScale
              key={th.key}
              containerStyle={styles.flex}
              onPress={() => updateSettings({ theme: th.key })}
              accessibilityLabel={`Thème ${th.label}`}
              style={[styles.themeCard, { backgroundColor: on ? t.accent : t.card, borderColor: on ? t.accent : t.border }]}
            >
              <Ionicons name={th.icon} size={22} color={on ? '#fff' : t.textMuted} />
              <Txt v="caption" bold color={on ? '#fff' : t.textBody}>
                {th.label}
              </Txt>
            </PressableScale>
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
        style={[styles.reset, { borderColor: confirmReset ? t.danger : t.border, backgroundColor: confirmReset ? `${t.danger}14` : 'transparent' }]}
      >
        <Ionicons name="refresh" size={18} color={t.danger} />
        <Txt v="body" bold color={t.danger}>
          {confirmReset ? 'Appuie encore pour confirmer' : 'Remettre la journée à zéro'}
        </Txt>
      </Pressable>

      <Txt v="caption" color={t.textMuted} style={styles.footer}>
        DrinkYourWater · v2.1 · fait avec 💧
      </Txt>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: space.xxl },
  goalCard: { alignItems: 'center' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginVertical: space.md },
  goalValue: { minWidth: 120, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  glassRow: { flexDirection: 'row', gap: space.sm },
  glassCard: { height: 96, borderRadius: radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: space.xs },
  glassEmoji: { fontSize: 28 },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPad: { padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  noRowPad: { paddingHorizontal: 0, paddingVertical: 0 },
  block: { padding: space.lg },
  divider: { height: 1, marginLeft: 72 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.lg, padding: space.md, borderRadius: radius.sm },
  themeRow: { flexDirection: 'row', gap: space.sm },
  themeCard: { height: 80, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  reset: {
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  footer: { textAlign: 'center', marginTop: space.xl },
});
