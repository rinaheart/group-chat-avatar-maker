import {
  AVATAR_PATTERNS,
  AVATAR_THEMES,
  FONTS,
  PRESETS,
  TEMPLATE_DEFAULTS,
} from '../data/avatarConstants';
import { LUCIDE_ICONS } from '../data/lucideIcons';
import type { AvatarState, FontId, TemplateId } from '../types/avatar';

function pickFrom<T>(items: readonly T[], rng: () => number): T {
  const idx = Math.min(items.length - 1, Math.max(0, Math.floor(rng() * items.length)));
  return items[idx];
}

function pickDifferent<T>(
  items: readonly T[],
  isSame: (item: T) => boolean,
  rng: () => number
): T {
  const filtered = items.filter((item) => !isSame(item));
  const pool = filtered.length > 0 ? filtered : items;
  return pickFrom(pool, rng);
}

const TEMPLATE_IDS: readonly TemplateId[] = ['A', 'B', 'C'];
const FONT_IDS = Object.keys(FONTS) as FontId[];
const NON_EMPTY_PATTERNS = AVATAR_PATTERNS.filter((p) => p.id !== 'none');

/**
 * Generates an inspired, high-contrast random combination of template, theme,
 * color palette, subtle background pattern, Lucide icon, and Google Fonts pairing,
 * while preserving the user's title and subtitle text.
 */
export function createRandomizedState(
  current: AvatarState,
  rng: () => number = Math.random
): AvatarState {
  const tpl = pickFrom(TEMPLATE_IDS, rng);
  const themeObj = pickFrom(AVATAR_THEMES, rng);
  const preset = pickDifferent(
    PRESETS,
    (p) => p.bg.toLowerCase() === current.bg.toLowerCase(),
    rng
  );
  const font = pickDifferent(FONT_IDS, (f) => f === current.font, rng);
  const iconEntry = pickDifferent(LUCIDE_ICONS, (ic) => ic.id === current.icon, rng);

  // 85% chance of picking a subtle pattern to showcase visual depth; 15% clean solid/gradient
  const usePattern = rng() < 0.85;
  const patternObj = usePattern ? pickFrom(NON_EMPTY_PATTERNS, rng) : AVATAR_PATTERNS[0];
  const patternOpacity = Number((0.08 + rng() * 0.1).toFixed(2));

  return {
    ...current,
    ...TEMPLATE_DEFAULTS[tpl],
    tpl,
    theme: themeObj.id,
    bg: preset.bg,
    bg2: preset.bg2 ?? preset.bg,
    grad: Boolean(preset.grad),
    ring: preset.ring,
    text: preset.text,
    accent: preset.accent,
    font,
    icon: iconEntry.id,
    pattern: patternObj.id,
    patternOpacity,
  };
}
