import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useHydration } from '../store';
import { cardShadow, fonts, lineHeight, radius, space, themes, type } from '../theme';

export const ND = Platform.OS !== 'web'; // native driver indisponible sur le web

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

// Texte unique de l'app : variante (hero/title/body/caption) + graisse (regular/bold).
export function Txt({ v = 'body', bold, color, style, children, ...rest }) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontSize: type[v],
          lineHeight: lineHeight[v],
          fontFamily: bold ? fonts.bold : fonts.regular,
          color: color || t.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// Bouton avec léger effet de pression (échelle 0.96).
export function PressableScale({ onPress, onLongPress, style, containerStyle, children, haptic = 'light', disabled, accessibilityLabel }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(scale, { toValue: v, useNativeDriver: ND, speed: 40, bounciness: 8 }).start();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      style={containerStyle}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      onLongPress={onLongPress}
      onPress={() => {
        if (haptic) tap(haptic);
        onPress && onPress();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Card({ style, children, strength }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, cardShadow(t, strength), style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={styles.sectionRow}>
      <Txt v="body" bold>
        {children}
      </Txt>
      {right}
    </View>
  );
}

export function PrimaryButton({ label, icon, onPress, haptic = 'medium', light }) {
  const t = useTheme();
  const bg = light ? '#FFFFFF' : t.accent;
  const fg = light ? t.accent : '#FFFFFF';
  return (
    <PressableScale
      onPress={onPress}
      haptic={haptic}
      accessibilityLabel={label}
      style={[styles.primary, { backgroundColor: bg, shadowColor: light ? '#00133D' : t.accent }]}
    >
      <View pointerEvents="none" style={styles.primaryShine} />
      {icon ? <Ionicons name={icon} size={22} color={fg} /> : null}
      <Txt v="body" bold color={fg}>
        {label}
      </Txt>
    </PressableScale>
  );
}

// Puce de sélection. `glass` = version pour fond dégradé.
export function Chip({ label, emoji, selected, onPress, glass, stretch }) {
  const t = useTheme();
  const bg = glass ? (selected ? '#FFFFFF' : 'rgba(255,255,255,0.14)') : selected ? t.accent : t.accentSoft;
  const fg = glass ? (selected ? t.accent : '#FFFFFF') : selected ? '#FFFFFF' : t.text;
  const border = glass ? (selected ? '#FFFFFF' : 'rgba(255,255,255,0.22)') : selected ? t.accent : t.border;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      containerStyle={stretch && styles.stretch}
      style={[styles.chip, stretch && styles.chipStretch, { backgroundColor: bg, borderColor: border }]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Txt v="body" bold color={fg}>
        {label}
      </Txt>
    </PressableScale>
  );
}

export function RoundButton({ icon, onPress, label, size = 44, color, bg }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.round, { width: size, height: size, backgroundColor: bg || t.accentSoft }]}
    >
      <Ionicons name={icon} size={size * 0.45} color={color || t.accent} />
    </PressableScale>
  );
}

export function Stepper({ value, onMinus, onPlus, format }) {
  return (
    <View style={styles.stepper}>
      <RoundButton icon="remove" onPress={onMinus} label="Diminuer" />
      <Txt v="body" bold style={styles.stepValue}>
        {format ? format(value) : value}
      </Txt>
      <RoundButton icon="add" onPress={onPlus} label="Augmenter" />
    </View>
  );
}

export function IconTile({ icon, color, size = 40 }) {
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: `${color}1F` }]}>
      <Ionicons name={icon} size={size * 0.5} color={color} />
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
  primary: {
    height: 60,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryShine: { position: 'absolute', top: 0, left: 24, right: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.45)' },
  chip: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  stretch: { flex: 1 },
  chipStretch: { justifyContent: 'center', paddingHorizontal: space.sm },
  emoji: { fontSize: 16 },
  round: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepValue: { minWidth: 72, textAlign: 'center' },
  tile: { borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
