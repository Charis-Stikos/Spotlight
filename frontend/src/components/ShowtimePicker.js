import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { PressableScale } from './PressableScale';
import { formatTime, formatPrice } from '../utils/format';
import { tapLight } from '../utils/haptics';
import { makeStyles } from '../theme/ThemeContext';
import { font, spacing, radius } from '../theme/theme';

// Πόσες μέρες απέχει μια ημερομηνία από σήμερα
function daysFromToday(iso) {
  const a = new Date(iso); a.setHours(0, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((a - now) / 86400000);
}

// Σύντομη ετικέτα ημέρας για τα date chips ("TODAY" / "TMRW" / "FRI")
function dowLabel(iso) {
  const days = daysFromToday(iso);
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TMRW';
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
}

// Επιλογέας ημερομηνίας & ώρας: οριζόντια date chips + κάρτες ωρών για την επιλεγμένη μέρα
// grouped: [[dayKey, showtimes[]], ...] — onPick(showtime)
export function ShowtimePicker({ grouped, onPick }) {
  const styles = useStyles();
  const [dayIdx, setDayIdx] = useState(0);
  const safeIdx = Math.min(dayIdx, grouped.length - 1);
  const times = grouped[safeIdx]?.[1] || [];

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>
        {grouped.map(([day, sts], i) => {
          const active = i === safeIdx;
          const d = new Date(sts[0].startsAt);
          return (
            <Pressable
              key={day}
              onPress={() => { tapLight(); setDayIdx(i); }}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text style={[styles.dayChipDow, active && styles.dayChipTextActive]}>{dowLabel(sts[0].startsAt)}</Text>
              <Text style={[styles.dayChipNum, active && styles.dayChipTextActive]}>{d.getDate()}</Text>
              <Text style={[styles.dayChipMon, active && styles.dayChipTextActive]}>
                {d.toLocaleDateString(undefined, { month: 'short' })}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.timeGrid}>
        {times.map((st) => (
          <PressableScale key={st.id} onPress={() => onPick(st)} style={styles.timeCard} scaleTo={0.95}>
            <Text style={styles.timeText}>{formatTime(st.startsAt)}</Text>
            <Text style={styles.timeHall} numberOfLines={1}>{st.hallName}</Text>
            <Text style={styles.timePrice}>from {formatPrice(st.basePrice)}</Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors, shadow) => ({
  dayChips: { gap: spacing(1), paddingVertical: spacing(0.5) },
  dayChip: {
    width: 64, alignItems: 'center', paddingVertical: spacing(1.25),
    borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    ...shadow.soft,
  },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipDow: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dayChipNum: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginTop: spacing(0.25) },
  dayChipMon: { color: colors.textMuted, fontSize: font.xs },
  dayChipTextActive: { color: colors.primaryText },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1), marginTop: spacing(1.5) },
  timeCard: {
    flexGrow: 1, flexBasis: '30%', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingVertical: spacing(1.25), paddingHorizontal: spacing(1),
    ...shadow.soft,
  },
  timeText: { color: colors.text, fontSize: font.lg, fontWeight: '800' },
  timeHall: { color: colors.textMuted, fontSize: font.xs, marginTop: spacing(0.4) },
  timePrice: { color: colors.primary, fontSize: font.xs, fontWeight: '700', marginTop: spacing(0.5) },
}));
