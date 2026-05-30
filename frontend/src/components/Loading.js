import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, font, spacing } from '../theme/theme';

// Δείκτης φόρτωσης με προαιρετική ετικέτα
export function Loading({ label }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(3), backgroundColor: colors.bg },
  label: { color: colors.textMuted, marginTop: spacing(1.5), fontSize: font.sm },
});
