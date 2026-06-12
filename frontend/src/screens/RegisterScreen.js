import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthBackground } from '../components/AuthBackground';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PressableScale } from '../components/PressableScale';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { notifyError } from '../utils/haptics';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { gradients, font, spacing, radius } from '../theme/theme';

function strengthScore(pw) {
  if (!pw) return -1;
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 4);
}

function StrengthMeter({ password }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const score = strengthScore(password);
  if (score < 0) return null;
  const STRENGTH = [
    { label: 'Too short', color: colors.danger },
    { label: 'Weak', color: colors.danger },
    { label: 'Fair', color: colors.warning },
    { label: 'Good', color: colors.accent },
    { label: 'Strong', color: colors.success },
  ];
  const info = STRENGTH[score];
  return (
    <View style={styles.meter}>
      <View style={styles.meterBars}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.meterBar, { backgroundColor: i <= score - 1 ? info.color : colors.border }]} />
        ))}
      </View>
      <Text style={[styles.meterLabel, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

export function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
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
    notifyError();
    Animated.sequence(
      [8, -8, 6, -6, 0].map((toValue) =>
        Animated.timing(shakeX, { toValue, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async () => {
    setError(null);
    if (!validate()) { shake(); return; }
    setSubmitting(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigation.popToTop(); // κλείσιμο του modal σύνδεσης (πλέον συνδεδεμένος)
    } catch (e) {
      setError(getErrorMessage(e, 'Could not create your account.'));
      shake();
      const fe = getFieldErrors(e);
      if (fe) setFieldErrors((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])) }));
      setSubmitting(false);
    }
  };

  // Εναλλαγή προς Login: αν είναι η προηγούμενη οθόνη, ολίσθηση πίσω· αλλιώς ολίσθηση από πάνω (χωρίς στοίβαξη)
  const goToSignIn = () => {
    const { routes } = navigation.getState();
    if (routes[routes.length - 2]?.name === 'Login') navigation.goBack();
    else navigation.push('Login');
  };

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <View style={styles.root}>
      <AuthBackground />
      <Pressable onPress={() => navigation.popToTop()} hitSlop={10} style={[styles.close, { top: insets.top + spacing(1) }]}>
        <Ionicons name="close" size={22} color={colors.textMuted} />
      </Pressable>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>
            <View style={styles.header}>
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoMark}>
                  <Text style={styles.logoGlyph}>🎭</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Join Spotlight to book shows</Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
              <Card style={styles.form}>
                <TextField label="Name" value={form.name} onChangeText={set('name')} autoCapitalize="words" placeholder="Your name" error={fieldErrors.name} />
                <TextField label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" placeholder="you@example.com" error={fieldErrors.email} />
                <TextField label="Password" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="At least 8 characters" error={fieldErrors.password} />
                <StrengthMeter password={form.password} />
                <TextField label="Confirm password" value={form.confirm} onChangeText={set('confirm')} secureTextEntry placeholder="Re-enter password" error={fieldErrors.confirm} />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Create account" onPress={onSubmit} loading={submitting} />
              </Card>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <PressableScale onPress={goToSignIn} scaleTo={0.92}>
                <Text style={styles.footerLink}>Sign in</Text>
              </PressableScale>
            </View>
          </Animated.View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.bg },
  close: { position: 'absolute', right: spacing(2), zIndex: 10, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing(2) },
  header: { alignItems: 'center', marginBottom: spacing(2.5) },
  logoMark: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(1.5) },
  logoGlyph: { fontSize: 32 },
  title: { color: colors.text, fontSize: font.xl, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.5) },
  form: { marginBottom: spacing(2) },
  error: { color: colors.danger, fontSize: font.sm, marginBottom: spacing(1.5), textAlign: 'center' },
  meter: { marginTop: -spacing(1), marginBottom: spacing(2) },
  meterBars: { flexDirection: 'row', gap: 6 },
  meterBar: { flex: 1, height: 6, borderRadius: 3 },
  meterLabel: { fontSize: font.xs, fontWeight: '700', marginTop: spacing(0.75) },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(1) },
  footerText: { color: colors.textMuted, fontSize: font.sm },
  footerLink: { color: colors.accent, fontSize: font.sm, fontWeight: '800' },
}));
