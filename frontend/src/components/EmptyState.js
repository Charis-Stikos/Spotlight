import { View, Text, StyleSheet } from 'react-native';
import { colors, font, spacing } from '../theme/theme';

// Κενή κατάσταση (εικονίδιο + τίτλος + υπότιτλος) για άδειες λίστες
export function EmptyState({ icon = '🎭', title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing(4) },
  icon: { fontSize: 44, marginBottom: spacing(1.5) },
  title: { color: colors.text, fontSize: font.lg, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: font.sm, textAlign: 'center', marginTop: spacing(0.75) },
});
