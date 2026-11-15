import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Txt, tap, useTheme } from './ui';
import { cardShadow, radius, space } from '../theme';

export const TABS = [
  { key: 'today', label: "Aujourd'hui", icon: 'water' },
  { key: 'history', label: 'Progrès', icon: 'trophy' },
  { key: 'settings', label: 'Réglages', icon: 'options' },
];

export const TAB_HEIGHT = 64;

// Espace à réserver en bas de chaque écran pour la barre flottante.
export function useTabSpace() {
  const insets = useSafeAreaInsets();
  return TAB_HEIGHT + Math.max(insets.bottom, space.lg) + space.lg;
}

export default function TabBar({ current, onChange }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: t.tabBar, borderColor: t.border, bottom: Math.max(insets.bottom, space.lg) },
        cardShadow(t, 2),
      ]}
    >
      {TABS.map((tab) => {
        const active = tab.key === current;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) tap('light');
              onChange(tab.key);
            }}
            style={styles.item}
          >
            <View style={[styles.pill, active && { backgroundColor: t.accent }]}>
              <Ionicons name={active ? tab.icon : `${tab.icon}-outline`} size={20} color={active ? '#fff' : t.textMuted} />
              {active && (
                <Txt v="caption" bold color="#fff">
                  {tab.label}
                </Txt>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    height: TAB_HEIGHT,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: TAB_HEIGHT },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
});
