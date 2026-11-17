import type {
  AvatarPatternId,
  AvatarPatternOption,
  AvatarState,
  AvatarThemeId,
  AvatarThemeOption,
  ColorPreset,
  FontId,
  FontOption,
  TemplateDefaults,
  TemplateId,
} from '../types/avatar';

export const STORAGE_KEY = 'avatarMaker.v2';

/**
 * Curated Google Fonts logo pairings with full Vietnamese diacritic support.
 */
export const FONTS: Record<FontId, FontOption> = {
  'geometric-startup': {
    label: 'Montserrat × Inter (Hiện đại & Startup)',
    desc: 'Hình học sắc nét, cân đối cho mọi kích thước nhỏ',
    titleLabel: 'Montserrat',
    subLabel: 'Inter',
    titleFam: "'Montserrat','Plus Jakarta Sans',sans-serif",
    titleWeight: 800,
    subFam: "'Inter','Be Vietnam Pro',sans-serif",
    subWeight: 600,
  },
  'modern-tech': {
    label: 'Space Grotesk × Be Vietnam Pro (Công nghệ)',
    desc: 'Phong cách tech hiện đại, dấu tiếng Việt chuẩn',
    titleLabel: 'Space Grotesk',
    subLabel: 'Be Vietnam Pro',
    titleFam: "'Space Grotesk','Plus Jakarta Sans',sans-serif",
    titleWeight: 700,
    subFam: "'Be Vietnam Pro','Inter',sans-serif",
    subWeight: 600,
  },
  'luxury-editorial': {
    label: 'Playfair Display × Be Vietnam Pro (Thanh lịch)',
    desc: 'Serif sang trọng kết hợp sans tối giản',
    titleLabel: 'Playfair Display',
    subLabel: 'Be Vietnam Pro',
    titleFam: "'Playfair Display','Fraunces',Georgia,serif",
    titleWeight: 700,
    subFam: "'Be Vietnam Pro','Inter',sans-serif",
    subWeight: 600,
  },
  'creative-warm': {
    label: 'Fraunces × Manrope (Sáng tạo & Ấm áp)',
    desc: 'Đường nét mềm mại cho cộng đồng, CLB, studio',
    titleLabel: 'Fraunces',
    subLabel: 'Manrope',
    titleFam: "'Fraunces',Georgia,serif",
    titleWeight: 700,
    subFam: "'Manrope','Plus Jakarta Sans',sans-serif",
    subWeight: 600,
  },
  'bold-impact': {
    label: 'Oswald × Roboto (Mạnh mẽ & Thể thao)',
    desc: 'Cô đặc nổi bật cho nhóm sự kiện, gaming, team',
    titleLabel: 'Oswald',
    subLabel: 'Roboto',
    titleFam: "'Oswald','Plus Jakarta Sans',sans-serif",
    titleWeight: 700,
    subFam: "'Roboto','Inter',sans-serif",
    subWeight: 500,
  },
  'friendly-round': {
    label: 'Bricolage Grotesque × Plus Jakarta Sans (Trẻ trung)',
    desc: 'Phá cách, thân thiện cho hội nhóm sáng tạo',
    titleLabel: 'Bricolage Grotesque',
    subLabel: 'Plus Jakarta Sans',
    titleFam: "'Bricolage Grotesque','Plus Jakarta Sans',sans-serif",
    titleWeight: 800,
    subFam: "'Plus Jakarta Sans','Inter',sans-serif",
    subWeight: 600,
  },
};

const LEGACY_FONT_MAP: Record<string, FontId> = {
  wide: 'geometric-startup',
  cond: 'bold-impact',
  sans: 'modern-tech',
  serif: 'luxury-editorial',
  round: 'friendly-round',
};

export function normalizeFontId(id: string | undefined | null): FontId {
  if (!id) return 'geometric-startup';
  if (id in FONTS) return id as FontId;
  return LEGACY_FONT_MAP[id] ?? 'geometric-startup';
}

export const TEMPLATES: Record<TemplateId, string> = {
  A: 'Biểu tượng + tên',
  B: 'Chữ lớn',
  C: 'Huy hiệu',
};

export const TEMPLATE_DEFAULTS: Record<TemplateId, TemplateDefaults> = {
  A: { iconSize: 220, titleSize: 220, subSize: 82, iconOpacity: 1, track: 4, iconDy: 0, dy: -6 },
  B: { iconSize: 540, titleSize: 270, subSize: 88, iconOpacity: 0.14, track: 3, iconDy: 0, dy: 0 },
  C: { iconSize: 280, titleSize: 100, subSize: 76, iconOpacity: 1, track: 8, iconDy: 0, dy: 0 },
};

/**
 * Curated high-contrast color palettes.
 * Every preset guarantees WCAG AA (>= 4.5:1) contrast for text, accent, and ring
 * against both primary and gradient secondary backgrounds for small chat avatars.
 */
export const PRESETS: ColorPreset[] = [
  { n: 'Xanh KTYH', bg: '#0049AC', ring: '#FFFFFF', text: '#FFFFFF', accent: '#7CE8EE' },
  { n: 'Xanh ngọc', bg: '#0F6B63', ring: '#FFFFFF', text: '#FFFFFF', accent: '#B2F5EA' },
  { n: 'Navy – vàng', bg: '#0F2A4A', ring: '#F5C542', text: '#FFFFFF', accent: '#F5C542' },
  { n: 'Đỏ đô', bg: '#7F1D1D', ring: '#FDE68A', text: '#FFF7ED', accent: '#FCD34D' },
  { n: 'Lá xanh', bg: '#166534', ring: '#FFFFFF', text: '#FFFFFF', accent: '#BBF7D0' },
  { n: 'Tím', bg: '#4C1D95', ring: '#FFFFFF', text: '#FFFFFF', accent: '#DDD6FE' },
  { n: 'Cam đất', bg: '#9A3412', ring: '#FFFFFF', text: '#FFFFFF', accent: '#FFEDD5' },
  { n: 'Hồng mận', bg: '#9D174D', ring: '#FFFFFF', text: '#FFFFFF', accent: '#FCE7F3' },
  { n: 'Trắng – xanh', bg: '#FFFFFF', ring: '#0049AC', text: '#0049AC', accent: '#0369A1' },
  { n: 'Đen – cyan', bg: '#111827', ring: '#22D3EE', text: '#FFFFFF', accent: '#22D3EE' },
  {
    n: 'Hoàng hôn',
    bg: '#6D28D9',
    bg2: '#9D174D',
    grad: true,
    ring: '#FFFFFF',
    text: '#FFFFFF',
    accent: '#FEF08A',
  },
  {
    n: 'Đại dương',
    bg: '#1E3A8A',
    bg2: '#0E7490',
    grad: true,
    ring: '#FFFFFF',
    text: '#FFFFFF',
    accent: '#CFFAFE',
  },
];

/**
 * Orthogonal style themes that stack on top of ANY selected Color Preset or custom color palette.
 */
export const AVATAR_THEMES: AvatarThemeOption[] = [
  {
    id: 'classic',
    name: 'Classic Corporate',
    desc: 'Giữ nguyên bộ màu gốc, sạch và chuẩn mực',
  },
  {
    id: 'gradient',
    name: 'Gradient Mesh',
    desc: 'Tự phối chuyển sắc từ màu gốc đang chọn',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    desc: 'Nền tối sâu + viền & icon phát sáng theo màu',
  },
  {
    id: 'pastel',
    name: 'Soft Pastel',
    desc: 'Biến tấu tông phấn dịu nhẹ, chữ đậm dễ đọc',
  },
  {
    id: 'swiss',
    name: 'Swiss Minimal',
    desc: 'Nền sáng tối giản + viền kép giữ màu nhấn',
  },
  {
    id: 'spotlight',
    name: 'Glass Spotlight',
    desc: 'Ánh sáng kính mờ + viền kép chiều sâu',
  },
];

export function normalizeThemeId(id: string | undefined | null): AvatarThemeId {
  if (!id) return 'classic';
  if (AVATAR_THEMES.some((t) => t.id === id)) return id as AvatarThemeId;
  if (id === 'classic-corporate') return 'classic';
  if (id === 'sunset-gradient' || id === 'emerald-tech') return 'gradient';
  if (id === 'monochrome') return 'swiss';
  return 'classic';
}

export const AVATAR_PATTERNS: AvatarPatternOption[] = [
  { id: 'none', name: 'Trơn', desc: 'Không họa tiết' },
  { id: 'dots', name: 'Chấm bi', desc: 'Lưới chấm đều nhẹ' },
  { id: 'grid', name: 'Ô lưới', desc: 'Lưới mảnh tối giản' },
  { id: 'stripes', name: 'Sọc chéo', desc: 'Sọc 45° hiện đại' },
  { id: 'rings', name: 'Đồng tâm', desc: 'Vòng tròn lan tỏa' },
  { id: 'cross', name: 'Dấu cộng', desc: 'Họa tiết kỹ thuật' },
];

export function normalizePatternId(id: string | undefined | null): AvatarPatternId {
  if (!id) return 'none';
  if (AVATAR_PATTERNS.some((p) => p.id === id)) return id as AvatarPatternId;
  return 'none';
}

export function createDefaultState(): AvatarState {
  return {
    tpl: 'A',
    theme: 'classic',
    pattern: 'none',
    patternOpacity: 0.12,
    title: 'NCKH',
    sub: 'KHOA KTYH',
    upper: true,
    font: 'geometric-startup',
    fit: true,
    icon: 'messages-square',
    iconStroke: 1.85,
    bg: '#0049AC',
    bg2: '#0E7490',
    grad: false,
    gradAngle: 135,
    ring: '#FFFFFF',
    text: '#FFFFFF',
    accent: '#7CE8EE',
    ringOn: true,
    ringW: 18,
    gap: 0.9,
    img: null,
    imgAspect: 1,
    imgCircle: false,
    ...TEMPLATE_DEFAULTS.A,
  };
}
