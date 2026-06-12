import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { font, spacing } from '../theme/theme';

// Δείκτης φόρτωσης με προαιρετική ετικέτα
export function Loading({ label }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(3), backgroundColor: colors.bg },
  label: { color: colors.textMuted, marginTop: spacing(1.5), fontSize: font.sm },
}));
