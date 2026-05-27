import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, FlatList, Animated, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Cover } from '../components/Cover';
import { PressableScale } from '../components/PressableScale';
import { GuestPrompt } from '../components/GuestPrompt';
import { useAuth } from '../auth/AuthContext';
import { useFavorites } from '../favorites/FavoritesContext';
import { useRecentlyViewed } from '../favorites/RecentlyViewedContext';
import { getMyReservations } from '../api/reservations';
import { getShows } from '../api/catalog';
import { initialFor } from '../utils/cover';
import { colors, gradients, font, spacing, radius, shadow } from '../theme/theme';

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

function Stat({ value, label, onPress, trigger }) {
  return (
    <PressableScale onPress={onPress} style={styles.stat} scaleTo={0.95}>
      <CountUp value={value} trigger={trigger} style={styles.statValue} />
      <Text style={styles.statLabel}>{label}</Text>
    </PressableScale>
  );
}

function MenuRow({ icon, label, sub, onPress, last }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.rowPressed]}>
      <View style={styles.rowIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
      <View style={styles.flex}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

// Οριζόντιο ράφι καρτών (αγαπημένα / πρόσφατα)
function Rail({ title, data, onPress }) {
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

export function ProfileScreen({ navigation }) {
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
    Alert.alert('About Spotlight', 'Spotlight — Theatre Seat Reservation\nVersion 1.0.0\n\nBrowse theatres & shows, pick your exact seats, and manage your bookings.');

  const help = () =>
    Alert.alert('Help & Support', 'Need a hand?\n\nEmail: support@spotlight.app\n\nYour bookings live under the Tickets tab — open one to change seats or cancel.');

  const openShow = (item) => navigation.navigate('ShowDetails', { showId: item.id, title: item.title });
  const goTickets = () => navigation.navigate('TicketsTab');

  if (!user) {
    return (
      <Screen edges={['top']} contentStyle={styles.screen}>
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.avatar}><Ionicons name="person" size={38} color="#fff" /></View>
          <Text style={styles.name}>Welcome 👋</Text>
          <Text style={styles.email}>You're browsing as a guest</Text>
        </LinearGradient>
        <GuestPrompt navigation={navigation} icon="👤" title="Sign in to Spotlight" subtitle="Save favourites, book seats, and keep your tickets in one place." />
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
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initialFor(user?.name || 'U')}</Text></View>
          <Text style={styles.name} numberOfLines={1}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          <Stat value={stats.bookings} label="Bookings" onPress={goTickets} trigger={runKey} />
          <Stat value={stats.upcoming} label="Upcoming" onPress={goTickets} trigger={runKey} />
          <Stat value={stats.seats} label="Seats" onPress={goTickets} trigger={runKey} />
        </View>

        {favShows.length ? <Rail title={`Favourites (${favShows.length})`} data={favShows} onPress={openShow} /> : null}
        {recentShows.length ? <Rail title="Recently viewed" data={recentShows} onPress={openShow} /> : null}

        <Text style={styles.section}>Account</Text>
        <Card style={styles.menu}>
          <MenuRow icon="ticket-outline" label="My Tickets" sub="View & manage your bookings" onPress={goTickets} />
          <MenuRow icon="help-circle-outline" label="Help & Support" onPress={help} />
          <MenuRow icon="information-circle-outline" label="About Spotlight" sub="Version 1.0.0" onPress={about} last />
        </Card>

        <Button title="Sign out" variant="danger" onPress={confirmSignOut} style={styles.signOut} />
        <Text style={styles.footer}>Spotlight · CN6035</Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  banner: {
    alignItems: 'center', paddingVertical: spacing(3.5), paddingHorizontal: spacing(2),
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 84, height: 84, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing(1.5),
  },
  avatarText: { color: '#fff', fontSize: font.xxl, fontWeight: '800' },
  name: { color: '#fff', fontSize: font.xl, fontWeight: '800' },
  email: { color: 'rgba(255,255,255,0.9)', fontSize: font.sm, marginTop: spacing(0.4) },

  statsRow: { flexDirection: 'row', gap: spacing(1.5), paddingHorizontal: spacing(2), marginTop: spacing(2.5) },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing(2), alignItems: 'center', ...shadow.soft },
  statValue: { color: colors.primary, fontSize: font.xl, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4), fontWeight: '600' },

  section: { color: colors.textMuted, fontSize: font.xs, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: spacing(2), marginTop: spacing(3), marginBottom: spacing(1.25) },

  favCard: { width: 120 },
  favPoster: { width: 120, height: 150, borderRadius: radius.md },
  favGlyph: { position: 'absolute', top: spacing(-1), right: spacing(-0.5), fontSize: 88, fontWeight: '900', color: 'rgba(255,255,255,0.18)' },
  favName: { color: colors.text, fontSize: font.sm, fontWeight: '700', marginTop: spacing(0.75) },
  favSub: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.25) },

  menu: { padding: 0, marginHorizontal: spacing(2), overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(1.75), paddingHorizontal: spacing(2), gap: spacing(1.5) },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  rowSub: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.25) },

  signOut: { marginHorizontal: spacing(2), marginTop: spacing(3) },
  footer: { color: colors.textMuted, fontSize: font.xs, textAlign: 'center', marginTop: spacing(2), marginBottom: spacing(3) },
});
