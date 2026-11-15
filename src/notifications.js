import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const MESSAGES = [
  'Une petite gorgée ? Ton corps te dira merci 💧',
  "C'est l'heure d'un verre d'eau 🥛",
  'Pause hydratation ! Quelques gorgées suffisent 🌊',
  'Ta concentration aime l’eau. Un verre ? 🧠',
  'Garde le rythme, tu es sur la bonne voie 💪',
];

export async function ensurePermission() {
  if (isWeb) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Si plusieurs replanifications se chevauchent, seule la plus récente va au bout.
let generation = 0;

export async function scheduleReminders(settings) {
  if (isWeb) return;
  const gen = ++generation;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.remindersOn) return;
    if (!(await ensurePermission())) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: "Rappels d'hydratation",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const start = settings.wakeHour * 60 + 30;
    const end = settings.sleepHour * 60;
    let i = 0;
    for (let m = start; m <= end && i < 60; m += settings.intervalMin, i++) {
      if (gen !== generation) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'DrinkYourWater',
          body: MESSAGES[i % MESSAGES.length],
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: Math.floor(m / 60),
          minute: m % 60,
          channelId: 'reminders',
        },
      });
    }
  } catch (e) {
    console.warn('Planification des rappels impossible', e);
  }
}
