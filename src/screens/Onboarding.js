import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHydration } from '../store';
import { ensurePermission } from '../notifications';
import WaterBubble, { useBubbleSize } from '../components/WaterBubble';
import { Chip, ND, PrimaryButton, PressableScale, Txt, formatMl, hhmm, tap, useTheme } from '../components/ui';
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

  // Navigation entre étapes : le contenu glisse dans le sens du geste (la bulle reste fixe).
  const slide = useRef(new Animated.Value(0)).current;
  const stepRef = useRef(step);
  stepRef.current = step;
  const go = (to) => {
    if (to < 0 || to >= STEPS || to === stepRef.current) return;
    const dir = to > stepRef.current ? 1 : -1;
    tap('light');
    setStep(to);
    slide.setValue(dir * 48);
    Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  };
  const goRef = useRef(go);
  goRef.current = go;

  // Balayage horizontal : vers la droite = étape précédente, vers la gauche = suivante.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          const fast = Math.abs(g.vx) > 0.3;
          if (g.dx > 60 || (fast && g.dx > 20)) goRef.current(stepRef.current - 1);
          else if (g.dx < -60 || (fast && g.dx < -20)) goRef.current(stepRef.current + 1);
        },
        onPanResponderTerminationRequest: () => true,
      }),
    []
  );

  const finish = async () => {
    await ensurePermission();
    setOnboarded(true);
  };

  return (
    <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.flex} {...pan.panHandlers}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + space.lg }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.top, { top: insets.top + space.sm }]}>
          {step > 0 ? (
            <PressableScale onPress={() => go(step - 1)} accessibilityLabel="Retour" style={styles.back}>
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

        <Animated.View style={{ transform: [{ translateX: slide }] }}>
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
                  <Chip key={h} glass stretch label={hhmm(h)} selected={settings.wakeHour === h} onPress={() => updateSettings({ wakeHour: h })} />
                ))}
              </Group>
              <Group label="🌙 Je me couche vers">
                {SLEEP.map((h) => (
                  <Chip key={h} glass stretch label={hhmm(h)} selected={settings.sleepHour === h} onPress={() => updateSettings({ sleepHour: h })} />
                ))}
              </Group>
              <Group label="⏰ Un rappel toutes les">
                {INTERVALS.map((i) => (
                  <Chip key={i.min} glass stretch label={i.label} selected={settings.intervalMin === i.min} onPress={() => updateSettings({ intervalMin: i.min })} />
                ))}
              </Group>
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, { width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.4 }]} />
          ))}
        </View>
        <PrimaryButton
          light
          label={step === 0 ? "C'est parti" : step === 1 ? 'Continuer' : 'Activer mes rappels'}
          icon={step < 2 ? 'arrow-forward' : 'notifications'}
          onPress={step < 2 ? () => go(step + 1) : finish}
        />
      </View>
    </LinearGradient>
  );
}

function Group({ label, children }) {
  return (
    <View style={{ marginTop: space.md }}>
      <Txt v="body" bold color="#fff" style={{ marginBottom: space.sm }}>
        {label}
      </Txt>
      <View style={styles.row}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  blobA: { width: 320, height: 320, top: -140, right: -120 },
  blobB: { width: 240, height: 240, bottom: 80, left: -120 },
  scroll: { paddingHorizontal: space.xl, paddingBottom: space.md },
  // Superposée au-dessus de la bulle pour lui laisser toute la hauteur.
  top: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
  },
  back: { paddingVertical: space.xs },
  bubble: { alignItems: 'center', marginTop: space.sm, marginBottom: space.md },
  lead: { marginTop: space.sm },
  bigValue: { marginVertical: space.lg },
  features: { marginTop: space.lg, gap: space.sm },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  centerChips: { justifyContent: 'center' },
  dock: { paddingHorizontal: space.xl, gap: space.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
