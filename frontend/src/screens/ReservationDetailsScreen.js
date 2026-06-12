import { useState, useCallback, useMemo } from 'react';
import { View, Text, Alert, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Cover } from '../components/Cover';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { getReservation, cancelReservation } from '../api/reservations';
import { initialFor } from '../utils/cover';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatTime, formatPrice } from '../utils/format';
import { useTheme, makeStyles } from '../theme/ThemeContext';
import { categoryColor, font, spacing, radius } from '../theme/theme';

export function ReservationDetailsScreen({ route, navigation }) {
  const { reservationId } = route.params;
  const { colors } = useTheme();
  const styles = useStyles();
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRes(await getReservation(reservationId));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Ντετερμινιστικό "barcode" από το id της κράτησης
  const bars = useMemo(() => {
    const seed = Number(res?.id || 7);
    return Array.from({ length: 46 }, (_, i) => ({
      w: ((i * 7 + seed * 3) % 4) * 0.8 + 1.2,
      gap: ((i * 5 + seed) % 3) + 1.2,
    }));
  }, [res?.id]);

  const isFuture = res && new Date(res.startsAt) > new Date();
  const canModify = res && res.status === 'CONFIRMED' && isFuture;
  const confirmed = res && res.status === 'CONFIRMED';

  const doCancel = async () => {
    setWorking(true);
    try {
      await cancelReservation(reservationId);
      // Επιστροφή στη λίστα (ανανεώνεται σε εστίαση· η κράτηση πάει στο Ιστορικό)
      navigation.goBack();
    } catch (e) {
      setWorking(false);
      Alert.alert('Could not cancel', getErrorMessage(e));
    }
  };

  const onCancel = () =>
    Alert.alert('Cancel reservation', 'This will free your seats. Are you sure?', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel reservation', style: 'destructive', onPress: doCancel },
    ]);

  const onModify = () =>
    navigation.navigate('SeatMap', {
      showtimeId: res.showtimeId,
      showTitle: res.showTitle,
      mode: 'edit',
      reservationId: res.id,
      initialSeatIds: res.seats.map((s) => s.seatId),
    });

  // Κοινοποίηση του εισιτηρίου ως κείμενο
  const onShare = () => {
    const seatList = res.seats.map((s) => `${s.rowLabel}${s.number}`).join(', ');
    Share.share({
      message:
        `🎭 ${res.showTitle}\n` +
        `📍 ${res.theatreName} · ${res.hallName}\n` +
        `🗓️ ${formatDate(res.startsAt)} at ${formatTime(res.startsAt)}\n` +
        `💺 Seats: ${seatList}\n` +
        `🎟️ Ticket #${String(res.id).padStart(6, '0')} — booked on Spotlight`,
    }).catch(() => {});
  };

  if (loading) return <Screen><Loading /></Screen>;
  if (error) return <Screen><ErrorView message={error} onRetry={load} /></Screen>;

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.ticket}>
        {/* Στέλεχος εισιτηρίου */}
        <Cover seed={res.showTitle} scrim style={styles.stub}>
          <Text style={styles.stubGlyph} pointerEvents="none">{initialFor(res.showTitle)}</Text>
          <View style={styles.stubBody}>
            <Badge label={res.status} color={confirmed ? colors.success : colors.textMuted} filled />
            <Text style={styles.stubTitle} numberOfLines={2}>{res.showTitle}</Text>
            <Text style={styles.stubSub} numberOfLines={1}>{res.theatreName} · {res.location}</Text>
          </View>
        </Cover>

        {/* Πληροφορίες */}
        <View style={styles.info}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{formatDate(res.startsAt)}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>TIME</Text>
            <Text style={styles.infoValue}>{formatTime(res.startsAt)}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>HALL</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{res.hallName}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>SEATS</Text>
            <Text style={styles.infoValue}>{res.seats.length}</Text>
          </View>
        </View>

        {/* Διάτρητη γραμμή κοπής */}
        <View style={styles.perf}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dash} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        {/* Θέσεις + barcode */}
        <View style={styles.bottom}>
          <Text style={styles.seatsLabel}>Your seats</Text>
          {res.seats.length ? (
            <View style={styles.chips}>
              {res.seats.map((s) => (
                <View key={s.seatId} style={[styles.chip, { borderColor: categoryColor(s.category, colors) }]}>
                  <View style={[styles.chipDot, { backgroundColor: categoryColor(s.category, colors) }]} />
                  <Text style={styles.chipText}>{s.rowLabel}{s.number}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.muted}>No seats — this reservation was cancelled.</Text>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.total}>{formatPrice(res.totalPrice)}</Text>
          </View>

          <View style={styles.barcode}>
            {bars.map((b, i) => (
              <View key={i} style={{ width: b.w, height: 46, backgroundColor: colors.text, marginRight: b.gap }} />
            ))}
          </View>
          <Text style={styles.ticketNo}>TICKET #{String(res.id).padStart(6, '0')}</Text>
        </View>
      </View>

      {confirmed ? (
        <Button title="Share ticket" variant="secondary" onPress={onShare} style={{ marginTop: spacing(2.5) }} />
      ) : null}
      {canModify ? (
        <>
          <Button title="Change seats" variant="secondary" onPress={onModify} style={{ marginTop: spacing(1.5) }} />
          <Button title="Cancel reservation" variant="danger" onPress={onCancel} loading={working} style={{ marginTop: spacing(1.5) }} />
        </>
      ) : null}
    </Screen>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  ticket: { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.card },

  // Στέλεχος
  stub: { height: 160, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  stubGlyph: { position: 'absolute', top: spacing(-2.5), right: spacing(-1), fontSize: 140, fontWeight: '900', color: 'rgba(255,255,255,0.16)' },
  stubBody: { flex: 1, padding: spacing(2), justifyContent: 'flex-end' },
  stubTitle: { color: '#fff', fontSize: font.xl, fontWeight: '800', marginTop: spacing(1) },
  stubSub: { color: 'rgba(255,255,255,0.85)', fontSize: font.sm, marginTop: spacing(0.4) },

  // Πληροφορίες
  info: { flexDirection: 'row', paddingHorizontal: spacing(2), marginTop: spacing(2) },
  infoCol: { flex: 1 },
  infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  infoValue: { color: colors.text, fontSize: font.md, fontWeight: '700', marginTop: spacing(0.4) },

  // Διάτρηση
  perf: { height: spacing(3), justifyContent: 'center', marginTop: spacing(2) },
  notch: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg, top: 0 },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },
  dash: { marginHorizontal: spacing(1.5), borderBottomWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },

  // Κάτω μέρος
  bottom: { paddingHorizontal: spacing(2), paddingBottom: spacing(2.5) },
  seatsLabel: { color: colors.textMuted, fontSize: font.xs, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing(1.25) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing(0.6), paddingHorizontal: spacing(1.25), paddingVertical: spacing(0.6), borderRadius: radius.pill, borderWidth: 1.5, backgroundColor: colors.surface },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { color: colors.text, fontSize: font.sm, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: font.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing(2), paddingTop: spacing(2), borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  total: { color: colors.primary, fontSize: font.xl, fontWeight: '800' },
  barcode: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: spacing(2.5), height: 46, overflow: 'hidden' },
  ticketNo: { color: colors.textMuted, fontSize: font.xs, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginTop: spacing(1) },
}));
