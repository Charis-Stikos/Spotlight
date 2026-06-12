import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Cover } from '../components/Cover';
import { Badge } from '../components/Badge';
import { RowSkeletonList } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { PressableScale } from '../components/PressableScale';
import { GuestPrompt } from '../components/GuestPrompt';
import { Segmented } from '../components/Segmented';
import { useAuth } from '../context/AuthContext';
import { useBadge } from '../context/BadgeContext';
import { getMyReservations } from '../api/reservations';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime, formatPrice } from '../utils/format';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { font, spacing, radius } from '../theme/theme';

// "Today" / "Tomorrow" / "In X days" για επερχόμενες κρατήσεις
function countdownLabel(iso) {
  const a = new Date(iso); a.setHours(0, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.round((a - now) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

// Ετικέτα καρτέλας με προαιρετικό πλήθος, π.χ. "Upcoming (2)"
const tabLabel = (label, count) => (count ? `${label} (${count})` : label);

export function MyReservationsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { user } = useAuth();
  const { setTicketsCount } = useBadge();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setError(null);
    try {
      setItems(await getMyReservations());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Επαναφόρτωση σε κάθε εστίαση της καρτέλας (νέες/ακυρωμένες κρατήσεις)
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  // Επερχόμενες = επιβεβαιωμένες & μελλοντικές (νωρίτερη πρώτη)· Ιστορικό = ακυρωμένες ή περασμένες
  const { upcoming, history } = useMemo(() => {
    const now = Date.now();
    const isUpcoming = (i) => i.status === 'CONFIRMED' && new Date(i.startsAt).getTime() > now;
    return {
      upcoming: items.filter(isUpcoming).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
      history: items.filter((i) => !isUpcoming(i)),
    };
  }, [items]);

  // Συγχρονισμός του badge με τον αριθμό επερχόμενων
  useEffect(() => { setTicketsCount(user ? upcoming.length : 0); }, [user, upcoming.length, setTicketsCount]);

  const data = tab === 'upcoming' ? upcoming : history;
  const counts = { upcoming: upcoming.length, history: history.length };

  // Ο τίτλος "My Tickets" και το system back έρχονται από το native header
  if (!user) {
    return (
      <Screen edges={[]}>
        <GuestPrompt navigation={navigation} icon="🎟️" title="Your tickets, in one place" subtitle="Sign in to view and manage your bookings." />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} contentStyle={styles.screen}>
      {loading ? (
        <RowSkeletonList />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => String(i.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          ListHeaderComponent={
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                ['upcoming', tabLabel('Upcoming', counts.upcoming)],
                ['history', tabLabel('History', counts.history)],
              ]}
            />
          }
          renderItem={({ item }) => {
            const cancelled = item.status !== 'CONFIRMED';
            const isUpcomingItem = tab === 'upcoming';
            return (
              <PressableScale onPress={() => navigation.navigate('ReservationDetails', { reservationId: item.id })} style={[styles.row, cancelled && styles.rowDim]} scaleTo={0.98}>
                <Cover seed={item.showTitle} style={styles.thumb} />
                <View style={styles.body}>
                  <View style={styles.rowTop}>
                    <Text style={styles.title} numberOfLines={1}>{item.showTitle}</Text>
                    {isUpcomingItem
                      ? <Badge label={countdownLabel(item.startsAt)} color={colors.primary} filled />
                      : <Badge label={item.status} color={item.status === 'CONFIRMED' ? colors.success : colors.textMuted} />}
                  </View>
                  <Text style={styles.sub} numberOfLines={1}>{item.theatreName} · {formatDateTime(item.startsAt)}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{item.seatCount} seat{item.seatCount === 1 ? '' : 's'}</Text>
                    <Text style={styles.total}>{formatPrice(item.totalPrice)}</Text>
                  </View>
                </View>
              </PressableScale>
            );
          }}
          ListEmptyComponent={
            tab === 'upcoming'
              ? <EmptyState icon="🎟️" title="No upcoming tickets" subtitle="Book a show from the Discover tab." />
              : <EmptyState icon="🗂️" title="Nothing here yet" subtitle="Past and cancelled bookings show up here." />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  screen: { padding: spacing(2), paddingBottom: 0 },
  list: { paddingBottom: spacing(3) },
  row: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.25), marginBottom: spacing(1.5), alignItems: 'center', ...shadow.soft },
  rowDim: { opacity: 0.6 },
  thumb: { width: 56, height: 72 },
  body: { flex: 1, marginLeft: spacing(1.5) },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontSize: font.md, fontWeight: '700', flex: 1, paddingRight: spacing(1) },
  sub: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.5) },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing(0.75) },
  meta: { color: colors.textMuted, fontSize: font.xs },
  total: { color: colors.primary, fontSize: font.md, fontWeight: '800' },
}));
