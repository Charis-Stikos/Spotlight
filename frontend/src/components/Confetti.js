import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';

// Εφέ confetti — ~30 κομμάτια που πέφτουν με περιστροφή, χωρίς εξωτερική βιβλιοθήκη
const { width: W, height: H } = Dimensions.get('window');
const COLORS = ['#FF6A88', '#7C4DFF', '#FF8A5B', '#16B981', '#F5C518', '#4FACFE'];

const PIECES = Array.from({ length: 32 }, (_, i) => ({
  left: Math.random() * W,
  startY: -(Math.random() * H * 0.4) - 20,
  size: 6 + Math.random() * 8,
  drift: (Math.random() - 0.5) * 90,
  rot: (Math.random() * 4 + 1) * 180,
  color: COLORS[i % COLORS.length],
}));

export function Confetti() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 1900, useNativeDriver: true }).start();
  }, [v]);

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PIECES.map((p, i) => {
        const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [p.startY, H + 40] });
        const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] });
        const opacity = v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              width: p.size,
              height: p.size * 1.4,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </Animated.View>
  );
}
