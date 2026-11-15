import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HydrationProvider, useHydration } from './src/store';
import { useTheme } from './src/components/ui';
import TabBar from './src/components/TabBar';
import Today from './src/screens/Today';
import History from './src/screens/History';
import Settings from './src/screens/Settings';
import Onboarding from './src/screens/Onboarding';

const SCREENS = { today: Today, history: History, settings: Settings };

function Root() {
  const t = useTheme();
  const { ready, onboarded } = useHydration();
  const [tab, setTab] = useState('today');
  const Screen = SCREENS[tab];

  return (
    <View style={[styles.flex, { backgroundColor: t.bg }]}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.frame}>
          {!ready ? (
            <View style={styles.center}>
              <ActivityIndicator color={t.accent} />
            </View>
          ) : !onboarded ? (
            <Onboarding />
          ) : (
            <>
              <View style={styles.flex}>
                <Screen />
              </View>
              <TabBar current={tab} onChange={setTab} />
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <HydrationProvider>
        <Root />
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
