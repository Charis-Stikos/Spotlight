import { Pressable, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { gradients, radius, font, spacing } from '../theme/theme';

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.primaryText : colors.text} />
  ) : (
    <Text style={[styles.text, variant === 'primary' && styles.textPrimary, variant === 'danger' && styles.textPrimary, variant === 'ghost' && styles.textGhost]}>
      {title}
    </Text>
  );

  // Το primary είναι το gradient κουμπί της μάρκας
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [styles.primaryWrap, isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed, style]}
      >
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientFill}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, styles[variant], isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed, style]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing(2.5),
  },
  // Wrapper με σκιά γύρω από το gradient για καθαρό clipping
  primaryWrap: { borderRadius: radius.md, ...shadow.soft },
  gradientFill: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing(2.5),
    alignSelf: 'stretch',
  },
  secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent', height: 'auto', paddingVertical: spacing(1) },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88 },
  text: { fontSize: font.md, fontWeight: '700', color: colors.text },
  textPrimary: { color: colors.primaryText },
  textGhost: { color: colors.accent, fontWeight: '700' },
}));
