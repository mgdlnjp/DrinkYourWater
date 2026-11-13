import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Switch,
  Alert,
  Platform,
  Appearance,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { AdMobBanner } from "expo-ads-admob";

// const AdMobBanner = () => (
//   <AdMobBanner style={{ backgroundColor: '#D4F0FC', alignItems: 'center', padding: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
//     {<Text style={{ color: '#44aeea' }}>Bannière pub Google AdMob ici</Text>}
//   </AdMobBanner>
// )

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const START_HOUR = 6;
const END_HOUR = 22;

function formatTime(hour, minute) {
  return `${hour.toString().padStart(2, "0")}h${minute
    .toString()
    .padStart(2, "0")}`;
}

export default function App() {
  const [remindersPerDay, setRemindersPerDay] = useState(6);
  const [totalWater, setTotalWater] = useState(1.5); // en L
  const [waterDrank, setWaterDrank] = useState(0); // en L
  const [darkMode, setDarkMode] = useState(
    Appearance.getColorScheme() === "dark"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const reminders = await AsyncStorage.getItem("remindersPerDay");
        const water = await AsyncStorage.getItem("totalWater");
        const drank = await AsyncStorage.getItem("waterDrank");
        const dark = await AsyncStorage.getItem("darkMode");
        const saved = await AsyncStorage.getItem("settingsSaved");
        if (reminders) setRemindersPerDay(Number(reminders));
        if (water) setTotalWater(Number(water) / 1000);
        if (drank) setWaterDrank(Number(drank) / 1000);
        if (dark !== null) setDarkMode(dark === "true");
        if (saved === "true") setSettingsSaved(true);
      } catch (e) {
        Alert.alert("Erreur", "Impossible de charger les paramètres");
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setWaterDrank(0);
        AsyncStorage.setItem("waterDrank", "0");
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function getReminderTimes(n) {
    const times = [];
    const start = START_HOUR * 60;
    const end = END_HOUR * 60;
    if (n === 1) {
      times.push({ hour: START_HOUR, minute: 0 });
    } else {
      const interval = (end - start) / (n - 1);
      for (let i = 0; i < n; i++) {
        const totalMinutes = Math.round(start + i * interval);
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        times.push({ hour, minute });
      }
    }
    return times;
  }

  async function scheduleNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const times = getReminderTimes(remindersPerDay);
    const qtyPerReminder = Math.round((totalWater * 1000) / remindersPerDay);

    for (let i = 0; i < times.length; i++) {
      const { hour, minute } = times[i];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Hydratation",
          body: `Bois ${(qtyPerReminder / 1000).toFixed(
            2
          )} L d'eau maintenant ! (Rappel à ${formatTime(hour, minute)})`,
          sound: false,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    }
  }

  async function saveSettings() {
    if (
      isNaN(remindersPerDay) ||
      remindersPerDay < 1 ||
      remindersPerDay > 20 ||
      isNaN(totalWater) ||
      totalWater < 0.25 ||
      totalWater > 5
    ) {
      Alert.alert("Erreur", "Vérifie les valeurs saisies.");
      return;
    }
    try {
      await AsyncStorage.setItem("remindersPerDay", remindersPerDay.toString());
      await AsyncStorage.setItem(
        "totalWater",
        Math.round(totalWater * 1000).toString()
      );
      await AsyncStorage.setItem("darkMode", darkMode ? "true" : "false");
      await AsyncStorage.setItem("settingsSaved", "true");
      // Réinitialise la progression à zéro à chaque nouvel enregistrement
      setWaterDrank(0);
      await AsyncStorage.setItem("waterDrank", "0");
      setSettingsSaved(true);
      await scheduleNotifications();
      Alert.alert(
        "Succès",
        "Paramètres enregistrés et notifications programmées !"
      );
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder les paramètres");
    }
  }

  // Remise à zéro de la progression à 100% + vérification des paramètres
  async function handleDrink() {
    // Vérifie que les paramètres ont bien été enregistrés
    if (!settingsSaved) {
      Alert.alert(
        "Paramètres manquants",
        "Merci d'enregistrer et programmer vos paramètres avant d'utiliser ce bouton."
      );
      return;
    }
    // Vérifie que les paramètres sont valides (enregistrés)
    if (
      isNaN(remindersPerDay) ||
      remindersPerDay < 1 ||
      remindersPerDay > 20 ||
      isNaN(totalWater) ||
      totalWater < 0.25 ||
      totalWater > 5
    ) {
      Alert.alert(
        "Paramètres invalides",
        "Merci d'enregistrer et programmer des paramètres valides."
      );
      return;
    }

    const qtyPerReminder = totalWater / remindersPerDay;
    let newDrank = waterDrank + qtyPerReminder;
    if (newDrank >= totalWater) {
      setWaterDrank(0);
      await AsyncStorage.setItem("waterDrank", "0");
      Alert.alert(
        "Bravo !",
        "Objectif d'hydratation atteint pour aujourd'hui 🎉"
      );
    } else {
      setWaterDrank(newDrank);
      await AsyncStorage.setItem(
        "waterDrank",
        Math.round(newDrank * 1000).toString()
      );
    }
  }

  const percent = Math.min(100, Math.round((waterDrank / totalWater) * 100));
  const qtyPerReminder = totalWater / remindersPerDay;
  const themeIcon = darkMode ? "🌙" : "☀️";

  if (isLoading) {
    return (
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <View style={styles.darkModeSwitchContainerRight}>
          <Text style={[styles.darkModeLabel, darkMode && styles.darkText]}>
            {themeIcon}
          </Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <Text style={[styles.title, darkMode && styles.darkText]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.darkModeSwitchContainerRight}>
        <Text style={[styles.darkModeLabel, darkMode && styles.darkText]}>
          {themeIcon}
        </Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Text style={[styles.dropIcon, darkMode && styles.darkText]}>💧</Text>
      <Text style={[styles.title, darkMode && styles.darkText]}>
        Rappel d'Hydratation
      </Text>
      <View style={styles.inputsRow}>
        <View style={styles.inputBlock}>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Rappels/jour
          </Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            keyboardType="number-pad"
            value={remindersPerDay.toString()}
            onChangeText={(t) =>
              setRemindersPerDay(Number(t.replace(/[^0-9]/g, "")))
            }
            maxLength={2}
          />
        </View>
        <View style={styles.inputBlock}>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Quantité (L)
          </Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            keyboardType="decimal-pad"
            value={totalWater.toString().replace(".", ",")}
            onChangeText={(t) => {
              const normalized = t.replace(",", ".").replace(/[^0-9.]/g, "");
              setTotalWater(Number(normalized));
            }}
            maxLength={4}
          />
        </View>
      </View>
      <Button
        title="Enregistrer & Programmer"
        onPress={saveSettings}
        color={darkMode ? "#90caf9" : "#0077b6"}
      />
      <View style={{ height: 24 }} />
      <Text style={[styles.label, darkMode && styles.darkText]}>
        Prochain rappel : {qtyPerReminder.toFixed(2)} L à boire
      </Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${percent}%` },
            darkMode && styles.darkProgressBar,
          ]}
        />
      </View>
      <Text style={[styles.progressText, darkMode && styles.darkText]}>
        {waterDrank.toFixed(2)} L / {totalWater.toFixed(2)} L ({percent}%)
      </Text>
      {settingsSaved ? (
        <Button
          title="J'ai bu !"
          onPress={handleDrink}
          color={darkMode ? "#b3e0ff" : "#00b4d8"}
        />
      ) : (
        <Text
          style={{
            color: darkMode ? "#b3e0ff" : "#0077b6",
            marginTop: 8,
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Merci d'enregistrer et programmer vos paramètres avant de commencer.
        </Text>
      )}

      <View style={{ flex: 1 }} />
      {/* <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // ID de test fourni par Google
        servePersonalizedAds // true = pubs personnalisées
        onDidFailToReceiveAdWithError={(err) => console.log(err)}
      /> */}
      <Text style={[styles.footer, darkMode && styles.darkText]}>
        <AdMobBanner
          bannerSize="fullBanner"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // ID de test fourni par Google
          servePersonalizedAds // true = pubs personnalisées
          onDidFailToReceiveAdWithError={(err) => console.log(err)}
        />
        {Platform.OS === "ios" ? "🍏" : "🤖"} Hydrate-toi bien !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  darkContainer: {
    backgroundColor: "#22304a",
  },
  darkModeSwitchContainerRight: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  darkModeLabel: {
    fontSize: 18,
    marginRight: 6,
    color: "#0077b6",
  },
  dropIcon: {
    fontSize: 48,
    marginBottom: 0,
    marginTop: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#0077b6",
    textAlign: "center",
  },
  darkText: {
    color: "#b3e0ff",
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: "#0077b6",
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
  },
  inputBlock: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    fontSize: 18,
    width: 120,
    textAlign: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#b3e0ff",
  },
  darkInput: {
    backgroundColor: "#2a3b5d",
    color: "#b3e0ff",
    borderColor: "#90caf9",
  },
  progressBarContainer: {
    width: "100%",
    height: 20,
    backgroundColor: "#b3e0ff",
    borderRadius: 10,
    marginVertical: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0077b6",
    borderRadius: 10,
  },
  darkProgressBar: {
    backgroundColor: "#90caf9",
  },
  progressText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#0077b6",
    textAlign: "center",
  },
  footer: {
    fontSize: 14,
    marginBottom: 16,
    color: "#0077b6",
    opacity: 0.7,
  },
});
