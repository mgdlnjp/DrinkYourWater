import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHydration } from '../store';
import { ensurePermission } from '../notifications';
import { Chip, PrimaryButton, formatMl, hhmm, useTheme } from '../components/ui';
import { GOALS, INTERVALS } from './Settings';
import { space, type } from '../theme';

const WAKE = [6, 7, 8, 9];
const SLEEP = [21, 22, 23];

// Un seul écran, des choix en un tap, et c'est parti.
export default function Onboarding() {
  const t = useTheme();
  const { settings, updateSettings, setOnboarded } = useHydration();
  const [step, setStep] = useState(0);
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -12, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: native }),
        Animated.timing(bounce, { toValue: 0, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const finish = async () => {
    await ensurePermission();
    setOnboarded(true);
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.glow, { backgroundColor: t.accent }]} />
          <Animated.Text style={[styles.drop, { transform: [{ translateY: bounce }] }]}>💧</Animated.Text>
        </View>

        {step === 0 ? (
          <>
            <Text style={[styles.title, { color: t.text }]}>Bienvenue sur DrinkYourWater</Text>
            <Text style={[styles.body, { color: t.textBody }]}>
              Des rappels doux tout au long de la journée et un suivi simple de ce que tu bois. Deux questions et on
              commence.
            </Text>
            <Text style={[styles.label, { color: t.text }]}>Combien veux-tu boire par jour ?</Text>
            <View style={styles.chips}>
              {GOALS.map((g) => (
                <Chip
                  key={g}
                  label={formatMl(g)}
                  emoji={g === 2000 ? '⭐' : undefined}
                  selected={settings.goalMl === g}
                  onPress={() => updateSettings({ goalMl: g })}
                />
              ))}
            </View>
            <Text style={[styles.caption, { color: t.textMuted }]}>⭐ 2 L est un bon repère pour la plupart des adultes.</Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: t.text }]}>Quand te rappeler ?</Text>
            <Text style={[styles.body, { color: t.textBody }]}>On ne te dérange qu'entre ton réveil et ton coucher.</Text>
            <Text style={[styles.label, { color: t.text }]}>☀️ Je me lève vers</Text>
            <View style={styles.chips}>
              {WAKE.map((h) => (
                <Chip key={h} label={hhmm(h)} selected={settings.wakeHour === h} onPress={() => updateSettings({ wakeHour: h })} />
              ))}
            </View>
            <Text style={[styles.label, { color: t.text }]}>🌙 Je me couche vers</Text>
            <View style={styles.chips}>
              {SLEEP.map((h) => (
                <Chip key={h} label={hhmm(h)} selected={settings.sleepHour === h} onPress={() => updateSettings({ sleepHour: h })} />
              ))}
            </View>
            <Text style={[styles.label, { color: t.text }]}>⏰ Un rappel toutes les</Text>
            <View style={styles.chips}>
              {INTERVALS.map((i) => (
                <Chip
                  key={i.min}
                  label={i.label}
                  selected={settings.intervalMin === i.min}
                  onPress={() => updateSettings({ intervalMin: i.min })}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.dock}>
        <View style={styles.dots}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === step ? t.accent : t.accentTrack, width: i === step ? 24 : 8 }]} />
          ))}
        </View>
        <PrimaryButton
          label={step === 0 ? 'Continuer' : 'Activer mes rappels'}
          icon={step === 0 ? 'arrow-forward' : 'notifications'}
          onPress={step === 0 ? () => setStep(1) : finish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xl, gap: space.md },
  hero: { alignItems: 'center', justifyContent: 'center', height: 160, marginBottom: space.lg },
  glow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.12 },
  drop: { fontSize: 80 },
  title: { fontSize: type.title, fontWeight: type.bold },
  body: { fontSize: type.body, lineHeight: 24 },
  caption: { fontSize: type.caption, lineHeight: 18 },
  label: { fontSize: type.body, fontWeight: type.bold, marginTop: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  dock: { paddingHorizontal: space.xl, paddingBottom: space.xl, gap: space.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  dot: { height: 8, borderRadius: 4 },
});
