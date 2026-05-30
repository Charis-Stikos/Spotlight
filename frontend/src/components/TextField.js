import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, radius, font, spacing } from '../theme/theme';

// Πεδίο κειμένου με label, σφάλμα και εναλλαγή εμφάνισης κωδικού
export function TextField({ label, value, onChangeText, error, secureTextEntry, ...props }) {
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

const styles = StyleSheet.create({
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
  toggle: { color: colors.accent, fontWeight: '600', fontSize: font.sm },
  error: { color: colors.danger, fontSize: font.xs, marginTop: spacing(0.5) },
});
