// Système de design : 60 % neutre, 30 % texte, 10 % accent eau.
// Espacements sur une grille de 8 pt, 4 tailles de texte, 2 graisses.

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 12, md: 16, lg: 24, pill: 999 };

export const type = {
  hero: 40, // le chiffre principal (ml bus)
  title: 22,
  body: 16,
  caption: 13,
  regular: '400',
  bold: '700',
};

const accent = '#2B7FFF';

export const themes = {
  light: {
    dark: false,
    bg: '#F3F7FC',
    card: '#FFFFFF',
    text: '#0B1B2E',
    textBody: 'rgba(11,27,46,0.8)',
    textMuted: 'rgba(11,27,46,0.55)',
    border: 'rgba(43,127,255,0.08)',
    accent,
    accentSoft: 'rgba(43,127,255,0.08)',
    accentTrack: 'rgba(43,127,255,0.12)',
    success: '#16A34A',
    danger: '#E5484D',
    shadow: '#2B7FFF',
  },
  dark: {
    dark: true,
    bg: '#06101D',
    card: '#0E1B2C',
    text: '#EAF2FB',
    textBody: 'rgba(234,242,251,0.82)',
    textMuted: 'rgba(234,242,251,0.55)',
    border: 'rgba(110,168,255,0.12)',
    accent: '#5B9DFF',
    accentSoft: 'rgba(91,157,255,0.12)',
    accentTrack: 'rgba(91,157,255,0.16)',
    success: '#3DD68C',
    danger: '#FF6B6F',
    shadow: '#000000',
  },
};

export function cardShadow(t) {
  return {
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: t.dark ? 0.35 : 0.08,
    shadowRadius: 24,
    elevation: 3,
  };
}
