# DrinkYourWater 💧

App mobile (React Native / Expo) qui t'aide à boire assez d'eau : rappels doux dans la journée, suivi en un tap et progrès sur la semaine.

Cette v2 réunit trois anciens prototypes (DrinkYourWater, DrinkYourWater React Native, water-reminder-app) en une seule app.

## Fonctionnalités
- **Aujourd'hui** : anneau de progression, ajout rapide (tasse, canette, gourde, verre habituel), journal du jour avec annulation, célébration quand l'objectif est atteint.
- **Progrès** : 7 derniers jours, série de jours réussis, moyenne, conseils santé.
- **Réglages** : objectif, taille du verre, plage horaire réveil → coucher, fréquence des rappels, thème auto/clair/sombre.
- Onboarding en 2 étapes, notifications locales quotidiennes, données stockées sur l'appareil (aucun compte).

## Lancer
```bash
npm install
npx expo start        # puis Expo Go ou un dev build
npx expo start --web  # aperçu navigateur (sans notifications)
```

## Structure
```
App.js                 navigation par onglets + onboarding
src/store.js           état, persistance (AsyncStorage), calcul des rappels et séries
src/notifications.js   planification des rappels quotidiens
src/theme.js           couleurs, espacements (grille 8 pt), typographie
src/components/        anneau de progression, barre d'onglets, boutons, puces
src/screens/           Today, History, Settings, Onboarding
```
