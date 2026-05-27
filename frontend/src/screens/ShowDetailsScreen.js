import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Share, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Cover } from '../components/Cover';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { PressableScale } from '../components/PressableScale';
import { HeartButton } from '../components/HeartButton';
import { useAuth } from '../auth/AuthContext';
import { useRecentlyViewed } from '../favorites/RecentlyViewedContext';
import { getShow, getShowtimes, getShowtime } from '../api/catalog';
import { initialFor } from '../utils/cover';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatTime, formatPrice, formatDuration } from '../utils/format';
import { colors, categoryColor, font, spacing, radius, shadow } from '../theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HERO_H = 300;
const GOOD_TO_KNOW = [
  { icon: 'time-outline', text: 'Doors open 30 minutes before the show.' },
  { icon: 'walk-outline', text: 'Latecomers may be seated at a suitable break.' },
  { icon: 'swap-horizontal-outline', text: 'Free seat changes & cancellation up to showtime.' },
];

function whenLabel(iso) {
  const a = new Date(iso); a.setHours(0, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.round((a - now) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return formatDate(iso);
}

const cap = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export function ShowDetailsScreen({ route, navigation }) {
  const { showId } = route.params;
  const { user } = useAuth();
  const { add: addRecent } = useRecentlyViewed();
  const insets = useSafeAreaInsets();
  const [show, setShow] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, st] = await Promise.all([getShow(showId), getShowtimes(showId)]);
      setShow(s);
      setShowtimes(st);
      if (st.length) {
        try { const full = await getShowtime(st[0].id); setPrices(full.prices || []); } catch { /* προαιρετικές τιμές */ }
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { addRecent(showId); }, [showId, addRecent]);

  const fromPrice = useMemo(
    () => (showtimes.length ? Math.min(...showtimes.map((s) => Number(s.basePrice))) : null),
    [showtimes],
  );
  const dateRange = useMemo(() => {
    if (!showtimes.length) return null;
    const t = showtimes.map((s) => new Date(s.startsAt).getTime());
    const min = Math.min(...t), max = Math.max(...t);
    return new Date(min).toDateString() === new Date(max).toDateString()
      ? formatDate(min) : `${formatDate(min)} – ${formatDate(max)}`;
  }, [showtimes]);
  const grouped = useMemo(() => {
    const map = new Map();
    for (const st of showtimes) {
      const key = new Date(st.startsAt).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(st);
    }
    return [...map.entries()];
  }, [showtimes]);

  const goBack = () => navigation.goBack();
  // Η κράτηση απαιτεί λογαριασμό· οι επισκέπτες πάνε πρώτα στο modal σύνδεσης
  const openSeats = (st) => {
    if (!user) { navigation.navigate('Login'); return; }
    navigation.navigate('SeatMap', { showtimeId: st.id, showTitle: show.title });
  };
  const onShare = () => {
    if (!show) return;
    Share.share({ message: `Check out "${show.title}" at ${show.theatreName} — book it on Spotlight 🎭` }).catch(() => {});
  };
  const toggleSynopsis = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const Back = (
    <Pressable onPress={goBack} hitSlop={10} style={[styles.circleBtn, { top: insets.top + spacing(1), left: spacing(2) }]}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </Pressable>
  );

  if (loading) return <View style={styles.fill}>{Back}<Loading /></View>;
  if (error) return <View style={styles.fill}>{Back}<ErrorView message={error} onRetry={load} /></View>;

  const scale = scrollY.interpolate({ inputRange: [-HERO_H, 0], outputRange: [2, 1], extrapolateRight: 'clamp' });
  const translateY = scrollY.interpolate({ inputRange: [-HERO_H, 0, HERO_H], outputRange: [HERO_H / 2, 0, -HERO_H / 3], extrapolate: 'clamp' });

  return (
    <View style={styles.fill}>
      <Animated.View style={[styles.backdrop, { transform: [{ translateY }, { scale }] }]}>
        <Cover seed={show.title} scrim style={styles.backdropCover}>
          <Text style={styles.backdropGlyph} pointerEvents="none">{initialFor(show.title)}</Text>
        </Cover>
      </Animated.View>

      {Back}
      <View style={[styles.actions, { top: insets.top + spacing(1) }]}>
        <Pressable onPress={onShare} hitSlop={10} style={styles.circleStatic}><Ionicons name="share-outline" size={19} color="#fff" /></Pressable>
        <View style={styles.circleStatic}><HeartButton id={show.id} size={20} /></View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
      >
        <View style={{ height: HERO_H - spacing(3) }} pointerEvents="none" />

        <View style={styles.sheet}>
          <Text style={styles.title}>{show.title}</Text>
          <Text style={styles.venueLine}>{show.theatreName} · {show.theatreLocation}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}><Ionicons name="time-outline" size={14} color={colors.textMuted} /><Text style={styles.metaText}>{formatDuration(show.durationMin)}</Text></View>
            {show.ageRating ? <View style={styles.metaPill}><Ionicons name="people-outline" size={14} color={colors.textMuted} /><Text style={styles.metaText}>{show.ageRating}</Text></View> : null}
            <View style={styles.metaPill}><Ionicons name="location-outline" size={14} color={colors.textMuted} /><Text style={styles.metaText}>{show.theatreLocation}</Text></View>
          </View>

          {dateRange ? (
            <View style={styles.factsRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.factsText}>{dateRange}</Text>
              <Text style={styles.factsDot}>·</Text>
              <Text style={styles.factsText}>{showtimes.length} showtime{showtimes.length === 1 ? '' : 's'}</Text>
            </View>
          ) : null}

          {fromPrice != null ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tickets from</Text>
              <Text style={styles.priceValue}>{formatPrice(fromPrice)}</Text>
            </View>
          ) : null}

          {show.description ? (
            <>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.synopsis} numberOfLines={expanded ? undefined : 4}>{show.description}</Text>
              {show.description.length > 140 ? (
                <Pressable onPress={toggleSynopsis} hitSlop={8}>
                  <Text style={styles.readMore}>{expanded ? 'Show less ▲' : 'Read more ▼'}</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {prices.length ? (
            <>
              <Text style={styles.sectionTitle}>Price guide</Text>
              <View style={styles.priceCard}>
                {prices.map((p, i) => (
                  <View key={p.category} style={[styles.priceLine, i > 0 && styles.priceDivider]}>
                    <View style={[styles.priceDot, { backgroundColor: categoryColor(p.category) }]} />
                    <Text style={styles.priceCat}>{cap(p.category)}</Text>
                    <Text style={styles.priceAmt}>{formatPrice(p.price)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Venue</Text>
          <PressableScale onPress={() => navigation.navigate('Theatre', { theatreId: show.theatreId, name: show.theatreName })} style={styles.venueCard} scaleTo={0.98}>
            <Cover seed={show.theatreName} style={styles.venueThumb} />
            <View style={styles.flex}>
              <Text style={styles.venueName} numberOfLines={1}>{show.theatreName}</Text>
              <Text style={styles.venueLoc} numberOfLines={1}>📍 {show.theatreLocation}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </PressableScale>

          <Text style={styles.sectionTitle}>Good to know</Text>
          <View style={styles.infoCard}>
            {GOOD_TO_KNOW.map((g, i) => (
              <View key={g.icon} style={[styles.infoLine, i > 0 && styles.priceDivider]}>
                <Ionicons name={g.icon} size={18} color={colors.primary} />
                <Text style={styles.infoText}>{g.text}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Showtimes</Text>
          {!user ? <Text style={styles.signInHint}>🔒 Sign in to pick your seats — it only takes a moment.</Text> : null}
          {grouped.length ? (
            grouped.map(([day, sts]) => (
              <View key={day} style={styles.dayBlock}>
                <Text style={styles.dayLabel}>{whenLabel(sts[0].startsAt)}</Text>
                <View style={styles.pills}>
                  {sts.map((st) => (
                    <PressableScale key={st.id} onPress={() => openSeats(st)} style={styles.timePill} scaleTo={0.93}>
                      <Text style={styles.timeText}>{formatTime(st.startsAt)}</Text>
                      <Text style={styles.timeHall} numberOfLines={1}>{st.hallName}</Text>
                      <Text style={styles.timePrice}>{formatPrice(st.basePrice)}</Text>
                    </PressableScale>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="🗓️" title="No upcoming showtimes" subtitle="Check back later." />
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_H },
  backdropCover: { flex: 1, borderRadius: 0 },
  backdropGlyph: { position: 'absolute', top: spacing(1), right: spacing(-1), fontSize: 200, fontWeight: '900', color: 'rgba(255,255,255,0.16)' },
  circleBtn: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  actions: { position: 'absolute', right: spacing(2), flexDirection: 'row', gap: spacing(1), zIndex: 10 },
  circleStatic: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center' },

  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing(2), paddingTop: spacing(2.5), minHeight: 460 },
  flex: { flex: 1 },
  title: { color: colors.text, fontSize: font.xxl, fontWeight: '800' },
  venueLine: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.5) },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1), marginTop: spacing(1.75) },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: spacing(0.5), backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: spacing(1.25), paddingVertical: spacing(0.6) },
  metaText: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600' },
  factsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(0.6), marginTop: spacing(1.25) },
  factsText: { color: colors.textMuted, fontSize: font.sm },
  factsDot: { color: colors.textMuted, fontSize: font.sm },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing(1), marginTop: spacing(2) },
  priceLabel: { color: colors.textMuted, fontSize: font.sm },
  priceValue: { color: colors.primary, fontSize: font.xl, fontWeight: '800' },

  sectionTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginTop: spacing(2.5), marginBottom: spacing(1) },
  synopsis: { color: colors.textMuted, fontSize: font.sm, lineHeight: 21 },
  readMore: { color: colors.accent, fontSize: font.sm, fontWeight: '700', marginTop: spacing(0.75) },

  priceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing(1.75), ...shadow.soft },
  priceLine: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.25), paddingVertical: spacing(1.4) },
  priceDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  priceDot: { width: 12, height: 12, borderRadius: 6 },
  priceCat: { flex: 1, color: colors.text, fontSize: font.md, fontWeight: '600' },
  priceAmt: { color: colors.text, fontSize: font.md, fontWeight: '800' },

  venueCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.25), ...shadow.soft },
  venueThumb: { width: 48, height: 60 },
  venueName: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  venueLoc: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.4) },

  infoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing(1.75), ...shadow.soft },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.25), paddingVertical: spacing(1.4) },
  infoText: { flex: 1, color: colors.textMuted, fontSize: font.sm, lineHeight: 19 },

  signInHint: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing(0.5) },
  dayBlock: { marginTop: spacing(1.5) },
  dayLabel: { color: colors.text, fontSize: font.sm, fontWeight: '800', marginBottom: spacing(1) },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  timePill: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing(1), paddingHorizontal: spacing(1.5), alignItems: 'center', minWidth: 86, ...shadow.soft },
  timeText: { color: colors.text, fontSize: font.md, fontWeight: '800' },
  timeHall: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.25) },
  timePrice: { color: colors.primary, fontSize: font.xs, fontWeight: '700', marginTop: spacing(0.4) },
});
