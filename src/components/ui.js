import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useHydration } from '../store';
import { cardShadow, radius, space, themes, type } from '../theme';

export function useTheme() {
  const system = useColorScheme();
  const { settings } = useHydration();
  const mode = settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;
  return themes[mode];
}

export function tap(style = 'light') {
  if (Platform.OS === 'web') return;
  if (style === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }
  Haptics.impactAsync(style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
}

// Bouton avec léger effet de pression (échelle 0.97).
export function PressableScale({ onPress, style, containerStyle, children, haptic = 'light', disabled, accessibilityLabel }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      style={containerStyle}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      onPress={() => {
        if (haptic) tap(haptic);
        onPress && onPress();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Card({ style, children }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, cardShadow(t), style]}>{children}</View>
  );
}

export function SectionTitle({ children, right }) {
  const t = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.section, { color: t.text }]}>{children}</Text>
      {right}
    </View>
  );
}

export function PrimaryButton({ label, icon, onPress, haptic = 'medium' }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      haptic={haptic}
      style={[styles.primary, { backgroundColor: t.accent, shadowColor: t.accent }]}
    >
      {/* reflet intérieur discret */}
      <View pointerEvents="none" style={styles.primaryShine} />
      {icon ? <Ionicons name={icon} size={20} color="#fff" /> : null}
      <Text style={styles.primaryLabel}>{label}</Text>
    </PressableScale>
  );
}

export function Chip({ label, emoji, selected, onPress }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      style={[
        styles.chip,
        { backgroundColor: selected ? t.accent : t.accentSoft, borderColor: selected ? t.accent : t.border },
      ]}
    >
      {emoji ? <Text style={styles.chipEmoji}>{emoji}</Text> : null}
      <Text style={[styles.chipLabel, { color: selected ? '#fff' : t.text }]}>{label}</Text>
    </PressableScale>
  );
}

export function Stepper({ value, onMinus, onPlus, format }) {
  const t = useTheme();
  const btn = (icon, onPress, label) => (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={[styles.stepBtn, { backgroundColor: t.accentSoft }]}>
      <Ionicons name={icon} size={20} color={t.accent} />
    </PressableScale>
  );
  return (
    <View style={styles.stepper}>
      {btn('remove', onMinus, 'Diminuer')}
      <Text style={[styles.stepValue, { color: t.text }]}>{format ? format(value) : value}</Text>
      {btn('add', onPlus, 'Augmenter')}
    </View>
  );
}

export function formatMl(ml) {
  if (ml < 1000) return `${ml} ml`;
  const l = ml / 1000;
  return `${Number.isInteger(l) ? l : l.toFixed(2).replace(/0$/, '')} L`.replace('.', ',');
}

export function formatNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function hhmm(h, m = 0) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.xl, borderWidth: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  section: { fontSize: type.body, fontWeight: type.bold },
  primary: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  primaryLabel: { color: '#fff', fontSize: type.body, fontWeight: type.bold },
  chip: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  chipEmoji: { fontSize: type.body },
  chipLabel: { fontSize: type.body, fontWeight: type.bold, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepBtn: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 72, textAlign: 'center', fontSize: type.body, fontWeight: type.bold, fontVariant: ['tabular-nums'] },
});
