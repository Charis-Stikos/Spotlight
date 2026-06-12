import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, Animated, RefreshControl, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Cover } from '../components/Cover';
import { Badge } from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { PressableScale } from '../components/PressableScale';
import { HeartButton } from '../components/HeartButton';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { getShows } from '../api/catalog';
import { initialFor } from '../utils/cover';
import { getErrorMessage } from '../utils/errors';
import { tapLight } from '../utils/haptics';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { font, spacing, radius } from '../theme/theme';

const WIN_W = Dimensions.get('window').width;
const PAD = spacing(2);
const GAP = spacing(1.5);
const SLIDE_W = WIN_W - PAD * 2;
const ITEM_W = SLIDE_W + GAP;
const CARD_W = (WIN_W - PAD * 2 - GAP) / 2;
const POSTER_H = Math.round(CARD_W * 1.3);

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Χαιρετισμός ανάλογα με την ώρα της ημέρας
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Οριζόντιο "ράφι" με κάρτες παραστάσεων (Πρόσφατα / Αγαπημένα / Για εσένα)
function ShowRail({ title, data, onPress }) {
  const styles = useStyles();
  return (
    <View style={styles.railWrap}>
      <Text style={styles.railTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => `${title}-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        renderItem={({ item }) => (
          <PressableScale onPress={() => onPress(item)} style={styles.railCard}>
            <Cover seed={item.title} style={styles.railPoster}>
              <Text style={styles.railGlyph} pointerEvents="none">{initialFor(item.title)}</Text>
            </Cover>
            <Text style={styles.railName} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.railSub} numberOfLines={1}>{item.theatreLocation}</Text>
          </PressableScale>
        )}
      />
    </View>
  );
}

// Placeholder φόρτωσης (shimmer)
function DiscoverSkeleton() {
  const styles = useStyles();
  return (
    <View style={{ paddingTop: spacing(2) }}>
      <View style={{ paddingHorizontal: PAD }}>
        <Skeleton width={150} height={24} r={6} />
        <Skeleton width="100%" height={48} r={radius.pill} style={{ marginTop: spacing(1.5) }} />
        <Skeleton width="100%" height={210} r={radius.lg} style={{ marginTop: spacing(2) }} />
      </View>
      {[0, 1].map((row) => (
        <View key={row} style={[styles.column, { marginTop: row === 0 ? spacing(2.5) : GAP }]}>
          <Skeleton width={CARD_W} height={POSTER_H + 72} r={radius.lg} />
          <Skeleton width={CARD_W} height={POSTER_H + 72} r={radius.lg} />
        </View>
      ))}
    </View>
  );
}

export function DiscoverScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { user } = useAuth();
  const { ids } = useFavorites();
  const { ids: recentIds } = useRecentlyViewed();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('All');

  const scrollX = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setShows(await getShows({}));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!loading && !error) {
      enter.setValue(0);
      Animated.timing(enter, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    }
  }, [loading, error, enter]);

  const cities = useMemo(() => {
    const set = [...new Set(shows.map((s) => s.theatreLocation).filter(Boolean))];
    return ['All', ...set];
  }, [shows]);

  const featured = useMemo(() => shows.slice(0, 5), [shows]);
  const favShows = useMemo(() => shows.filter((s) => ids.has(s.id)), [shows, ids]);
  const recentShows = useMemo(
    () => recentIds.map((id) => shows.find((s) => s.id === id)).filter(Boolean),
    [recentIds, shows],
  );
  // "Για εσένα": παραστάσεις στις πόλεις των αγαπημένων (εκτός των ίδιων των αγαπημένων)
  const forYou = useMemo(() => {
    if (!favShows.length) return [];
    const favLoc = new Set(favShows.map((s) => s.theatreLocation));
    return shows.filter((s) => !ids.has(s.id) && favLoc.has(s.theatreLocation)).slice(0, 10);
  }, [shows, favShows, ids]);
  const grid = useMemo(
    () => (city === 'All' ? shows : shows.filter((s) => s.theatreLocation === city)),
    [shows, city],
  );

  // Αυτόματη εναλλαγή του carousel κάθε 4s μέχρι ο χρήστης να το αγγίξει
  useEffect(() => {
    if (featured.length < 2) return undefined;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      const next = (indexRef.current + 1) % featured.length;
      indexRef.current = next;
      carouselRef.current?.scrollToOffset({ offset: next * ITEM_W, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const openShow = (item) => navigation.navigate('ShowDetails', { showId: item.id, title: item.title });
  const onRefresh = () => { setRefreshing(true); load(); };

  const featuredBlock = (
    <View>
      <AnimatedFlatList
        ref={carouselRef}
        data={featured}
        keyExtractor={(item) => `f${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onScrollBeginDrag={() => { pausedRef.current = true; }}
        onMomentumScrollEnd={(e) => { indexRef.current = Math.round(e.nativeEvent.contentOffset.x / ITEM_W); }}
        contentContainerStyle={{ paddingHorizontal: PAD }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * ITEM_W, index * ITEM_W, (index + 1) * ITEM_W];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' });
          return (
            <Pressable onPress={() => openShow(item)}>
              <Animated.View style={[styles.slideWrap, { transform: [{ scale }], opacity }]}>
                <Cover seed={item.title} scrim style={styles.featured}>
                  <Text style={styles.featuredGlyph} pointerEvents="none">{initialFor(item.title)}</Text>
                  <View style={styles.heartTop}><HeartButton id={item.id} onSurface /></View>
                  <View style={styles.featuredBody}>
                    <View style={styles.featuredTag}><Text style={styles.featuredTagText}>★ FEATURED</Text></View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.featuredMeta} numberOfLines={1}>{item.theatreName} · {item.theatreLocation}</Text>
                    <View style={styles.bookBtn}><Text style={styles.bookBtnText}>Book now →</Text></View>
                  </View>
                </Cover>
              </Animated.View>
            </Pressable>
          );
        }}
      />
      {featured.length > 1 ? (
        <View style={styles.dots}>
          {featured.map((f, i) => {
            const inputRange = [(i - 1) * ITEM_W, i * ITEM_W, (i + 1) * ITEM_W];
            const scaleX = scrollX.interpolate({ inputRange, outputRange: [1, 3, 1], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
            return <Animated.View key={f.id} style={[styles.dot, { opacity, transform: [{ scaleX }] }]} />;
          })}
        </View>
      ) : null}
    </View>
  );

  const Header = (
    <View>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.hello}>{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</Text>
          <Text style={styles.helloSub}>What will you watch?</Text>
        </View>
      </View>

      <PressableScale onPress={() => navigation.navigate('SearchTab')} style={styles.searchPill} scaleTo={0.98}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchText}>Search shows, theatres, cities…</Text>
      </PressableScale>

      {featured.length ? featuredBlock : null}
      {recentShows.length ? <ShowRail title="🕒 Recently viewed" data={recentShows} onPress={openShow} /> : null}
      {favShows.length ? <ShowRail title="❤️ Your favourites" data={favShows} onPress={openShow} /> : null}
      {forYou.length ? <ShowRail title="✨ For you" data={forYou} onPress={openShow} /> : null}

      {cities.length > 1 ? (
        <View style={styles.chips}>
          {cities.map((c) => (
            <PressableScale key={c} onPress={() => { tapLight(); setCity(c); }} style={[styles.chip, city === c && styles.chipActive]} scaleTo={0.94}>
              <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
            </PressableScale>
          ))}
        </View>
      ) : null}

      <Text style={styles.section}>{city === 'All' ? 'All shows' : `In ${city}`}</Text>
    </View>
  );

  if (loading) return <Screen edges={['top']}><DiscoverSkeleton /></Screen>;
  if (error) return <Screen edges={['top']}><ErrorView message={error} onRetry={load} /></Screen>;

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Screen edges={['top']} contentStyle={styles.screen}>
      <Animated.View style={{ flex: 1, opacity: enter, transform: [{ translateY }] }}>
        <FlatList
          data={grid}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.column}
          ListHeaderComponent={Header}
          ListEmptyComponent={<EmptyState title="No shows here" subtitle="Try another city." />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <PressableScale onPress={() => openShow(item)} style={styles.card}>
              <Cover seed={item.title} style={styles.poster}>
                <Text style={styles.posterGlyph} pointerEvents="none">{initialFor(item.title)}</Text>
              </Cover>
              <View style={styles.cardHeart}><HeartButton id={item.id} size={18} onSurface /></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>{item.theatreName}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardMetaText}>{item.durationMin} min</Text>
                  {item.ageRating ? <Badge label={item.ageRating} color={colors.accent} /> : null}
                </View>
              </View>
            </PressableScale>
          )}
        />
      </Animated.View>
    </Screen>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  screen: { padding: 0 },
  list: { paddingBottom: spacing(3) },
  column: { paddingHorizontal: PAD, justifyContent: 'space-between' },
  flex: { flex: 1 },

  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, marginBottom: spacing(1.5), marginTop: spacing(0.5) },
  hello: { color: colors.text, fontSize: font.xl, fontWeight: '800' },
  helloSub: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.25) },
  searchPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing(1),
    backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.5),
    marginHorizontal: PAD, marginBottom: spacing(2), ...shadow.soft,
  },
  searchText: { color: colors.textMuted, fontSize: font.sm },

  slideWrap: { width: SLIDE_W, borderRadius: radius.lg, ...shadow.card },
  featured: { height: 210, borderRadius: radius.lg },
  featuredGlyph: { position: 'absolute', top: spacing(-3), right: spacing(-1), fontSize: 160, fontWeight: '900', color: 'rgba(255,255,255,0.16)' },
  heartTop: { position: 'absolute', top: spacing(1.25), right: spacing(1.25) },
  featuredBody: { flex: 1, padding: spacing(2), justifyContent: 'flex-end' },
  featuredTag: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing(1), paddingVertical: spacing(0.4), marginBottom: spacing(1) },
  featuredTagText: { color: colors.primaryText, fontSize: font.xs, fontWeight: '800', letterSpacing: 1 },
  featuredTitle: { color: '#fff', fontSize: font.xxl, fontWeight: '800' },
  featuredMeta: { color: 'rgba(255,255,255,0.85)', fontSize: font.sm, marginTop: spacing(0.5) },
  bookBtn: { alignSelf: 'flex-start', marginTop: spacing(1.5), backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.75) },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing(1), marginTop: spacing(1.5) },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },

  // Ράφια (rails)
  railWrap: { marginTop: spacing(2.5) },
  railTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800', paddingHorizontal: PAD, marginBottom: spacing(1.25) },
  railCard: { width: 124 },
  railPoster: { width: 124, height: 150, borderRadius: radius.md },
  railGlyph: { position: 'absolute', top: spacing(-1), right: spacing(-0.5), fontSize: 90, fontWeight: '900', color: 'rgba(255,255,255,0.18)' },
  railName: { color: colors.text, fontSize: font.sm, fontWeight: '700', marginTop: spacing(0.75) },
  railSub: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.25) },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1), paddingHorizontal: PAD, marginTop: spacing(2.5) },
  chip: { paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.75), borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '700', fontSize: font.sm },
  chipTextActive: { color: colors.primaryText },

  section: { color: colors.text, fontSize: font.lg, fontWeight: '800', paddingHorizontal: PAD, marginTop: spacing(2), marginBottom: spacing(1.5) },

  card: { width: CARD_W, marginBottom: GAP, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow.soft },
  poster: { width: '100%', height: POSTER_H, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  posterGlyph: { position: 'absolute', top: spacing(-1.5), right: spacing(-0.5), fontSize: 96, fontWeight: '900', color: 'rgba(255,255,255,0.18)' },
  cardHeart: { position: 'absolute', top: spacing(0.75), right: spacing(0.75) },
  cardBody: { padding: spacing(1.25) },
  cardTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  cardSub: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4) },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing(1) },
  cardMetaText: { color: colors.textMuted, fontSize: font.xs },
}));
