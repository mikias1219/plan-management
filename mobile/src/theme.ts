export const colors = {
  bg: '#F2F4F7',
  surface: '#FFFFFF',
  ink: '#0F172A',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E8ECF1',
  hairline: '#EEF1F5',
  accent: '#0D9488',
  accentDim: '#0F766E',
  accentSoft: '#CCFBF1',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  iconWell: '#F0FDFA',
  overlay: 'rgba(15, 23, 42, 0.04)',
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = 16;

export function money(value: number, currency = 'ETB') {
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));
  return `${currency} ${formatted}`;
}

export function monthLabel(month = new Date().toISOString().slice(0, 7)) {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
