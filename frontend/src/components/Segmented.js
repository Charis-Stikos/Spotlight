import { View, Text, Pressable } from 'react-native';
import { tapLight } from '../utils/haptics';
import { makeStyles } from '../theme/ThemeContext';
import { font, spacing, radius } from '../theme/theme';

// Διακόπτης επιλογών (segmented control) — options: [[key, label], ...]
export function Segmented({ value, onChange, options }) {
  const styles = useStyles();
  return (
    <View style={styles.segment}>
      {options.map(([key, label]) => (
        <Pressable
          key={key}
          onPress={() => { tapLight(); onChange(key); }}
          style={[styles.btn, value === key && styles.active]}
        >
          <Text style={[styles.text, value === key && styles.textActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing(1.5), borderWidth: 1, borderColor: colors.border },
  btn: { flex: 1, paddingVertical: spacing(1), borderRadius: radius.sm, alignItems: 'center' },
  active: { backgroundColor: colors.primary },
  text: { color: colors.textMuted, fontWeight: '700', fontSize: font.sm },
  textActive: { color: colors.primaryText },
}));
