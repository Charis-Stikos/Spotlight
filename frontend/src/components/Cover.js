import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientFor, initialFor } from '../utils/cover';
import { radius, font } from '../theme/theme';

// Παραγόμενο "poster" (gradient) όπου λείπει εικόνα· εμφανίζει το αρχικό γράμμα ή τα children
export function Cover({ seed, label, style, textStyle, rounded = true, scrim = false, children }) {
  return (
    <LinearGradient
      colors={gradientFor(seed)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, rounded && styles.rounded, style]}
    >
      {scrim ? (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children || (
        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.initial, textStyle]}>{label ?? initialFor(seed)}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  rounded: { borderRadius: radius.md },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  initial: { color: 'rgba(255,255,255,0.92)', fontSize: font.xl, fontWeight: '800' },
});
