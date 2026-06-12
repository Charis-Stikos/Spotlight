import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';

// Βασικό wrapper οθόνης (safe-area, φόντο θέματος, προαιρετικό scroll)
export function Screen({ children, scroll = false, contentStyle, edges = ['top', 'bottom'], refreshControl }) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing(2), flexGrow: 1 },
}));
