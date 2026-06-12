import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { PressableScale } from '../components/PressableScale';
import { Confetti } from '../components/Confetti';
import { getShowtime, getSeatMap } from '../api/catalog';
import { createReservation, modifyReservation } from '../api/reservations';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime, formatPrice } from '../utils/format';
import { tapLight, notifySuccess, notifyError } from '../utils/haptics';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { categoryColor, font, spacing, radius } from '../theme/theme';

const PARTY_MAX = 8;

// Θέση που "αναπηδά" όταν επιλέγεται
function Seat({ seat, selected, taken, onPress }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(selected);
  useEffect(() => {
    if (selected && !prev.current) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, speed: 50, bounciness: 18 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 12 }),
      ]).start();
    }
    prev.current = selected;
  }, [selected, scale]);

  return (
    <Pressable onPress={onPress} disabled={taken}>
      <Animated.View
        style={[
          styles.seat,
          { borderColor: categoryColor(seat.category, colors), transform: [{ scale }] },
          selected && styles.seatSelected,
          taken && styles.seatTaken,
        ]}
      >
        <Text style={[styles.seatText, selected && styles.seatTextSelected]}>{seat.number}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function SeatMapScreen({ route, navigation }) {
  const { showtimeId, showTitle, mode = 'create', reservationId, initialSeatIds = [] } = route.params;
  const isEdit = mode === 'edit';
  const { colors } = useTheme();
  const styles = useStyles();

  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [party, setParty] = useState(1); // πόσες θέσεις ψάχνει το "Best available"
  const [selected, setSelected] = useState(() => new Set(initialSeatIds));

  const ownSeatIds = useMemo(() => new Set(initialSeatIds), [initialSeatIds]);

  const loadSeats = useCallback(async () => {
    const data = await getSeatMap(showtimeId);
    setSeats(data);
    return data; // επιστροφή των φρέσκων δεδομένων για άμεση χρήση (αποφυγή stale state)
  }, [showtimeId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [st] = await Promise.all([getShowtime(showtimeId), loadSeats()]);
      setShowtime(st);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [showtimeId, loadSeats]);

  useEffect(() => { load(); }, [load]);

  // Καθαρισμός του overlay επιτυχίας κατά την έξοδο, ώστε να μην παραμένει
  useEffect(() => navigation.addListener('blur', () => setBooked(false)), [navigation]);

  const rows = useMemo(() => {
    const map = new Map();
    for (const s of seats) {
      if (!map.has(s.rowLabel)) map.set(s.rowLabel, []);
      map.get(s.rowLabel).push(s);
    }
    return [...map.entries()];
  }, [seats]);

  // Τιμή ανά κατηγορία (για το υπόμνημα)
  const priceByCat = useMemo(() => {
    const map = {};
    for (const p of showtime?.prices || []) map[p.category] = p.price;
    return map;
  }, [showtime]);

  const isTaken = useCallback((seat) => seat.taken && !ownSeatIds.has(seat.seatId), [ownSeatIds]);

  const toggle = (seat) => {
    if (isTaken(seat)) return;
    tapLight();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seat.seatId)) next.delete(seat.seatId);
      else next.add(seat.seatId);
      return next;
    });
  };

  // Αυτόματη επιλογή των καλύτερων ΣΥΝΕΧΟΜΕΝΩΝ θέσεων για την παρέα
  // (καλύτερη κατηγορία, κοντά στη σκηνή & στο κέντρο της σειράς)
  const pickBest = () => {
    const n = party;
    const rank = { VIP: 0, PREMIUM: 1, STANDARD: 2 };
    const maxNum = Math.max(...seats.map((s) => s.number), 0);
    const center = (maxNum + 1) / 2;

    let best = null;
    for (const [rowLabel, rowSeats] of rows) {
      const sorted = [...rowSeats].sort((a, b) => a.number - b.number);
      for (let i = 0; i + n <= sorted.length; i += 1) {
        const run = sorted.slice(i, i + n);
        if (run[n - 1].number - run[0].number !== n - 1) continue; // όχι συνεχόμενες
        if (run.some((s) => isTaken(s) || selected.has(s.seatId))) continue;
        const score = [
          run.reduce((t, s) => t + rank[s.category], 0) / n, // μέση κατηγορία
          rowLabel, // πιο μπροστινή σειρά
          Math.abs((run[0].number + run[n - 1].number) / 2 - center), // απόσταση από το κέντρο
        ];
        const better = !best
          || score[0] < best.score[0]
          || (score[0] === best.score[0] && score[1].localeCompare(best.score[1]) < 0)
          || (score[0] === best.score[0] && score[1] === best.score[1] && score[2] < best.score[2]);
        if (better) best = { run, score };
      }
    }

    if (!best) {
      Alert.alert(
        'No matching seats',
        n === 1
          ? 'There are no more available seats for this showtime.'
          : `Couldn't find ${n} adjacent seats. Try fewer seats or pick them manually.`,
      );
      return;
    }
    tapLight();
    setSelected((prev) => new Set([...prev, ...best.run.map((s) => s.seatId)]));
  };

  const selectedSeats = seats.filter((s) => selected.has(s.seatId));
  const total = selectedSeats.reduce((sum, s) => sum + Number(s.price), 0);

  // "Αναπήδηση" του συνόλου σε κάθε αλλαγή (όχι στο πρώτο render)
  const totalScale = useRef(new Animated.Value(1)).current;
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    Animated.sequence([
      Animated.spring(totalScale, { toValue: 1.14, useNativeDriver: true, speed: 50, bounciness: 14 }),
      Animated.spring(totalScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }),
    ]).start();
  }, [total, totalScale]);

  const onConfirm = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await modifyReservation(reservationId, [...selected]);
        notifySuccess();
        Alert.alert('Reservation updated', 'Your seats have been changed.');
        navigation.goBack();
      } else {
        await createReservation(showtimeId, [...selected]);
        notifySuccess();
        setBooked(true); // εμφανίζει το overlay επιτυχίας με confetti
      }
    } catch (e) {
      notifyError();
      Alert.alert('Could not complete booking', getErrorMessage(e));
      // Ξαναφόρτωσε τις θέσεις και κράτα στην επιλογή μόνο όσες ΔΕΝ κρατήθηκαν στο μεταξύ από άλλον
      const fresh = await loadSeats();
      setSelected((prev) => new Set([...prev].filter((id) => {
        const s = fresh.find((x) => x.seatId === id);
        return s && !(s.taken && !ownSeatIds.has(id));
      })));
    } finally {
      setSubmitting(false);
    }
  };

  // Το header (τίτλος + system back) έρχεται από τον native stack navigator
  if (loading) {
    return (
      <Screen edges={['bottom']} contentStyle={styles.screen}>
        <Loading label="Loading seats…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen edges={['bottom']} contentStyle={styles.screen}>
        <ErrorView message={error} onRetry={load} />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']} contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.title} numberOfLines={1}>{showTitle}</Text>
          {showtime ? <Text style={styles.sub}>{formatDateTime(showtime.startsAt)} · {showtime.hallName}</Text> : null}
        </View>
      </View>

      <View style={styles.actions}>
        <PressableScale onPress={pickBest} style={styles.bestBtn} scaleTo={0.95}>
          <Text style={styles.bestText}>✨ Best {party > 1 ? `${party} together` : 'available'}</Text>
        </PressableScale>
        <View style={styles.stepper}>
          <Pressable onPress={() => { tapLight(); setParty((p) => Math.max(1, p - 1)); }} hitSlop={8} style={styles.stepBtn}>
            <Ionicons name="remove" size={16} color={party > 1 ? colors.text : colors.textMuted} />
          </Pressable>
          <Text style={styles.stepValue}>{party}</Text>
          <Pressable onPress={() => { tapLight(); setParty((p) => Math.min(PARTY_MAX, p + 1)); }} hitSlop={8} style={styles.stepBtn}>
            <Ionicons name="add" size={16} color={party < PARTY_MAX ? colors.text : colors.textMuted} />
          </Pressable>
        </View>
        {selected.size > 0 ? (
          <Pressable onPress={() => setSelected(new Set())} hitSlop={8} style={styles.clearWrap}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <LinearGradient colors={[colors.surfaceAlt, colors.surface]} style={styles.stage}>
        <Text style={styles.stageText}>STAGE</Text>
      </LinearGradient>

      <View style={styles.grid}>
        {rows.map(([rowLabel, rowSeats]) => (
          <View key={rowLabel} style={styles.row}>
            <Text style={styles.rowLabel}>{rowLabel}</Text>
            {rowSeats.map((seat) => (
              <Seat
                key={seat.seatId}
                seat={seat}
                selected={selected.has(seat.seatId)}
                taken={isTaken(seat)}
                onPress={() => toggle(seat)}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Legend color={colors.standard} label="Standard" price={priceByCat.STANDARD} />
        <Legend color={colors.premium} label="Premium" price={priceByCat.PREMIUM} />
        <Legend color={colors.vip} label="VIP" price={priceByCat.VIP} />
        <Legend color={colors.seatSelected} label="Selected" filled />
        <Legend color={colors.seatTaken} label="Taken" filled />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{selected.size} seat{selected.size === 1 ? '' : 's'}</Text>
          <Animated.View style={{ transform: [{ scale: totalScale }], alignSelf: 'flex-start' }}>
            <Text style={styles.footerTotal}>{formatPrice(total)}</Text>
          </Animated.View>
        </View>
        <Button
          title={isEdit ? 'Save changes' : 'Confirm booking'}
          onPress={onConfirm}
          loading={submitting}
          disabled={selected.size === 0}
          style={styles.confirmBtn}
        />
      </View>

      {booked ? (
        <View style={styles.successOverlay}>
          <Confetti />
          <View style={styles.successCard}>
            <View style={styles.successCheck}><Ionicons name="checkmark" size={42} color="#fff" /></View>
            <Text style={styles.successTitle}>Booking confirmed 🎉</Text>
            <Text style={styles.successSub}>Your seats are reserved. Enjoy the show!</Text>
            <Button
              title="View my tickets"
              onPress={() => navigation.navigate('TicketsTab', { screen: 'MyReservations' })}
              style={styles.successBtn}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function Legend({ color, label, filled, price }) {
  const styles = useStyles();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { borderColor: color }, filled && { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}{price != null ? ` · ${formatPrice(price)}` : ''}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  screen: { padding: spacing(2) },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.25) },
  flex: { flex: 1 },
  title: { color: colors.text, fontSize: font.lg, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing(0.4) },

  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(1.5) },
  bestBtn: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.85) },
  bestText: { color: colors.primary, fontWeight: '800', fontSize: font.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing(0.75), paddingVertical: spacing(0.5) },
  stepBtn: { paddingHorizontal: spacing(0.5) },
  stepValue: { color: colors.text, fontWeight: '800', fontSize: font.sm, minWidth: 20, textAlign: 'center' },
  clearWrap: { marginLeft: 'auto' },
  clearText: { color: colors.accent, fontWeight: '700', fontSize: font.sm },

  stage: { borderRadius: radius.lg, paddingVertical: spacing(1.25), alignItems: 'center', marginBottom: spacing(2.5), borderBottomWidth: 2, borderBottomColor: colors.primary },
  stageText: { color: colors.textMuted, letterSpacing: 6, fontSize: font.xs, fontWeight: '700' },
  grid: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(0.75) },
  rowLabel: { color: colors.textMuted, width: 18, fontSize: font.xs, fontWeight: '700' },
  seat: { width: 34, height: 34, borderRadius: radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3, backgroundColor: colors.surface },
  seatSelected: { backgroundColor: colors.seatSelected, borderColor: colors.seatSelected },
  seatTaken: { backgroundColor: colors.seatTaken, borderColor: colors.seatTaken },
  seatText: { color: colors.textMuted, fontSize: font.xs, fontWeight: '700' },
  seatTextSelected: { color: colors.primaryText },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5), justifyContent: 'center', marginTop: spacing(2.5) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5 },
  legendText: { color: colors.textMuted, fontSize: font.xs },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: spacing(2) },
  footerLabel: { color: colors.textMuted, fontSize: font.sm },
  footerTotal: { color: colors.primary, fontSize: font.xl, fontWeight: '800' },
  confirmBtn: { flex: 1, marginLeft: spacing(2) },

  successOverlay: { position: 'absolute', top: -spacing(2), left: -spacing(2), right: -spacing(2), bottom: -spacing(2), backgroundColor: 'rgba(10,8,20,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: spacing(3) },
  successCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing(3), alignItems: 'center', alignSelf: 'stretch', ...shadow.card },
  successCheck: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) },
  successTitle: { color: colors.text, fontSize: font.xl, fontWeight: '800', textAlign: 'center' },
  successSub: { color: colors.textMuted, fontSize: font.sm, textAlign: 'center', marginTop: spacing(0.75) },
  successBtn: { alignSelf: 'stretch', marginTop: spacing(2.5) },
}));
