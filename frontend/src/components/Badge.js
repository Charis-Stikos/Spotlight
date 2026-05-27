import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font, spacing } from '../theme/theme';

// Μικρή ετικέτα-pill (κατηγορίες θέσεων / καταστάσεις)
export function Badge({ label, color = colors.accent, filled = false }) {
  return (
    <View style={[styles.badge, { borderColor: color }, filled && { backgroundColor: color }]}>
      <Text style={[styles.text, { color: filled ? colors.primaryText : color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.4),
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: font.xs, fontWeight: '700' },
});
