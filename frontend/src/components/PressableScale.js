import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Pressable που "βυθίζεται" ελαφρά στο άγγιγμα· το style μπαίνει στο ίδιο το Pressable για σωστό layout
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({ children, onPress, style, scaleTo = 0.96, disabled = false, hitSlop }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50, bounciness: 0 }).start();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
