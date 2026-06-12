import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Cover } from '../components/Cover';
import { Badge } from '../components/Badge';
import { Segmented } from '../components/Segmented';
import { RowSkeletonList } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { getShows, getTheatres } from '../api/catalog';
import { getErrorMessage } from '../utils/errors';
import { STORAGE_KEYS, loadJSON, saveJSON, remove } from '../storage/local';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { font, spacing, radius } from '../theme/theme';

const RECENT_MAX = 8;
const SCOPES = [['shows', 'Shows'], ['theatres', 'Theatres']];

export function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [scope, setScope] = useState('shows');
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);

  // Πρόσφατες αναζητήσεις, αποθηκευμένες τοπικά στη συσκευή
  useEffect(() => {
    loadJSON(STORAGE_KEYS.recentSearches, []).then(setRecent);
  }, []);

  const saveRecent = useCallback((q) => {
    const term = q.trim();
    if (!term) return;
    setRecent((prev) => {
      const next = [term, ...prev.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, RECENT_MAX);
      saveJSON(STORAGE_KEYS.recentSearches, next);
      return next;
    });
  }, []);

  const clearRecent = () => {
    setRecent([]);
    remove(STORAGE_KEYS.recentSearches);
  };

  const load = useCallback(async () => {
    setError(null);
    try {
      const q = query.trim();
      const result = scope === 'shows'
        ? await getShows(q ? { title: q } : {})
        : await getTheatres(q || undefined);
      setData(result);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [scope, query]);

  // Επαναφόρτωση με debounce όταν αλλάζει το πεδίο ή το ερώτημα
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Όταν ανοίγεις ένα αποτέλεσμα, το ερώτημα σώζεται στις πρόσφατες αναζητήσεις
  const goShow = (item) => { saveRecent(query); navigation.navigate('ShowDetails', { showId: item.id, title: item.title }); };
  const goTheatre = (item) => { saveRecent(query); navigation.navigate('Theatre', { theatreId: item.id, name: item.name }); };

  const renderShow = ({ item }) => (
    <Pressable onPress={() => goShow(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Cover seed={item.title} style={styles.thumb} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
          {item.ageRating ? <Badge label={item.ageRating} color={colors.accent} /> : null}
        </View>
        <Text style={styles.rowSub} numberOfLines={1}>{item.theatreName} · {item.theatreLocation}</Text>
        <Text style={styles.rowMeta}>{item.durationMin} min</Text>
      </View>
    </Pressable>
  );

  const renderTheatre = ({ item }) => (
    <Pressable onPress={() => goTheatre(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Cover seed={item.name} style={styles.thumb} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>📍 {item.location}</Text>
        {item.description ? <Text style={styles.rowMeta} numberOfLines={2}>{item.description}</Text> : null}
      </View>
    </Pressable>
  );

  const showRecent = !query.trim() && recent.length > 0;

  return (
    <Screen edges={['top']} contentStyle={styles.screen}>
      <Text style={styles.heading}>Search</Text>
      <Segmented value={scope} onChange={(s) => { setScope(s); setQuery(''); }} options={SCOPES} />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={scope === 'shows' ? 'Search by show title…' : 'Search by name or location…'}
        returnKeyType="search"
        clearable
      />

      {showRecent ? (
        <View style={styles.recentWrap}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent searches</Text>
            <Pressable onPress={clearRecent} hitSlop={8}>
              <Text style={styles.recentClear}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.recentChips}>
            {recent.map((term) => (
              <Pressable key={term} onPress={() => setQuery(term)} style={({ pressed }) => [styles.recentChip, pressed && styles.rowPressed]}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={styles.recentChipText} numberOfLines={1}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {loading ? (
        <RowSkeletonList />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={scope === 'shows' ? renderShow : renderTheatre}
          ListHeaderComponent={
            query.trim()
              ? <Text style={styles.resultCount}>{data.length} result{data.length === 1 ? '' : 's'}</Text>
              : null
          }
          ListEmptyComponent={<EmptyState title="Nothing found" subtitle="Try a different search." />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  screen: { padding: spacing(2), paddingBottom: 0 },
  heading: { color: colors.text, fontSize: font.xl, fontWeight: '800', marginBottom: spacing(1.5) },

  recentWrap: { marginBottom: spacing(1.5) },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(1) },
  recentTitle: { color: colors.textMuted, fontSize: font.xs, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  recentClear: { color: colors.accent, fontSize: font.sm, fontWeight: '700' },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing(0.5), maxWidth: '100%',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.pill, paddingHorizontal: spacing(1.25), paddingVertical: spacing(0.6),
  },
  recentChipText: { color: colors.text, fontSize: font.sm, fontWeight: '600' },

  resultCount: { color: colors.textMuted, fontSize: font.xs, fontWeight: '700', marginBottom: spacing(1) },
  list: { paddingBottom: spacing(3) },
  row: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.25), marginBottom: spacing(1.5), alignItems: 'center', ...shadow.soft },
  rowPressed: { opacity: 0.9 },
  thumb: { width: 56, height: 72 },
  rowBody: { flex: 1, marginLeft: spacing(1.5) },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { color: colors.text, fontSize: font.md, fontWeight: '700', flexShrink: 1, paddingRight: spacing(1) },
  rowSub: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.4) },
  rowMeta: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4) },
}));
