import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';
import { SegmentedControl } from './ui';

function toYmd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toHm(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function parseYmd(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function parseHm(value?: string) {
  if (!value) {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  }
  const [h, m] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(h || 0, m || 0, 0, 0);
  return date;
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseYmd(value);

  function onPick(_event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (date) {
      onChange(toYmd(date));
    }
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        <Text style={styles.value}>
          {selected.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </Pressable>
      {open ? (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={styles.modal}>
              <View style={styles.sheet}>
                <DateTimePicker value={selected} mode="date" display="spinner" onChange={onPick} />
                <Pressable onPress={() => setOpen(false)} style={styles.done}>
                  <Text style={styles.doneLabel}>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker value={selected} mode="date" display="default" onChange={onPick} />
        )
      ) : null}
    </View>
  );
}

export function TimeField({
  label,
  value,
  onChange,
  optional,
}: {
  label?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseHm(value);

  function onPick(_event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (date) {
      onChange(toHm(date));
    }
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable onPress={() => setOpen(true)} style={[styles.field, { flex: 1 }]}>
          <Text style={styles.value}>{value ?? 'Pick time'}</Text>
        </Pressable>
        {optional && value ? (
          <Pressable onPress={() => onChange(undefined)} style={styles.clear}>
            <Text style={styles.clearLabel}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      {open ? (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={styles.modal}>
              <View style={styles.sheet}>
                <DateTimePicker value={selected} mode="time" display="spinner" onChange={onPick} />
                <Pressable onPress={() => setOpen(false)} style={styles.done}>
                  <Text style={styles.doneLabel}>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker value={selected} mode="time" display="default" onChange={onPick} />
        )
      ) : null}
    </View>
  );
}

export function PeriodFilter({
  period,
  onPeriodChange,
  date,
  onDateChange,
}: {
  period: 'day' | 'week' | 'month';
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
  date: string;
  onDateChange: (date: string) => void;
}) {
  return (
    <View style={styles.filter}>
      <SegmentedControl
        value={period}
        onChange={(value) => onPeriodChange(value as 'day' | 'week' | 'month')}
        options={[
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ]}
      />
      <DateField value={date} onChange={onDateChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
  value: { fontSize: 16, fontWeight: '600', color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clear: { paddingHorizontal: 10, paddingVertical: 12 },
  clearLabel: { color: colors.accentDim, fontWeight: '700' },
  modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24 },
  done: { alignItems: 'center', paddingVertical: 14 },
  doneLabel: { color: colors.accentDim, fontWeight: '700', fontSize: 16 },
  filter: { gap: 10 },
});
