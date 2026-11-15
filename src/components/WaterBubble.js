import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ND } from './ui';

// Vague périodique : la période divise `size`, donc un décalage de `size` boucle sans couture.
function wavePath(width, period, amp, height) {
  let d = `M0 ${amp}`;
  for (let x = 0; x < width; x += period) {
    d += ` Q ${x + period / 4} ${-amp} ${x + period / 2} ${amp}`;
    d += ` Q ${x + (3 * period) / 4} ${3 * amp} ${x + period} ${amp}`;
  }
  return `${d} L ${width} ${height} L 0 ${height} Z`;
}

// Hauteur occupée par tout le reste de l'étape d'onboarding la plus chargée
// (en-tête, contenu, bouton) : la bulle prend ce qui reste, sans jamais forcer le défilement.
const RESERVED_HEIGHT = 540;

// Taille unique de la bulle dans toute l'app : elle suit la taille de l'écran
// (largeur ET hauteur) mais ne change jamais d'un écran ou d'une étape à l'autre.
export function useBubbleSize() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const byWidth = Math.min(width, 520) * 0.56;
  const byHeight = height - insets.top - insets.bottom - RESERVED_HEIGHT;
  return Math.round(Math.max(100, Math.min(232, byWidth, byHeight)));
}

// Bulle d'eau animée : le niveau monte avec la progression, deux vagues ondulent,
// et des bulles s'échappent à chaque verre ajouté (`burst`).
export default function WaterBubble({ progress, size = 240, burst = 0, children }) {
  const level = useRef(new Animated.Value(0)).current;
  const w1 = useRef(new Animated.Value(0)).current;
  const w2 = useRef(new Animated.Value(0)).current;
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    Animated.spring(level, {
      toValue: Math.min(1, Math.max(0, progress)),
      useNativeDriver: ND,
      speed: 4,
      bounciness: 8,
    }).start();
  }, [progress]);

  useEffect(() => {
    const loop = (v, duration) =>
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: ND }));
    const a = loop(w1, 3400);
    const b = loop(w2, 5600);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, []);

  useEffect(() => {
    if (!burst) return;
    const fresh = Array.from({ length: 7 }, (_, i) => ({
      id: `${burst}-${i}`,
      x: size * (0.2 + Math.random() * 0.6),
      r: 4 + Math.random() * 7,
      v: new Animated.Value(0),
      delay: i * 70,
    }));
    setBubbles(fresh);
    fresh.forEach((b) =>
      Animated.timing(b.v, {
        toValue: 1,
        duration: 1100 + Math.random() * 500,
        delay: b.delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: ND,
      }).start()
    );
    const id = setTimeout(() => setBubbles([]), 2000);
    return () => clearTimeout(id);
  }, [burst]);

  const AMP = 7;
  const W = size * 2;
  const H = size + AMP * 2;
  const ty = level.interpolate({ inputRange: [0, 1], outputRange: [size * 0.93 - AMP, size * 0.04 - AMP] });
  const tx1 = w1.interpolate({ inputRange: [0, 1], outputRange: [0, -size] });
  const tx2 = w2.interpolate({ inputRange: [0, 1], outputRange: [-size, 0] });
  const front = wavePath(W, size / 2, AMP, H);
  const back = wavePath(W, size / 2, AMP * 0.8, H);

  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.halo, { borderRadius: size, margin: -size * 0.08 }]} />
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Animated.View style={[styles.water, { width: W, height: H, transform: [{ translateY: ty }] }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { top: -5, transform: [{ translateX: tx2 }] }]}>
            <Svg width={W} height={H}>
              <Path d={back} fill="rgba(170,225,255,0.45)" />
            </Svg>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: tx1 }] }]}>
            <Svg width={W} height={H}>
              <Defs>
                <LinearGradient id="water" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#9BE7FF" />
                  <Stop offset="0.45" stopColor="#4DB2FF" />
                  <Stop offset="1" stopColor="#2A7BFF" />
                </LinearGradient>
              </Defs>
              <Path d={front} fill="url(#water)" />
            </Svg>
          </Animated.View>
        </Animated.View>

        {bubbles.map((b) => (
          <Animated.View
            key={b.id}
            pointerEvents="none"
            style={[
              styles.bubble,
              {
                left: b.x,
                width: b.r * 2,
                height: b.r * 2,
                borderRadius: b.r,
                opacity: b.v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.9, 0.7, 0] }),
                transform: [{ translateY: b.v.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.6] }) }],
              },
            ]}
          />
        ))}

        {/* reflet de verre */}
        <View
          pointerEvents="none"
          style={[
            styles.gloss,
            { top: size * 0.1, left: size * 0.16, width: size * 0.26, height: size * 0.11, borderRadius: size },
          ]}
        />
        <View style={styles.center} pointerEvents="none">
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.07)' },
  circle: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  water: { position: 'absolute', left: 0, top: 0 },
  bubble: { position: 'absolute', bottom: 12, backgroundColor: 'rgba(255,255,255,0.75)' },
  gloss: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.28)', transform: [{ rotate: '-28deg' }] },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
