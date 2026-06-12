import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, FlatList, Animated, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Cover } from '../components/Cover';
import { PressableScale } from '../components/PressableScale';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { getMyReservations } from '../api/reservations';
import { getShows } from '../api/catalog';
import { initialFor } from '../utils/cover';
import { tapLight } from '../utils/haptics';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { gradients, font, spacing, radius } from '../theme/theme';

// Αριθμός που αυξάνεται με animation από το 0
function CountUp({ value, trigger, style }) {
  const [display, setDisplay] = useState(0);
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const id = v.addListener(({ value: val }) => setDisplay(Math.round(val)));
    v.setValue(0); // πάντα ξεκινά από το 0 (ακόμα και σε refresh με ίδια τιμή)
    Animated.timing(v, { toValue: value || 0, duration: 700, useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [value, trigger, v]);
  return <Text style={style}>{display}</Text>;
}

// Συμπαγές gradient banner: avatar αριστερά, στοιχεία δεξιά
function ProfileBanner({ title, subtitle, initial, icon }) {
  const styles = useStyles();
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      <View style={styles.avatar}>
        {icon ? <Ionicons name={icon} size={30} color="#fff" /> : <Text style={styles.avatarText}>{initial}</Text>}
      </View>
      <View style={styles.bannerBody}>
        <Text style={styles.name} numberOfLines={1}>{title}</Text>
        <Text style={styles.email} numberOfLines={1}>{subtitle}</Text>
      </View>
    </LinearGradient>
  );
}

// Στατιστικά σε μία κάρτα που "επιπλέει" πάνω από το banner
function StatsCard({ stats, trigger, onPress }) {
  const styles = useStyles();
  const items = [
    [stats.bookings, 'Bookings'],
    [stats.upcoming, 'Upcoming'],
    [stats.seats, 'Seats'],
  ];
  return (
    <Card style={styles.statsCard}>
      <View style={styles.statsRow}>
        {items.map(([value, label], i) => (
          <Pressable key={label} onPress={onPress} style={[styles.stat, i > 0 && styles.statDivider]}>
            <CountUp value={value} trigger={trigger} style={styles.statValue} />
            <Text style={styles.statLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function MenuRow({ icon, label, sub, onPress, last, destructive }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const tint = destructive ? colors.danger : colors.primary;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.rowPressed]}>
      <View style={[styles.rowIcon, destructive && styles.rowIconDanger]}><Ionicons name={icon} size={18} color={tint} /></View>
      <View style={styles.flex}>
        <Text style={[styles.rowLabel, destructive && { color: colors.danger }]}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {!destructive ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

// Επιλογέας θέματος: System / Light / Dark μέσα στην κάρτα Preferences
const THEME_OPTIONS = [
  ['system', 'System', 'phone-portrait-outline'],
  ['light', 'Light', 'sunny-outline'],
  ['dark', 'Dark', 'moon-outline'],
];

function AppearanceRow() {
  const { colors, mode, setMode } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.appearanceWrap}>
      <View style={styles.row}>
        <View style={styles.rowIcon}><Ionicons name="color-palette-outline" size={18} color={colors.primary} /></View>
        <View style={styles.flex}>
          <Text style={styles.rowLabel}>Appearance</Text>
          <Text style={styles.rowSub}>Choose how Spotlight looks</Text>
        </View>
      </View>
      <View style={styles.appearanceRow}>
        {THEME_OPTIONS.map(([key, label, icon]) => {
          const active = mode === key;
          return (
            <Pressable
              key={key}
              onPress={() => { tapLight(); setMode(key); }}
              style={[styles.themeBtn, active && styles.themeBtnActive]}
            >
              <Ionicons name={icon} size={16} color={active ? colors.primaryText : colors.textMuted} />
              <Text style={[styles.themeBtnText, active && styles.themeBtnTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Οριζόντιο ράφι καρτών (αγαπημένα / πρόσφατα)
function Rail({ title, data, onPress }) {
  const styles = useStyles();
  return (
    <>
      <Text style={styles.section}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => `${title}-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing(2), gap: spacing(1.5) }}
        renderItem={({ item }) => (
          <PressableScale onPress={() => onPress(item)} style={styles.favCard}>
            <Cover seed={item.title} style={styles.favPoster}>
              <Text style={styles.favGlyph} pointerEvents="none">{initialFor(item.title)}</Text>
            </Cover>
            <Text style={styles.favName} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.favSub} numberOfLines={1}>{item.theatreLocation}</Text>
          </PressableScale>
        )}
      />
    </>
  );
}

// Έκδοση εφαρμογής από το app.json (μέσω expo-constants)
const APP_VERSION = Constants.expoConfig?.version || '0.0.0';

// Πλεονεκτήματα λογαριασμού για τους επισκέπτες
const GUEST_PERKS = [
  ['ticket-outline', 'Book seats and keep all your tickets in one place'],
  ['heart-outline', 'Save favourites and get picks for you'],
  ['flash-outline', 'Change seats or cancel in seconds'],
];

export function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { user, signOut } = useAuth();
  const { ids } = useFavorites();
  const { ids: recentIds } = useRecentlyViewed();
  const [stats, setStats] = useState({ bookings: 0, upcoming: 0, seats: 0 });
  const [shows, setShows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [runKey, setRunKey] = useState(0); // αλλάζει για επανάληψη του count-up

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [enter]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [items, allShows] = await Promise.all([getMyReservations(), getShows({})]);
      const now = new Date();
      const active = items.filter((i) => i.status === 'CONFIRMED');
      setStats({
        bookings: active.length,
        upcoming: active.filter((i) => new Date(i.startsAt) > now).length,
        seats: active.reduce((sum, i) => sum + Number(i.seatCount || 0), 0),
      });
      setShows(allShows);
    } catch {
      /* αγνόησε σφάλματα */
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); setRunKey((k) => k + 1); };

  const favShows = useMemo(() => shows.filter((s) => ids.has(s.id)), [shows, ids]);
  const recentShows = useMemo(
    () => recentIds.map((id) => shows.find((s) => s.id === id)).filter(Boolean),
    [recentIds, shows],
  );

  const confirmSignOut = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);

  const about = () =>
    Alert.alert('About Spotlight', `Spotlight — Theatre Seat Reservation\nVersion ${APP_VERSION}\n\nBrowse theatres & shows, pick your exact seats, and manage your bookings.`);

  const help = () =>
    Alert.alert('Help & Support', 'Need a hand?\n\nEmail: support@spotlight.app\n\nYour bookings live under the Tickets tab — open one to change seats or cancel.');

  const openShow = (item) => navigation.navigate('ShowDetails', { showId: item.id, title: item.title });
  const goTickets = () => navigation.navigate('TicketsTab');

  if (!user) {
    return (
      <Screen scroll edges={['top']} contentStyle={styles.screen}>
        <ProfileBanner icon="person" title="Welcome to Spotlight" subtitle="You're browsing as a guest" />

        <Text style={styles.section}>Get the full experience</Text>
        <Card style={styles.guestCard}>
          {GUEST_PERKS.map(([icon, text], i) => (
            <View key={icon} style={[styles.perkRow, i > 0 && styles.perkGap]}>
              <View style={styles.rowIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
              <Text style={styles.perkText}>{text}</Text>
            </View>
          ))}
          <Button title="Sign in" onPress={() => navigation.navigate('Login')} style={styles.guestBtn} />
          <Button title="Create account" variant="secondary" onPress={() => navigation.navigate('Register')} style={styles.guestBtnSecond} />
        </Card>

        <Text style={styles.section}>Preferences</Text>
        <Card style={styles.menu}>
          <AppearanceRow />
        </Card>

        <Text style={styles.footer}>Spotlight · CN6035 · v{APP_VERSION}</Text>
      </Screen>
    );
  }

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Screen
      scroll
      edges={['top']}
      contentStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>
        <ProfileBanner title={user?.name || 'Guest'} subtitle={user?.email} initial={initialFor(user?.name || 'U')} />

        <StatsCard stats={stats} trigger={runKey} onPress={goTickets} />

        {favShows.length ? <Rail title={`Favourites (${favShows.length})`} data={favShows} onPress={openShow} /> : null}
        {recentShows.length ? <Rail title="Recently viewed" data={recentShows} onPress={openShow} /> : null}

        <Text style={styles.section}>Preferences</Text>
        <Card style={styles.menu}>
          <AppearanceRow />
        </Card>

        <Text style={styles.section}>Account</Text>
        <Card style={styles.menu}>
          <MenuRow icon="ticket-outline" label="My Tickets" sub="View & manage your bookings" onPress={goTickets} />
          <MenuRow icon="help-circle-outline" label="Help & Support" onPress={help} />
          <MenuRow icon="information-circle-outline" label="About Spotlight" sub={`Version ${APP_VERSION}`} onPress={about} last />
        </Card>

        <Card style={[styles.menu, styles.signOutCard]}>
          <MenuRow icon="log-out-outline" label="Sign out" onPress={confirmSignOut} destructive last />
        </Card>

        <Text style={styles.footer}>Spotlight · CN6035 · v{APP_VERSION}</Text>
      </Animated.View>
    </Screen>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  screen: { padding: 0 },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing(2),
    paddingTop: spacing(3), paddingBottom: spacing(5), paddingHorizontal: spacing(2.5),
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 64, height: 64, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: font.xl, fontWeight: '800' },
  bannerBody: { flex: 1 },
  name: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
  email: { color: 'rgba(255,255,255,0.9)', fontSize: font.sm, marginTop: spacing(0.4) },

  // Κάρτα στατιστικών που επικαλύπτει το banner
  statsCard: { marginHorizontal: spacing(2), marginTop: -spacing(3), padding: 0 },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing(2) },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  statValue: { color: colors.primary, fontSize: font.xl, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4), fontWeight: '600' },

  section: { color: colors.textMuted, fontSize: font.xs, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: spacing(2), marginTop: spacing(3), marginBottom: spacing(1.25) },

  favCard: { width: 120 },
  favPoster: { width: 120, height: 150, borderRadius: radius.md },
  favGlyph: { position: 'absolute', top: spacing(-1), right: spacing(-0.5), fontSize: 88, fontWeight: '900', color: 'rgba(255,255,255,0.18)' },
  favName: { color: colors.text, fontSize: font.sm, fontWeight: '700', marginTop: spacing(0.75) },
  favSub: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.25) },

  // Κάρτες-μενού
  menu: { padding: 0, marginHorizontal: spacing(2), overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(1.75), paddingHorizontal: spacing(2), gap: spacing(1.5) },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  rowIconDanger: { backgroundColor: 'transparent' },
  flex: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  rowSub: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.25) },

  // Επιλογέας θέματος
  appearanceWrap: { paddingBottom: spacing(1.75) },
  appearanceRow: { flexDirection: 'row', gap: spacing(0.75), paddingHorizontal: spacing(2) },
  themeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(0.6),
    paddingVertical: spacing(1.1), borderRadius: radius.md, backgroundColor: colors.surfaceAlt,
  },
  themeBtnActive: { backgroundColor: colors.primary },
  themeBtnText: { color: colors.textMuted, fontSize: font.sm, fontWeight: '700' },
  themeBtnTextActive: { color: colors.primaryText },

  // Κάρτα επισκέπτη
  guestCard: { marginHorizontal: spacing(2) },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  perkGap: { marginTop: spacing(1.5) },
  perkText: { flex: 1, color: colors.text, fontSize: font.sm, lineHeight: 19 },
  guestBtn: { marginTop: spacing(2.5) },
  guestBtnSecond: { marginTop: spacing(1.25) },

  signOutCard: { marginTop: spacing(1.5) },
  footer: { color: colors.textMuted, fontSize: font.xs, textAlign: 'center', marginTop: spacing(3), marginBottom: spacing(3) },
}));
