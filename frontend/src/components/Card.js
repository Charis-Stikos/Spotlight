import { View, Pressable } from 'react-native';
import { makeStyles } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

// Κάρτα-επιφάνεια· γίνεται πατήσιμη όταν δοθεί onPress
export function Card({ children, onPress, style }) {
  const styles = useStyles();
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const useStyles = makeStyles((colors, shadow) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  pressed: { opacity: 0.9 },
}));
