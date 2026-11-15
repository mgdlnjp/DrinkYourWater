// Système de design « Océan » : 60 % neutre, 30 % texte, 10 % accent eau.
// Grille de 8 pt, une seule famille (Nunito, arrondie), 4 tailles, 2 graisses.

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 12, md: 16, lg: 24, xl: 32, pill: 999 };

export const fonts = {
  regular: 'Nunito_600SemiBold',
  bold: 'Nunito_800ExtraBold',
};

export const type = {
  hero: 48,
  title: 24,
  body: 16,
  caption: 13,
};

export const lineHeight = { hero: 52, title: 30, body: 22, caption: 18 };

// Boissons : fond doux coloré + emoji, pour des cartes faciles à scanner.
export const drinks = [
  { ml: 250, emoji: '🥛', label: 'Verre', tint: '#2B7FFF' },
  { ml: 150, emoji: '☕', label: 'Tasse', tint: '#F59E0B' },
  { ml: 330, emoji: '🥤', label: 'Canette', tint: '#EC4899' },
  { ml: 500, emoji: '🍶', label: 'Gourde', tint: '#10B981' },
  { ml: 750, emoji: '🫗', label: 'Bouteille', tint: '#8B5CF6' },
];

export const themes = {
  light: {
    dark: false,
    bg: '#EEF4FC',
    card: '#FFFFFF',
    text: '#0B1B33',
    textBody: 'rgba(11,27,51,0.78)',
    textMuted: 'rgba(11,27,51,0.52)',
    border: 'rgba(43,127,255,0.08)',
    accent: '#2B7FFF',
    accentSoft: 'rgba(43,127,255,0.08)',
    accentTrack: 'rgba(43,127,255,0.14)',
    success: '#10B981',
    danger: '#E5484D',
    shadow: '#1E5BD8',
    hero: ['#3B8BFF', '#1557E8', '#0B3BB5'],
    tabBar: 'rgba(255,255,255,0.96)',
  },
  dark: {
    dark: true,
    bg: '#050D1A',
    card: '#0D1A2E',
    text: '#EAF2FF',
    textBody: 'rgba(234,242,255,0.8)',
    textMuted: 'rgba(234,242,255,0.5)',
    border: 'rgba(120,170,255,0.12)',
    accent: '#5B9DFF',
    accentSoft: 'rgba(91,157,255,0.12)',
    accentTrack: 'rgba(91,157,255,0.2)',
    success: '#34D399',
    danger: '#FF6B6F',
    shadow: '#000000',
    hero: ['#1D4FC4', '#0E2F86', '#071B52'],
    tabBar: 'rgba(16,30,52,0.96)',
  },
};

export function cardShadow(t, strength = 1) {
  return {
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: (t.dark ? 0.4 : 0.08) * strength,
    shadowRadius: 24,
    elevation: 3 * strength,
  };
}
