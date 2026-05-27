import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthBackground } from '../components/AuthBackground';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PressableScale } from '../components/PressableScale';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { colors, gradients, font, spacing, radius } from '../theme/theme';

export function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const enter = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enter, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
    ]).start();
  }, [enter, logoScale]);

  const shake = () => {
    Animated.sequence(
      [8, -8, 6, -6, 0].map((toValue) =>
        Animated.timing(shakeX, { toValue, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      shake();
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigation.popToTop(); // κλείσιμο του modal σύνδεσης (πλέον συνδεδεμένος)
    } catch (e) {
      setError(getErrorMessage(e, 'Could not sign in.'));
      shake();
      setSubmitting(false);
    }
  };

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <View style={styles.root}>
      <AuthBackground />
      <Pressable onPress={() => navigation.popToTop()} hitSlop={10} style={[styles.close, { top: insets.top + spacing(1) }]}>
        <Ionicons name="close" size={22} color={colors.textMuted} />
      </Pressable>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>
            <View style={styles.header}>
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoMark}>
                  <Text style={styles.logoGlyph}>🎭</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.logo}>Spotlight</Text>
              <Text style={styles.subtitle}>Book your seat at the theatre</Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
              <Card style={styles.form}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="you@example.com"
                />
                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Your password"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Sign in" onPress={onSubmit} loading={submitting} />
              </Card>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>No account yet?</Text>
              <PressableScale onPress={() => navigation.navigate('Register')} scaleTo={0.92}>
                <Text style={styles.footerLink}>Create one</Text>
              </PressableScale>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  close: { position: 'absolute', right: spacing(2), zIndex: 10, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing(2) },
  header: { alignItems: 'center', marginBottom: spacing(3) },
  logoMark: { width: 84, height: 84, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) },
  logoGlyph: { fontSize: 42 },
  logo: { color: colors.text, fontSize: font.xxl, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: colors.textMuted, fontSize: font.md, marginTop: spacing(0.5) },
  form: { marginBottom: spacing(2) },
  error: { color: colors.danger, fontSize: font.sm, marginBottom: spacing(1.5), textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(1) },
  footerText: { color: colors.textMuted, fontSize: font.sm },
  footerLink: { color: colors.accent, fontSize: font.sm, fontWeight: '800' },
});
