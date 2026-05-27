import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../favorites/FavoritesContext';
import { colors } from '../theme/theme';

// Καρδιά που "αναπηδά" όταν πατηθεί· onSurface = ημιδιάφανος κύκλος για ευκρίνεια πάνω σε εικόνα
export function HeartButton({ id, size = 20, color = '#fff', onSurface = false }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(id);
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 60, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 10 }),
    ]).start();
    toggle(id);
  };

  return (
    <Pressable onPress={onPress} hitSlop={12} style={onSurface ? styles.circle : undefined}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={fav ? 'heart' : 'heart-outline'} size={size} color={fav ? colors.danger : color} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
});
