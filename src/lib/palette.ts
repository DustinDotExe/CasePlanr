export const PALETTE_COLORS = ['orange', 'blue', 'red', 'green', 'purple', 'neutral'] as const;
export type PaletteColor = (typeof PALETTE_COLORS)[number];

export function parsePaletteColor(stored: string | null): PaletteColor {
  return PALETTE_COLORS.includes(stored as PaletteColor) ? (stored as PaletteColor) : 'blue';
}

export const PALETTE_OPTIONS: { value: PaletteColor; label: string; swatch: string }[] = [
  { value: 'orange', label: 'Orange', swatch: '#ea580c' },
  { value: 'blue', label: 'Blue', swatch: '#2563eb' },
  { value: 'red', label: 'Red', swatch: '#dc2626' },
  { value: 'green', label: 'Green', swatch: '#16a34a' },
  { value: 'purple', label: 'Purple', swatch: '#9333ea' },
  { value: 'neutral', label: 'Neutral', swatch: '#525252' },
];
