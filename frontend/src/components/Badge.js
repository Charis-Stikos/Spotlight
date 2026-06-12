import { View, Text } from 'react-native';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { radius, font, spacing } from '../theme/theme';

// Μικρή ετικέτα-pill (κατηγορίες θέσεων / καταστάσεις)
export function Badge({ label, color, filled = false }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const c = color || colors.accent;
  return (
    <View style={[styles.badge, { borderColor: c }, filled && { backgroundColor: c }]}>
      <Text style={[styles.text, { color: filled ? colors.primaryText : c }]}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  badge: {
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.4),
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: font.xs, fontWeight: '700' },
}));
