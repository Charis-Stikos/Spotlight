import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { radius, font, spacing } from '../theme/theme';

// Πεδίο κειμένου με label, σφάλμα, εναλλαγή εμφάνισης κωδικού και προαιρετικό κουμπί καθαρισμού
export function TextField({ label, value, onChangeText, error, secureTextEntry, clearable = false, ...props }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, focused && styles.focused, !!error && styles.errored]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {clearable && value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { marginBottom: spacing(2) },
  label: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing(0.75), fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(1.75),
  },
  focused: { borderColor: colors.accent },
  errored: { borderColor: colors.danger },
  input: { flex: 1, height: 50, color: colors.text, fontSize: font.md },
  toggle: { color: colors.accent, fontWeight: '600', fontSize: font.sm, marginLeft: spacing(1) },
  error: { color: colors.danger, fontSize: font.xs, marginTop: spacing(0.5) },
}));
