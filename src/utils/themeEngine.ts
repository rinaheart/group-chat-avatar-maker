import type { AvatarState, ResolvedThemeColors } from '../types/avatar';
import { contrastRatio, hexToRgb } from './colorContrast';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  return [h * 60, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp01(s);
  const ln = clamp01(l);

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  return [
    Math.round(hue2rgb(hn / 360 + 1 / 3) * 255),
    Math.round(hue2rgb(hn / 360) * 255),
    Math.round(hue2rgb(hn / 360 - 1 / 3) * 255),
  ];
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Extracts the most expressive chromatic hue from the current palette
 * so themes like Neon, Pastel, and Swiss inherit the palette's color identity.
 */
export function extractDominantHue(
  colors: Pick<AvatarState, 'bg' | 'accent' | 'ring'>
): { h: number; s: number } {
  const candidates = [colors.bg, colors.accent, colors.ring];
  for (const hex of candidates) {
    const [r, g, b] = hexToRgb(hex);
    const [h, s] = rgbToHsl(r, g, b);
    if (s >= 0.22) {
      return { h, s };
    }
  }
  return { h: 214, s: 0.78 };
}

/**
 * Finds a lightness on (h, s) that guarantees minRatio contrast against all backgrounds.
 */
export function tuneLightnessForContrast(
  h: number,
  s: number,
  initialL: number,
  bgs: string[],
  preferLighter: boolean,
  minRatio: number = 4.6
): string {
  const worst = (hex: string) => Math.min(...bgs.map((bg) => contrastRatio(hex, bg)));
  let l = clamp01(initialL);
  let candidate = hslToHex(h, s, l);
  if (worst(candidate) >= minRatio) return candidate;

  for (let i = 0; i < 30; i++) {
    l = preferLighter ? clamp01(l + 0.03) : clamp01(l - 0.03);
    candidate = hslToHex(h, s, l);
    if (worst(candidate) >= minRatio) return candidate;
    if ((preferLighter && l >= 0.98) || (!preferLighter && l <= 0.04)) break;
  }
  return preferLighter ? '#FFFFFF' : '#0F172A';
}

export function deriveGradientPartner(bgHex: string): string {
  const [r, g, b] = hexToRgb(bgHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s < 0.12) {
    return l > 0.5
      ? hslToHex(214, 0.38, Math.max(0.86, l - 0.09))
      : hslToHex(215, 0.32, Math.min(0.2, l + 0.08));
  }
  const shiftedH = (h + 28) % 360;
  // For dark/rich backgrounds, deepen slightly so white text stays >= 4.5:1;
  // for light backgrounds, keep airy so dark text stays >= 4.5:1.
  const shiftedL =
    l > 0.5 ? Math.max(0.82, l - 0.07) : Math.max(0.12, Math.min(0.3, l - 0.06));
  return hslToHex(shiftedH, Math.max(0.48, s * 0.94), shiftedL);
}

export type ThemePaletteInput = Pick<
  AvatarState,
  'theme' | 'bg' | 'bg2' | 'grad' | 'gradAngle' | 'ring' | 'text' | 'accent'
>;

export function resolveThemedColors(input: ThemePaletteInput): ResolvedThemeColors {
  const theme = input.theme ?? 'classic';
  const angle = input.gradAngle ?? 135;

  if (theme === 'classic') {
    return {
      bg: input.bg,
      bg2: input.bg2,
      grad: input.grad,
      gradAngle: angle,
      ring: input.ring,
      text: input.text,
      accent: input.accent,
      glow: false,
      spotlight: false,
      doubleRing: false,
    };
  }

  if (theme === 'gradient') {
    const bg2 =
      input.grad && input.bg2.toLowerCase() !== input.bg.toLowerCase()
        ? input.bg2
        : deriveGradientPartner(input.bg);
    const bgs = [input.bg, bg2];
    const [rb, gb, bb] = hexToRgb(input.bg);
    const [, , lb] = rgbToHsl(rb, gb, bb);
    const preferLighter = lb < 0.55;

    const ensureFg = (hex: string) => {
      const minC = Math.min(...bgs.map((b) => contrastRatio(hex, b)));
      if (minC >= 4.55) return hex;
      const [r, g, b] = hexToRgb(hex);
      const [h, s, l] = rgbToHsl(r, g, b);
      return tuneLightnessForContrast(h, s, l, bgs, preferLighter, 4.6);
    };

    return {
      bg: input.bg,
      bg2,
      grad: true,
      gradAngle: angle,
      ring: ensureFg(input.ring),
      text: ensureFg(input.text),
      accent: ensureFg(input.accent),
      glow: false,
      spotlight: false,
      doubleRing: false,
    };
  }

  if (theme === 'neon') {
    const { h, s } = extractDominantHue(input);
    const sat = Math.max(0.78, s);
    const bg = '#070B14';
    const bg2 = hslToHex(h, Math.min(0.65, sat), 0.12);
    const bgs = [bg, bg2];
    const neonRing = tuneLightnessForContrast(h, sat, 0.62, bgs, true, 5.5);
    const neonAccent = tuneLightnessForContrast((h + 12) % 360, sat, 0.7, bgs, true, 6.2);

    return {
      bg,
      bg2,
      grad: true,
      gradAngle: angle,
      ring: neonRing,
      text: '#FFFFFF',
      accent: neonAccent,
      glow: true,
      spotlight: false,
      doubleRing: false,
    };
  }

  if (theme === 'pastel') {
    const { h, s } = extractDominantHue(input);
    const sat = Math.max(0.42, Math.min(0.72, s));
    const bg = hslToHex(h, sat, 0.94);
    const bg2 = hslToHex((h + 24) % 360, sat, 0.89);
    const bgs = [bg, bg2];

    const ink = tuneLightnessForContrast(h, Math.min(0.75, sat + 0.15), 0.2, bgs, false, 7.5);
    const accent = tuneLightnessForContrast(h, Math.min(0.85, sat + 0.2), 0.34, bgs, false, 5.0);
    const ring = tuneLightnessForContrast(h, Math.min(0.72, sat + 0.1), 0.32, bgs, false, 5.0);

    return {
      bg,
      bg2,
      grad: true,
      gradAngle: angle,
      ring,
      text: ink,
      accent,
      glow: false,
      spotlight: false,
      doubleRing: false,
    };
  }

  if (theme === 'swiss') {
    const { h, s } = extractDominantHue(input);
    const bg = '#F8FAFC';
    const bg2 = '#EFF6FF';
    const sat = Math.max(0.55, s);
    const accent = tuneLightnessForContrast(h, sat, 0.38, [bg], false, 5.2);
    const ring = tuneLightnessForContrast(h, sat, 0.35, [bg], false, 5.2);

    return {
      bg,
      bg2,
      grad: false,
      gradAngle: angle,
      ring,
      text: '#0F172A',
      accent,
      glow: false,
      spotlight: false,
      doubleRing: true,
    };
  }

  // 'spotlight': Rich glass spotlight sheen + double inner hairline ring preserving palette
  return {
    bg: input.bg,
    bg2: input.bg2,
    grad: input.grad,
    gradAngle: angle,
    ring: input.ring,
    text: input.text,
    accent: input.accent,
    glow: false,
    spotlight: true,
    doubleRing: true,
  };
}
