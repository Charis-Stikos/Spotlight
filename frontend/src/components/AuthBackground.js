import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Διακοσμητικό κινούμενο φόντο για τις οθόνες σύνδεσης (gradient + blobs + glyphs)
const { width: W, height: H } = Dimensions.get('window');

function useFloat(duration, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, delay, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);
  return v;
}

function Blob({ grad, size, left, top, float, dur, delay }) {
  const v = useFloat(dur, delay);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, float] });
  return (
    <Animated.View style={[styles.blob, { width: size, height: size, borderRadius: size / 2, left, top, transform: [{ translateY }] }]}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function Glyph({ char, size, left, top, float, dur, delay }) {
  const v = useFloat(dur, delay);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, float] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] });
  return (
    <Animated.Text style={[styles.glyph, { fontSize: size, left, top, transform: [{ translateY }, { rotate }] }]}>
      {char}
    </Animated.Text>
  );
}

export function AuthBackground() {
  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#FBF7FF', '#F1EAFF']} style={StyleSheet.absoluteFill} />
      <Blob grad={['#FF8FB1', '#FF6A88']} size={220} left={-60} top={-50} float={26} dur={4200} delay={0} />
      <Blob grad={['#9D7BFF', '#7C4DFF']} size={260} left={W - 150} top={80} float={-30} dur={5200} delay={400} />
      <Blob grad={['#FFC4A3', '#FF8A5B']} size={190} left={W - 230} top={H - 230} float={22} dur={4800} delay={200} />
      <Glyph char="🎭" size={40} left={W * 0.12} top={H * 0.15} float={18} dur={5000} delay={0} />
      <Glyph char="🎟️" size={30} left={W * 0.78} top={H * 0.30} float={-16} dur={5600} delay={600} />
      <Glyph char="⭐" size={26} left={W * 0.16} top={H * 0.60} float={16} dur={4600} delay={300} />
      <Glyph char="🎬" size={34} left={W * 0.80} top={H * 0.70} float={-18} dur={5200} delay={900} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', opacity: 0.3, overflow: 'hidden' },
  glyph: { position: 'absolute', opacity: 0.16 },
});
