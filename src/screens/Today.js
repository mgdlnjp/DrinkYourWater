import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHydration, nextReminder, streak } from '../store';
import ProgressRing from '../components/ProgressRing';
import { Card, PressableScale, PrimaryButton, SectionTitle, formatMl, formatNumber, hhmm, tap, useTheme } from '../components/ui';
import { radius, space, type } from '../theme';

const QUICK = [
  { ml: 150, emoji: '☕', label: 'Tasse' },
  { ml: 330, emoji: '🥤', label: 'Canette' },
  { ml: 500, emoji: '🍶', label: 'Gourde' },
];

function greeting(d) {
  const h = d.getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function encouragement(pct) {
  if (pct === 0) return 'Commence par un grand verre, ton corps se réveille 🌅';
  if (pct < 0.35) return 'Bon début, garde ce rythme 💧';
  if (pct < 0.7) return 'Tu es à mi-chemin, continue comme ça 🌊';
  if (pct < 1) return 'Presque ! Encore un petit effort 💪';
  return 'Objectif atteint, bravo ! 🎉';
}

export default function Today() {
  const t = useTheme();
  const { settings, now, todayEntries, drankMl, addDrink, removeDrink, log } = useHydration();
  const goal = settings.goalMl;
  const pct = drankMl / goal;
  const remaining = Math.max(0, goal - drankMl);
  const next = nextReminder(settings, now);
  const days = streak(log, goal, now);
  const [celebrate, setCelebrate] = useState(false);

  const drink = (ml) => {
    addDrink(ml);
    if (drankMl < goal && drankMl + ml >= goal) {
      tap('success');
      setTimeout(() => setCelebrate(true), 450);
    }
  };

  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={[styles.caption, { color: t.textMuted, textTransform: 'capitalize' }]}>{dateLabel}</Text>
            <Text style={[styles.title, { color: t.text }]}>{greeting(now)} 👋</Text>
          </View>
          <View style={[styles.streak, { backgroundColor: t.accentSoft }]} accessibilityLabel={`Série de ${days} jours`}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakText, { color: t.text }]}>{days} j</Text>
          </View>
        </View>

        {/* Anneau de progression : l'élément qu'on voit en premier */}
        <Card style={styles.hero}>
          <ProgressRing progress={pct} color={t.accent} track={t.accentTrack}>
            <Text style={[styles.heroValue, { color: t.text }]}>{formatNumber(drankMl)}</Text>
            <Text style={[styles.caption, { color: t.textMuted }]}>sur {formatNumber(goal)} ml</Text>
            <View style={[styles.pctPill, { backgroundColor: pct >= 1 ? t.success : t.accentSoft }]}>
              <Text style={[styles.pctText, { color: pct >= 1 ? '#fff' : t.accent }]}>{Math.round(pct * 100)} %</Text>
            </View>
          </ProgressRing>
          <Text style={[styles.body, { color: t.textBody, textAlign: 'center', marginTop: space.xl }]}>
            {encouragement(pct)}
          </Text>
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <View style={styles.statsRow}>
            <Stat label="Restant" value={remaining ? formatMl(remaining) : '—'} />
            <Stat label="Verres" value={`${todayEntries.length}`} />
            <Stat
              label="Prochain rappel"
              value={next ? `${next.tomorrow ? 'dem. ' : ''}${hhmm(next.hour, next.minute)}` : 'Off'}
            />
          </View>
        </Card>

        {/* Journal du jour */}
        <View style={{ marginTop: space.xxl }}>
          <SectionTitle>Aujourd'hui</SectionTitle>
          {todayEntries.length === 0 ? (
            <Card style={styles.empty}>
              <Text style={styles.emptyEmoji}>🫗</Text>
              <Text style={[styles.body, { color: t.text, fontWeight: type.bold }]}>Ton verre est vide</Text>
              <Text style={[styles.caption, { color: t.textMuted, textAlign: 'center' }]}>
                Appuie sur « Boire » en bas dès que tu prends un verre, on s'occupe du reste.
              </Text>
            </Card>
          ) : (
            <Card style={{ paddingVertical: space.sm }}>
              {[...todayEntries].reverse().map((e, i) => (
                <View key={e.id} style={[styles.logRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.border }]}>
                  <View style={[styles.logIcon, { backgroundColor: t.accentSoft }]}>
                    <Ionicons name="water" size={16} color={t.accent} />
                  </View>
                  <Text style={[styles.body, styles.flex, { color: t.text, fontWeight: type.bold }]}>{formatMl(e.ml)}</Text>
                  <Text style={[styles.caption, { color: t.textMuted }]}>
                    {new Date(e.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Pressable
                    accessibilityLabel={`Supprimer ${formatMl(e.ml)}`}
                    hitSlop={12}
                    onPress={() => {
                      tap('light');
                      removeDrink(e.id);
                    }}
                    style={styles.trash}
                  >
                    <Ionicons name="close" size={18} color={t.textMuted} />
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Zone du pouce : actions principales */}
      <View style={[styles.dock, { backgroundColor: t.bg }]}>
        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <PressableScale
              key={q.ml}
              onPress={() => drink(q.ml)}
              containerStyle={styles.flex}
              accessibilityLabel={`Ajouter ${q.label} ${q.ml} ml`}
              style={[styles.quick, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Text style={styles.quickEmoji}>{q.emoji}</Text>
              <Text style={[styles.caption, { color: t.text, fontWeight: type.bold }]}>{q.ml} ml</Text>
            </PressableScale>
          ))}
        </View>
        <PrimaryButton icon="add" label={`Boire un verre · ${settings.glassMl} ml`} onPress={() => drink(settings.glassMl)} />
      </View>

      <Celebration
        visible={celebrate}
        goal={goal}
        glasses={todayEntries.length}
        streak={days}
        onClose={() => setCelebrate(false)}
      />
    </View>
  );
}

function Stat({ label, value }) {
  const t = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.body, { color: t.text, fontWeight: type.bold, fontVariant: ['tabular-nums'] }]}>{value}</Text>
      <Text style={[styles.caption, { color: t.textMuted }]}>{label}</Text>
    </View>
  );
}

// Le moment fort : objectif atteint.
function Celebration({ visible, goal, glasses, streak: days, onClose }) {
  const t = useTheme();
  const scale = useRef(new Animated.Value(0.4)).current;
  const float = useRef(new Animated.Value(0)).current;
  const native = Platform.OS !== 'web';

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.4);
    Animated.spring(scale, { toValue: 1, useNativeDriver: native, bounciness: 14 }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -8, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(float, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.celebrate, { backgroundColor: t.card, transform: [{ scale }] }]}>
          <View style={[styles.celebrateGlow, { backgroundColor: t.accent }]} />
          <Animated.Text style={[styles.celebrateEmoji, { transform: [{ translateY: float }] }]}>💧</Animated.Text>
          <Text style={styles.sparkles}>✨ 🎉 ✨</Text>
          <Text style={[styles.title, { color: t.text, textAlign: 'center' }]}>Objectif atteint !</Text>
          <Text style={[styles.body, { color: t.textBody, textAlign: 'center', marginTop: space.sm }]}>
            {formatMl(goal)} en {glasses} {glasses > 1 ? 'verres' : 'verre'}.
            {days > 1 ? ` ${days} jours d'affilée, quelle régularité !` : ' Ton corps te dit merci.'}
          </Text>
          <View style={{ alignSelf: 'stretch', marginTop: space.xl }}>
            <PrimaryButton label="Continuer" onPress={onClose} haptic="light" />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.xl },
  title: { fontSize: type.title, fontWeight: type.bold },
  body: { fontSize: type.body, lineHeight: 24 },
  caption: { fontSize: type.caption, lineHeight: 18 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, height: 36, borderRadius: radius.pill },
  streakEmoji: { fontSize: type.body },
  streakText: { fontSize: type.body, fontWeight: type.bold, fontVariant: ['tabular-nums'] },
  hero: { alignItems: 'center', paddingTop: space.xxl },
  heroValue: { fontSize: type.hero, fontWeight: type.bold, fontVariant: ['tabular-nums'], letterSpacing: -1 },
  pctPill: { marginTop: space.sm, paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill },
  pctText: { fontSize: type.caption, fontWeight: type.bold, fontVariant: ['tabular-nums'] },
  divider: { height: 1, alignSelf: 'stretch', marginVertical: space.xl },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch' },
  stat: { flex: 1, alignItems: 'center', gap: space.xs },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  emptyEmoji: { fontSize: 40 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  logIcon: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  trash: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dock: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, gap: space.md },
  quickRow: { flexDirection: 'row', gap: space.sm },
  quick: { flex: 1, height: 64, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: space.xs },
  quickEmoji: { fontSize: 20 },
  backdrop: { flex: 1, backgroundColor: 'rgba(6,16,29,0.55)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  celebrate: { width: '100%', maxWidth: 360, borderRadius: radius.lg, padding: space.xxl, alignItems: 'center', overflow: 'hidden' },
  celebrateGlow: { position: 'absolute', top: -80, width: 240, height: 240, borderRadius: 120, opacity: 0.12 },
  celebrateEmoji: { fontSize: 64 },
  sparkles: { fontSize: type.body, marginVertical: space.sm },
});
