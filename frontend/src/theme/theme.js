// Κεντρικά design tokens — χρώματα, αποστάσεις, τυπογραφία ("Sunset": ανοιχτό θέμα με gradients)
export const colors = {
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
};

// Gradients της μάρκας (coral → violet)
export const gradients = {
  brand: ['#FF6A88', '#7C4DFF'],
  warm: ['#FF8A5B', '#FF5A8A'],
};

export const categoryColor = (category) =>
  ({ STANDARD: colors.standard, PREMIUM: colors.premium, VIP: colors.vip }[category] || colors.standard);

export const spacing = (n) => n * 8;

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };

export const font = { xs: 12, sm: 14, md: 16, lg: 20, xl: 26, xxl: 34 };

// Ελαφριά σκίαση για ανοιχτές επιφάνειες (κάρτες / γραμμές)
export const shadow = {
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
};
