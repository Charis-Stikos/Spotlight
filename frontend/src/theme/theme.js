// Κεντρικά design tokens — δύο παλέτες: "Sunset" (ανοιχτό) και "Midnight" (σκούρο)
export const palettes = {
  light: {
    bg: '#F6F5FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EEFA',
    border: '#E9E6F2',
    primary: '#7C4DFF',
    primaryText: '#FFFFFF',
    accent: '#FF5A8A',
    text: '#1A1626',
    textMuted: '#7A7490',
    success: '#16B981',
    danger: '#F43F5E',
    warning: '#F59E0B',
    // καταστάσεις / κατηγορίες θέσεων
    standard: '#3B82F6',
    premium: '#A855F7',
    vip: '#F59E0B',
    seatTaken: '#E4E0EE',
    seatSelected: '#16B981',
  },
  dark: {
    bg: '#0F0D17',
    surface: '#1B1726',
    surfaceAlt: '#262031',
    border: '#2F2840',
    primary: '#9D7BFF',
    primaryText: '#FFFFFF',
    accent: '#FF7DA3',
    text: '#F3F1FA',
    textMuted: '#A29BBE',
    success: '#2DD4A0',
    danger: '#FB6F8D',
    warning: '#FBBF24',
    // καταστάσεις / κατηγορίες θέσεων
    standard: '#5C9DFF',
    premium: '#C084FC',
    vip: '#FBBF24',
    seatTaken: '#322B45',
    seatSelected: '#2DD4A0',
  },
};

// Gradients της μάρκας (coral → violet) — κοινά και στα δύο θέματα
export const gradients = {
  brand: ['#FF6A88', '#7C4DFF'],
  warm: ['#FF8A5B', '#FF5A8A'],
};

export const categoryColor = (category, colors) =>
  ({ STANDARD: colors.standard, PREMIUM: colors.premium, VIP: colors.vip }[category] || colors.standard);

export const spacing = (n) => n * 8;

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };

export const font = { xs: 12, sm: 14, md: 16, lg: 20, xl: 26, xxl: 34 };

// Σκιάσεις ανά θέμα — πιο διακριτικές στο ανοιχτό, πιο βαθιές στο σκούρο
export const shadows = {
  light: {
    card: {
      shadowColor: '#2A2440',
      shadowOpacity: 0.07,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    soft: {
      shadowColor: '#2A2440',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.45,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    soft: {
      shadowColor: '#000000',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
  },
};
