import type { AvatarState, ContrastBadge } from '../types/avatar';
import { resolveThemedColors } from './themeEngine';

export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const parsed = Number.parseInt(clean, 16);
  if (Number.isNaN(parsed)) {
    return [0, 0, 0];
  }
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

export function evaluateContrast(state: AvatarState): ContrastBadge[] {
  const resolved = resolveThemedColors(state);
  const bgs = resolved.grad ? [resolved.bg, resolved.bg2] : [resolved.bg];
  const worstRatio = (foreground: string) =>
    Math.min(...bgs.map((background) => contrastRatio(foreground, background)));

  const buildBadge = (id: string, label: string, color: string): ContrastBadge => {
    const value = worstRatio(color);
    const level = value >= 4.5 ? 'ok' : value >= 3 ? 'warn' : 'bad';
    const statusText = value >= 4.5 ? 'Đạt chuẩn' : value >= 3 ? 'Trung bình' : 'Khó đọc';
    return { id, label, ratio: value, level, statusText };
  };

  const badges: ContrastBadge[] = [
    buildBadge('text', 'Chữ chính / nền', resolved.text),
    buildBadge('accent', 'Nhấn / nền', resolved.accent),
  ];

  if (state.ringOn) {
    badges.push(buildBadge('ring', 'Viền / nền', resolved.ring));
  }

  return badges;
}
