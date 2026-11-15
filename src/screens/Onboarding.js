import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHydration } from '../store';
import { ensurePermission } from '../notifications';
import WaterBubble, { useBubbleSize } from '../components/WaterBubble';
import { Chip, PrimaryButton, PressableScale, Txt, formatMl, hhmm, useTheme } from '../components/ui';
import { GOALS, INTERVALS } from './Settings';
import { radius, space } from '../theme';

const WHITE_70 = 'rgba(255,255,255,0.75)';
const WAKE = [6, 7, 8, 9];
const SLEEP = [21, 22, 23];
const STEPS = 3;

// Trois écrans courts sur fond océan : accroche, objectif, horaires.
export default function Onboarding() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bubbleSize = useBubbleSize();
  const { settings, updateSettings, setOnboarded } = useHydration();
  const [step, setStep] = useState(0);
  const [fill, setFill] = useState(0.15);

  useEffect(() => {
    // La bulle se remplit au fil des étapes.
    setFill([0.35, 0.6, 0.85][step]);
  }, [step]);

  const finish = async () => {
    await ensurePermission();
    setOnboarded(true);
  };

  return (
    <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.flex}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + space.xl }]} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          {step > 0 ? (
            <PressableScale onPress={() => setStep(step - 1)} accessibilityLabel="Retour" style={styles.back}>
              <Txt v="body" bold color="#fff">
                ← Retour
              </Txt>
            </PressableScale>
          ) : (
            <View />
          )}
          <Txt v="caption" bold color={WHITE_70}>
            {step + 1}/{STEPS}
          </Txt>
        </View>

        <View style={styles.bubble}>
          <WaterBubble progress={fill} size={bubbleSize} />
        </View>

        <View>
          {step === 0 && (
            <>
              <Txt v="hero" bold color="#fff" style={styles.center}>
                Bois mieux,{'\n'}sans y penser.
              </Txt>
              <Txt v="body" color={WHITE_70} style={[styles.center, styles.lead]}>
                Des rappels doux, un suivi en un tap et une bulle qui se remplit à chaque verre.
              </Txt>
              <View style={styles.features}>
                {[
                  ['🔔', 'Rappels adaptés à ta journée'],
                  ['💧', 'Ajout en un seul tap'],
                  ['🏆', 'Séries et badges à débloquer'],
                ].map(([e, l]) => (
                  <View key={l} style={styles.feature}>
                    <Txt v="title">{e}</Txt>
                    <Txt v="body" bold color="#fff" style={styles.flex}>
                      {l}
                    </Txt>
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Txt v="title" bold color="#fff" style={styles.center}>
                Ton objectif du jour
              </Txt>
              <Txt v="hero" bold color="#fff" style={[styles.center, styles.bigValue]}>
                {formatMl(settings.goalMl)}
              </Txt>
              <View style={[styles.chips, styles.centerChips]}>
                {GOALS.map((g) => (
                  <Chip key={g} glass label={formatMl(g)} emoji={g === 2000 ? '⭐' : undefined} selected={settings.goalMl === g} onPress={() => updateSettings({ goalMl: g })} />
                ))}
              </View>
              <Txt v="caption" color={WHITE_70} style={[styles.center, { marginTop: space.lg }]}>
                ⭐ 2 L est un bon repère pour la plupart des adultes.{'\n'}Tu pourras le changer à tout moment.
              </Txt>
            </>
          )}

          {step === 2 && (
            <>
              <Txt v="title" bold color="#fff" style={styles.center}>
                Quand te rappeler ?
              </Txt>
              <Txt v="body" color={WHITE_70} style={[styles.center, styles.lead]}>
                Jamais pendant ton sommeil, promis.
              </Txt>
              <Group label="☀️ Je me lève vers">
                {WAKE.map((h) => (
                  <Chip key={h} glass label={hhmm(h)} selected={settings.wakeHour === h} onPress={() => updateSettings({ wakeHour: h })} />
                ))}
              </Group>
              <Group label="🌙 Je me couche vers">
                {SLEEP.map((h) => (
                  <Chip key={h} glass label={hhmm(h)} selected={settings.sleepHour === h} onPress={() => updateSettings({ sleepHour: h })} />
                ))}
              </Group>
              <Group label="⏰ Un rappel toutes les">
                {INTERVALS.map((i) => (
                  <Chip key={i.min} glass label={i.label} selected={settings.intervalMin === i.min} onPress={() => updateSettings({ intervalMin: i.min })} />
                ))}
              </Group>
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, { width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.4 }]} />
          ))}
        </View>
        <PrimaryButton
          light
          label={step === 0 ? "C'est parti" : step === 1 ? 'Continuer' : 'Activer mes rappels'}
          icon={step < 2 ? 'arrow-forward' : 'notifications'}
          onPress={step < 2 ? () => setStep(step + 1) : finish}
        />
      </View>
    </LinearGradient>
  );
}

function Group({ label, children }) {
  return (
    <View style={{ marginTop: space.xl }}>
      <Txt v="body" bold color="#fff" style={{ marginBottom: space.md }}>
        {label}
      </Txt>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  blobA: { width: 320, height: 320, top: -140, right: -120 },
  blobB: { width: 240, height: 240, bottom: 80, left: -120 },
  scroll: { paddingHorizontal: space.xl, paddingBottom: space.xl },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 },
  back: { paddingVertical: space.xs },
  bubble: { alignItems: 'center', marginVertical: space.xl },
  lead: { marginTop: space.md },
  bigValue: { marginVertical: space.lg },
  features: { marginTop: space.xl, gap: space.sm },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  centerChips: { justifyContent: 'center' },
  dock: { paddingHorizontal: space.xl, gap: space.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
