import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/theme';

// Παλλόμενο placeholder για καταστάσεις φόρτωσης (shimmer)
export function Skeleton({ width, height, radius: r = 8, style }) {
  const { colors } = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  return <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: colors.surfaceAlt, opacity }, style]} />;
}

// Λίστα από placeholder γραμμές (όπως οι κάρτες/εισιτήρια)
export function RowSkeletonList({ count = 6 }) {
  const styles = useStyles();
  return (
    <View style={{ paddingTop: spacing(0.5) }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={56} height={72} r={10} />
          <View style={styles.body}>
            <Skeleton width="70%" height={16} r={6} />
            <Skeleton width="50%" height={12} r={6} style={{ marginTop: spacing(1) }} />
            <Skeleton width="40%" height={12} r={6} style={{ marginTop: spacing(1) }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing(1.25), marginBottom: spacing(1.5), ...shadow.soft,
  },
  body: { flex: 1, marginLeft: spacing(1.5) },
}));
