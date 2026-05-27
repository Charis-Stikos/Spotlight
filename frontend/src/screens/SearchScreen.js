import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Cover } from '../components/Cover';
import { Badge } from '../components/Badge';
import { RowSkeletonList } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { getShows, getTheatres } from '../api/catalog';
import { getErrorMessage } from '../utils/errors';
import { colors, font, spacing, radius, shadow } from '../theme/theme';

function Segmented({ value, onChange }) {
  return (
    <View style={styles.segment}>
      {[['shows', 'Shows'], ['theatres', 'Theatres']].map(([key, label]) => (
        <Pressable key={key} onPress={() => onChange(key)} style={[styles.segmentBtn, value === key && styles.segmentActive]}>
          <Text style={[styles.segmentText, value === key && styles.segmentTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function SearchScreen({ navigation }) {
  const [scope, setScope] = useState('shows');
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const goShow = (item) => navigation.navigate('ShowDetails', { showId: item.id, title: item.title });
  const goTheatre = (item) => navigation.navigate('Theatre', { theatreId: item.id, name: item.name });

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

  return (
    <Screen edges={['top']} contentStyle={styles.screen}>
      <Text style={styles.heading}>Search</Text>
      <Segmented value={scope} onChange={(s) => { setScope(s); setQuery(''); }} />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={scope === 'shows' ? 'Search by show title…' : 'Search by name or location…'}
        returnKeyType="search"
      />
      {loading ? (
        <RowSkeletonList />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={scope === 'shows' ? renderShow : renderTheatre}
          ListEmptyComponent={<EmptyState title="Nothing found" subtitle="Try a different search." />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing(2), paddingBottom: 0 },
  heading: { color: colors.text, fontSize: font.xl, fontWeight: '800', marginBottom: spacing(1.5) },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing(1.5), borderWidth: 1, borderColor: colors.border },
  segmentBtn: { flex: 1, paddingVertical: spacing(1), borderRadius: radius.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.textMuted, fontWeight: '700', fontSize: font.sm },
  segmentTextActive: { color: colors.primaryText },
  list: { paddingBottom: spacing(3) },
  row: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.25), marginBottom: spacing(1.5), alignItems: 'center', ...shadow.soft },
  rowPressed: { opacity: 0.9 },
  thumb: { width: 56, height: 72 },
  rowBody: { flex: 1, marginLeft: spacing(1.5) },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { color: colors.text, fontSize: font.md, fontWeight: '700', flexShrink: 1, paddingRight: spacing(1) },
  rowSub: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.4) },
  rowMeta: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4) },
});
