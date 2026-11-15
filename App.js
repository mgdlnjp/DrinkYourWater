import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { HydrationProvider, useHydration } from './src/store';
import { useTheme } from './src/components/ui';
import TabBar from './src/components/TabBar';
import Today from './src/screens/Today';
import History from './src/screens/History';
import Settings from './src/screens/Settings';
import Onboarding from './src/screens/Onboarding';

const SCREENS = { today: Today, history: History, settings: Settings };

function Root({ fontsReady }) {
  const t = useTheme();
  const { ready, onboarded } = useHydration();
  const [tab, setTab] = useState('today');
  const Screen = SCREENS[tab];
  // L'en-tête dégradé passe sous la barre d'état : texte clair sur Aujourd'hui et l'onboarding.
  const lightStatus = t.dark || !onboarded || tab === 'today';

  return (
    <View style={[styles.flex, { backgroundColor: t.bg }]}>
      <StatusBar style={lightStatus ? 'light' : 'dark'} />
      <View style={styles.frame}>
        {!ready || !fontsReady ? (
          <View style={styles.center}>
            <ActivityIndicator color={t.accent} />
          </View>
        ) : !onboarded ? (
          <Onboarding />
        ) : (
          <>
            <Screen />
            <TabBar current={tab} onChange={setTab} />
          </>
        )}
      </View>
    </View>
  );
}

export default function App() {
  const [fontsReady] = useFonts({ Nunito_600SemiBold, Nunito_800ExtraBold });
  return (
    <SafeAreaProvider>
      <HydrationProvider>
        <Root fontsReady={fontsReady} />
      </HydrationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Sur tablette / web, on garde une largeur de téléphone lisible.
  frame: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
