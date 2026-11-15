import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tap, useTheme } from './ui';
import { space, type } from '../theme';

export const TABS = [
  { key: 'today', label: "Aujourd'hui", icon: 'water' },
  { key: 'history', label: 'Progrès', icon: 'stats-chart' },
  { key: 'settings', label: 'Réglages', icon: 'options' },
];

export default function TabBar({ current, onChange }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { backgroundColor: t.card, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      {TABS.map((tab) => {
        const active = tab.key === current;
        const color = active ? t.accent : t.textMuted;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) tap('light');
              onChange(tab.key);
            }}
            style={styles.item}
          >
            <View style={[styles.pill, active && { backgroundColor: t.accentSoft }]}>
              <Ionicons name={active ? tab.icon : `${tab.icon}-outline`} size={22} color={color} />
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: space.sm },
  item: { flex: 1, alignItems: 'center', gap: space.xs, minHeight: 48 },
  pill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: type.caption, fontWeight: type.bold },
});
