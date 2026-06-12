import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Screen } from '../components/Screen';
import { Cover } from '../components/Cover';
import { Badge } from '../components/Badge';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { getTheatre } from '../api/catalog';
import { initialFor } from '../utils/cover';
import { getErrorMessage } from '../utils/errors';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { font, spacing, radius } from '../theme/theme';

export function TheatreScreen({ route, navigation }) {
  const { theatreId } = route.params;
  const { colors } = useTheme();
  const styles = useStyles();
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTheatre(await getTheatre(theatreId));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [theatreId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Screen><Loading /></Screen>;
  if (error) return <Screen><ErrorView message={error} onRetry={load} /></Screen>;

  return (
    <Screen edges={['bottom']} contentStyle={styles.screen}>
      <FlatList
        data={theatre.shows}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View>
            <Cover seed={theatre.name} scrim style={styles.hero}>
              <Text style={styles.heroGlyph} pointerEvents="none">{initialFor(theatre.name)}</Text>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle} numberOfLines={2}>{theatre.name}</Text>
                <Text style={styles.heroSub} numberOfLines={1}>📍 {theatre.location}</Text>
              </View>
            </Cover>
            {theatre.description ? <Text style={styles.desc}>{theatre.description}</Text> : null}
            <Text style={styles.sectionTitle}>Shows</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('ShowDetails', { showId: item.id, title: item.title })}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Cover seed={item.title} style={styles.thumb} />
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                {item.ageRating ? <Badge label={item.ageRating} color={colors.accent} /> : null}
              </View>
              <Text style={styles.rowMeta}>{item.durationMin} min</Text>
              {item.description ? <Text style={styles.rowDesc} numberOfLines={2}>{item.description}</Text> : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState title="No shows yet" subtitle="This theatre has no scheduled shows." />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  screen: { padding: spacing(2) },
  list: { paddingBottom: spacing(3) },
  hero: { height: 150, borderRadius: radius.lg },
  heroGlyph: { position: 'absolute', top: spacing(-2.5), right: spacing(-1), fontSize: 130, fontWeight: '900', color: 'rgba(255,255,255,0.16)' },
  heroContent: { flex: 1, padding: spacing(2), justifyContent: 'flex-end' },
  heroTitle: { color: '#fff', fontSize: font.xl, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: font.sm, marginTop: spacing(0.4) },
  desc: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(2), lineHeight: 20 },
  sectionTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginTop: spacing(2.5), marginBottom: spacing(0.5) },
  row: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.25), marginTop: spacing(1.5), alignItems: 'center', ...shadow.soft },
  rowPressed: { opacity: 0.85 },
  thumb: { width: 56, height: 72 },
  rowBody: { flex: 1, marginLeft: spacing(1.5) },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { color: colors.text, fontSize: font.md, fontWeight: '700', flexShrink: 1, paddingRight: spacing(1) },
  rowMeta: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4) },
  rowDesc: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.5) },
}));
