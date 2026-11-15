import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHydration, nextReminder, streak } from '../store';
import WaterBubble from '../components/WaterBubble';
import Timeline from '../components/Timeline';
import { useTabSpace } from '../components/TabBar';
import {
  Card,
  Chip,
  ND,
  PressableScale,
  PrimaryButton,
  SectionTitle,
  Stepper,
  Txt,
  formatMl,
  formatNumber,
  hhmm,
  tap,
  useTheme,
} from '../components/ui';
import { drinks, radius, space } from '../theme';

const WHITE_70 = 'rgba(255,255,255,0.72)';

function greeting(d) {
  const h = d.getHours();
  if (h < 5) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function mood(pct) {
  if (pct === 0) return { emoji: '😴', text: 'Ta bulle est vide. Un grand verre pour la réveiller ?' };
  if (pct < 0.35) return { emoji: '🙂', text: 'Bon début ! Garde ce rythme.' };
  if (pct < 0.7) return { emoji: '😊', text: 'Déjà la moitié, continue comme ça.' };
  if (pct < 1) return { emoji: '😃', text: 'Presque ! Encore un petit effort.' };
  return { emoji: '🤩', text: 'Objectif atteint, tu es au top !' };
}

export default function Today() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabSpace();
  const { settings, now, todayEntries, drankMl, addDrink, removeDrink, log } = useHydration();
  const goal = settings.goalMl;
  const pct = drankMl / goal;
  const remaining = Math.max(0, goal - drankMl);
  const next = nextReminder(settings, now);
  const days = streak(log, goal, now);
  const m = mood(pct);

  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const drink = (ml) => {
    addDrink(ml);
    setBurst((b) => b + 1);
    setToast({ ml, key: Date.now() });
    if (drankMl < goal && drankMl + ml >= goal) {
      tap('success');
      setTimeout(() => setCelebrate(true), 900);
    }
  };

  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabSpace + 96 }} showsVerticalScrollIndicator={false}>
        {/* Héros : la bulle d'eau, ce qu'on doit voir en premier */}
        <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={[styles.hero, { paddingTop: insets.top + space.lg }]}>
          <View style={[styles.blob, styles.blobA]} />
          <View style={[styles.blob, styles.blobB]} />

          <View style={styles.header}>
            <View style={styles.flex}>
              <Txt v="caption" color={WHITE_70} style={styles.cap}>
                {dateLabel}
              </Txt>
              <Txt v="title" bold color="#fff">
                {greeting(now)} 👋
              </Txt>
            </View>
            <View style={styles.glassPill} accessibilityLabel={`Série de ${days} jours`}>
              <Text style={styles.emoji}>🔥</Text>
              <Txt v="body" bold color="#fff">
                {days}
              </Txt>
            </View>
          </View>

          <View style={styles.bubbleWrap}>
            <WaterBubble progress={pct} size={212} burst={burst}>
              <Txt v="hero" bold color="#fff" style={styles.shadowText}>
                {formatNumber(drankMl)}
              </Txt>
              <Txt v="body" color="#fff" style={styles.shadowText}>
                sur {formatNumber(goal)} ml
              </Txt>
              <View style={[styles.pctPill, pct >= 1 && { backgroundColor: '#fff' }]}>
                <Txt v="caption" bold color={pct >= 1 ? t.success : '#fff'}>
                  {pct >= 1 ? '✓ ' : ''}
                  {Math.round(pct * 100)} %
                </Txt>
              </View>
            </WaterBubble>
            <Toast toast={toast} />
          </View>

          <View style={styles.moodRow}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Txt v="body" bold color="#fff">
              {m.text}
            </Txt>
          </View>

          <View style={styles.statsRow}>
            <GlassStat icon="flag" value={remaining ? formatMl(remaining) : 'Fini !'} label="restant" />
            <GlassStat icon="water" value={`${todayEntries.length}`} label={todayEntries.length > 1 ? 'verres' : 'verre'} />
            <GlassStat
              icon="notifications"
              value={next ? hhmm(next.hour, next.minute) : 'Off'}
              label={next?.tomorrow ? 'demain' : 'rappel'}
            />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Ajout rapide : cartes colorées à faire défiler */}
          <SectionTitle right={<Txt v="caption" color={t.textMuted}>appui long = perso</Txt>}>Ajouter une boisson</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinkRow} style={styles.bleed}>
            {drinks.map((d) => (
              <PressableScale
                key={d.ml}
                onPress={() => drink(d.ml)}
                onLongPress={() => setSheet(true)}
                accessibilityLabel={`Ajouter ${d.label} ${d.ml} ml`}
                style={[styles.drinkCard, { backgroundColor: t.card, borderColor: t.border }]}
              >
                <View style={[styles.drinkIcon, { backgroundColor: `${d.tint}1F` }]}>
                  <Text style={styles.drinkEmoji}>{d.emoji}</Text>
                </View>
                <Txt v="body" bold>
                  {d.ml} ml
                </Txt>
                <Txt v="caption" color={t.textMuted}>
                  {d.label}
                </Txt>
              </PressableScale>
            ))}
            <PressableScale
              onPress={() => setSheet(true)}
              accessibilityLabel="Quantité personnalisée"
              style={[styles.drinkCard, styles.drinkOther, { borderColor: t.accentTrack }]}
            >
              <View style={[styles.drinkIcon, { backgroundColor: t.accentSoft }]}>
                <Ionicons name="options" size={22} color={t.accent} />
              </View>
              <Txt v="body" bold color={t.accent}>
                Autre
              </Txt>
              <Txt v="caption" color={t.textMuted}>
                sur mesure
              </Txt>
            </PressableScale>
          </ScrollView>

          {/* Frise de la journée */}
          <View style={styles.gap} />
          <SectionTitle right={<Txt v="caption" color={t.textMuted}>• rappels</Txt>}>Ta journée</SectionTitle>
          <Card>
            <Timeline settings={settings} entries={todayEntries} now={now} />
          </Card>

          {/* Historique du jour */}
          <View style={styles.gap} />
          <SectionTitle>Historique</SectionTitle>
          {todayEntries.length === 0 ? (
            <Card style={styles.empty}>
              <Text style={styles.emptyEmoji}>🫧</Text>
              <Txt v="body" bold>
                Rien pour l'instant
              </Txt>
              <Txt v="caption" color={t.textMuted} style={styles.centerText}>
                Chaque verre ajouté apparaît ici. Un appui sur la croix l'annule.
              </Txt>
            </Card>
          ) : (
            <View style={styles.logWrap}>
              {[...todayEntries].reverse().map((e) => (
                <View key={e.id} style={[styles.logChip, { backgroundColor: t.card, borderColor: t.border }]}>
                  <Ionicons name="water" size={14} color={t.accent} />
                  <Txt v="caption" bold>
                    {formatMl(e.ml)}
                  </Txt>
                  <Txt v="caption" color={t.textMuted}>
                    {new Date(e.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Txt>
                  <Pressable
                    accessibilityLabel={`Supprimer ${formatMl(e.ml)}`}
                    hitSlop={12}
                    onPress={() => {
                      tap('light');
                      removeDrink(e.id);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={t.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Zone du pouce : l'action principale, juste au-dessus de la barre d'onglets */}
      <LinearGradient
        pointerEvents="box-none"
        colors={[`${t.bg}00`, t.bg, t.bg]}
        style={[styles.dock, { paddingBottom: tabSpace }]}
      >
        <PrimaryButton
          icon="add-circle"
          label={`Boire un verre · ${settings.glassMl} ml`}
          onPress={() => drink(settings.glassMl)}
        />
      </LinearGradient>

      <AddSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onAdd={(ml) => {
          setSheet(false);
          drink(ml);
        }}
      />
      <Celebration visible={celebrate} goal={goal} glasses={todayEntries.length} streak={days} onClose={() => setCelebrate(false)} />
    </View>
  );
}

function GlassStat({ icon, value, label }) {
  return (
    <View style={styles.glassStat}>
      <Ionicons name={icon} size={16} color={WHITE_70} />
      <Txt v="body" bold color="#fff" numberOfLines={1}>
        {value}
      </Txt>
      <Txt v="caption" color={WHITE_70}>
        {label}
      </Txt>
    </View>
  );
}

// « +250 ml » qui s'envole au-dessus de la bulle.
function Toast({ toast }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!toast) return;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  }, [toast?.key]);
  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, -48] }) },
            { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.6, 1.1, 1] }) },
          ],
        },
      ]}
    >
      <Txt v="title" bold color="#fff" style={styles.shadowText}>
        +{toast.ml} ml
      </Txt>
    </Animated.View>
  );
}

// Feuille du bas : quantité sur mesure, sans clavier.
function AddSheet({ visible, onClose, onAdd }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [ml, setMl] = useState(200);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: t.card, paddingBottom: insets.bottom + space.xl }]}>
        <View style={[styles.grabber, { backgroundColor: t.accentTrack }]} />
        <Txt v="title" bold style={styles.centerText}>
          Quantité sur mesure
        </Txt>
        <Txt v="hero" bold color={t.accent} style={[styles.centerText, { marginVertical: space.lg }]}>
          {ml} ml
        </Txt>
        <View style={styles.centerRow}>
          <Stepper
            value={ml}
            format={() => '50 ml'}
            onMinus={() => setMl((v) => Math.max(50, v - 50))}
            onPlus={() => setMl((v) => Math.min(2000, v + 50))}
          />
        </View>
        <View style={[styles.chips, { marginVertical: space.xl }]}>
          {[100, 200, 300, 400, 600, 1000].map((v) => (
            <Chip key={v} label={formatMl(v)} selected={ml === v} onPress={() => setMl(v)} />
          ))}
        </View>
        <PrimaryButton icon="add-circle" label={`Ajouter ${ml} ml`} onPress={() => onAdd(ml)} />
      </View>
    </Modal>
  );
}

// Le moment fort : objectif atteint.
function Celebration({ visible, goal, glasses, streak: days, onClose }) {
  const t = useTheme();
  const scale = useRef(new Animated.Value(0.5)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.5);
    spin.setValue(0);
    Animated.spring(scale, { toValue: 1, useNativeDriver: ND, bounciness: 14 }).start();
    Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  }, [visible]);

  const confetti = ['🎉', '💧', '✨', '🎊', '💦', '⭐'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.celebrate, { backgroundColor: t.card, transform: [{ scale }] }]}>
          <LinearGradient colors={t.hero} style={styles.celebrateTop}>
            {confetti.map((c, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: `${8 + i * 15}%`,
                    transform: [
                      { translateY: spin.interpolate({ inputRange: [0, 1], outputRange: [-40, 20 + (i % 3) * 30] }) },
                      { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${i % 2 ? 200 : -200}deg`] }) },
                    ],
                  },
                ]}
              >
                {c}
              </Animated.Text>
            ))}
            <Text style={styles.trophy}>🏆</Text>
          </LinearGradient>
          <View style={styles.celebrateBody}>
            <Txt v="title" bold style={styles.centerText}>
              Objectif atteint !
            </Txt>
            <Txt v="body" color={t.textBody} style={[styles.centerText, { marginTop: space.sm }]}>
              {formatMl(goal)} en {glasses} {glasses > 1 ? 'verres' : 'verre'}.
              {days > 1 ? ` ${days} jours d'affilée, quelle régularité !` : ' Ton corps te dit merci.'}
            </Txt>
            <View style={{ alignSelf: 'stretch', marginTop: space.xl }}>
              <PrimaryButton label="Continuer" onPress={onClose} haptic="light" />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cap: { textTransform: 'capitalize' },
  emoji: { fontSize: 16 },
  centerText: { textAlign: 'center' },
  centerRow: { alignItems: 'center' },
  shadowText: { textShadowColor: 'rgba(0,30,90,0.35)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  blobA: { width: 280, height: 280, top: -120, right: -100 },
  blobB: { width: 200, height: 200, bottom: -60, left: -80 },
  header: { flexDirection: 'row', alignItems: 'center' },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  bubbleWrap: { alignItems: 'center', marginTop: space.xl, marginBottom: space.lg },
  pctPill: {
    marginTop: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  toast: { position: 'absolute', top: '40%' },
  moodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  moodEmoji: { fontSize: 22 },
  statsRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  glassStat: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 2,
  },
  body: { paddingHorizontal: space.lg, paddingTop: space.xl },
  bleed: { marginHorizontal: -space.lg },
  drinkRow: { paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.sm },
  drinkCard: { width: 104, padding: space.md, borderRadius: radius.lg, borderWidth: 1, gap: 2 },
  drinkOther: { borderStyle: 'dashed', borderWidth: 2 },
  drinkIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  drinkEmoji: { fontSize: 24 },
  gap: { height: space.xxl },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  emptyEmoji: { fontSize: 40 },
  logWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  logChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.md,
    paddingRight: space.sm,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: space.xxl },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(5,13,26,0.5)' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xl },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(5,13,26,0.6)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  celebrate: { width: '100%', maxWidth: 360, borderRadius: radius.xl, overflow: 'hidden' },
  celebrateTop: { height: 160, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  confetti: { position: 'absolute', top: 0, fontSize: 22 },
  trophy: { fontSize: 72 },
  celebrateBody: { padding: space.xl, alignItems: 'center' },
});
