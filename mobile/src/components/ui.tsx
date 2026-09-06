import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space } from '../theme';

export function Screen({ children, safe = true }: { children: React.ReactNode; safe?: boolean }) {
  return (
    <SafeAreaView style={[styles.screen, !safe && { paddingTop: 12 }]} edges={safe ? ['top'] : []}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenHeader({
  kicker,
  title,
  subtitle,
  right,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Group({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <View style={styles.groupWrap}>
      {label ? <Text style={styles.section}>{label}</Text> : null}
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export function Row({
  icon,
  title,
  subtitle,
  value,
  onPress,
  last,
  destructive,
  tone = 'accent',
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: () => void;
  last?: boolean;
  destructive?: boolean;
  tone?: 'accent' | 'success' | 'danger' | 'neutral';
}) {
  const well = {
    accent: { bg: colors.accentSoft, fg: colors.accentDim },
    success: { bg: '#ECFDF5', fg: colors.success },
    danger: { bg: '#FEF2F2', fg: colors.error },
    neutral: { bg: colors.hairline, fg: colors.muted },
  }[tone];

  const body = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      {icon ? (
        <View style={[styles.well, { backgroundColor: well.bg }]}>
          <Ionicons name={icon} size={18} color={well.fg} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, destructive && { color: colors.error }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value !== undefined && value !== '' ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </View>
  );

  if (!onPress) {
    return body;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { backgroundColor: colors.overlay }}>
      {body}
    </Pressable>
  );
}

export function Card({
  children,
  onPress,
  tone = 'cream',
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'cream' | 'ink' | 'forest' | 'copper';
  style?: object;
}) {
  const palette = {
    cream: { bg: colors.surface, border: colors.border },
    ink: { bg: colors.ink, border: colors.ink },
    forest: { bg: colors.accentDim, border: colors.accentDim },
    copper: { bg: colors.error, border: colors.error },
  }[tone];
  const inner = (
    <View style={[styles.card, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>{children}</View>
  );
  if (!onPress) {
    return inner;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.92 }}>
      {inner}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primary, disabled && styles.disabled]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Muted>{body}</Muted>
    </View>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry}>
          <Text style={styles.retry}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProgressBar({
  value,
  color = colors.accent,
  track = colors.hairline,
}: {
  value: number;
  color?: string;
  track?: string;
}) {
  return (
    <View style={[styles.track, { backgroundColor: track }]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function HeaderButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.iconBtn}>
      <Ionicons name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

export function Fab({
  icon = 'add',
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.fab}>
      <Ionicons name={icon} size={26} color="#fff" />
    </Pressable>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segmentItem, on && styles.segmentItemOn]}
          >
            <Text style={[styles.segmentLabel, on && styles.segmentLabelOn]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function InsightCard({
  icon,
  title,
  body,
  progress,
  value,
  tone = 'info',
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  progress?: number;
  value?: string | number;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  onPress?: () => void;
}) {
  const palette = {
    info: { bg: colors.surface, accent: colors.accent, soft: colors.accentSoft },
    success: { bg: colors.surface, accent: colors.success, soft: '#ECFDF5' },
    warning: { bg: colors.surface, accent: colors.warning, soft: '#FFFBEB' },
    danger: { bg: colors.surface, accent: colors.error, soft: '#FEF2F2' },
  }[tone];

  const content = (
    <View style={[styles.insight, { borderColor: colors.border }]}>
      <View style={styles.insightTop}>
        {icon ? (
          <View style={[styles.well, { backgroundColor: palette.soft }]}>
            <Ionicons name={icon} size={18} color={palette.accent} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>{title}</Text>
          {body ? <Text style={styles.insightBody}>{body}</Text> : null}
        </View>
        {value !== undefined ? <Text style={[styles.insightValue, { color: palette.accent }]}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
      </View>
      {typeof progress === 'number' ? (
        <ProgressBar value={progress} color={palette.accent} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.92 }}>
      {content}
    </Pressable>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  onPress,
}: {
  label: string;
  value: string | number;
  hint?: string;
  onPress?: () => void;
}) {
  const body = (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
  if (!onPress) {
    return <View style={{ flex: 1 }}>{body}</View>;
  }
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 12 },
  kicker: { color: colors.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.2, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 4, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupWrap: { gap: 0 },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    minHeight: 56,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  well: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },
  rowSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  rowValue: { fontSize: 15, fontWeight: '600', color: colors.muted, marginRight: 2 },
  card: {
    borderWidth: 1,
    borderRadius: radius,
    padding: space.md,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipLabel: { color: colors.ink, fontWeight: '600', fontSize: 14 },
  chipLabelOn: { color: '#fff' },
  primary: {
    backgroundColor: colors.accentDim,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  ghost: { paddingVertical: 12, alignItems: 'center' },
  ghostLabel: { color: colors.accentDim, fontSize: 16, fontWeight: '600' },
  empty: { paddingVertical: 28, paddingHorizontal: 12, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  error: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius,
    padding: space.md,
    marginBottom: space.md,
    gap: 8,
  },
  errorText: { color: colors.error, fontSize: 14 },
  retry: { color: colors.accentDim, fontWeight: '700' },
  track: { height: 6, borderRadius: 99, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 99 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.hairline,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentItemOn: {
    backgroundColor: colors.surface,
  },
  segmentLabel: { fontSize: 14, fontWeight: '600', color: colors.muted },
  segmentLabelOn: { color: colors.ink },
  insight: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius,
    padding: 14,
    gap: 12,
  },
  insightTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  insightBody: { fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
  insightValue: { fontSize: 18, fontWeight: '700' },
  metric: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 14,
    gap: 4,
    minHeight: 88,
  },
  metricLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  metricValue: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  metricHint: { fontSize: 12, color: colors.muted },
});
