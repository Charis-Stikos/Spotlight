import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors, font, spacing } from '../theme/theme';

// Προβολή σφάλματος με προαιρετικό κουμπί επανάληψης
export function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.msg}>{message || 'Something went wrong.'}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} style={styles.btn} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  icon: { fontSize: 40, marginBottom: spacing(1) },
  msg: { color: colors.textMuted, fontSize: font.md, textAlign: 'center' },
  btn: { marginTop: spacing(2), alignSelf: 'stretch' },
});
