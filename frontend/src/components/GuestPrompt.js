import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors, font, spacing } from '../theme/theme';

// Εμφανίζεται στις καρτέλες Εισιτήρια/Προφίλ όταν περιηγείσαι ως επισκέπτης
export function GuestPrompt({ navigation, icon = '🔒', title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Button title="Sign in" onPress={() => navigation.navigate('Login')} style={styles.btn} />
      <Button title="Create account" variant="secondary" onPress={() => navigation.navigate('Register')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(4) },
  icon: { fontSize: 52, marginBottom: spacing(1.5) },
  title: { color: colors.text, fontSize: font.lg, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: font.sm, textAlign: 'center', marginTop: spacing(0.75), marginBottom: spacing(2.5) },
  btn: { alignSelf: 'stretch', marginTop: spacing(1.25) },
});
