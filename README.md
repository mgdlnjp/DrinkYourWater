# DrinkYourWater 💧

App mobile (React Native / Expo) qui t'aide à boire assez d'eau : rappels doux dans la journée, suivi en un tap et progrès sur la semaine.

Cette v2 réunit trois anciens prototypes (DrinkYourWater, DrinkYourWater React Native, water-reminder-app) en une seule app.

## Fonctionnalités
- **Aujourd'hui** : bulle d'eau animée (vagues, bulles à chaque verre), cartes de boissons colorées, quantité sur mesure (appui long), frise de la journée, célébration à l'objectif.
- **Progrès** : semaine en mini-bulles, série et record, calendrier 5 semaines, badges à débloquer, conseils santé.
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
src/components/        bulle d'eau animée, frise, barre d'onglets flottante, UI
src/screens/           Today, History, Settings, Onboarding
```
