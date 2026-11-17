export type TemplateId = 'A' | 'B' | 'C';

export type FontId =
  | 'geometric-startup'
  | 'modern-tech'
  | 'luxury-editorial'
  | 'creative-warm'
  | 'bold-impact'
  | 'friendly-round';

export type AvatarThemeId =
  | 'classic'
  | 'gradient'
  | 'neon'
  | 'pastel'
  | 'swiss'
  | 'spotlight';

export type AvatarPatternId =
  | 'none'
  | 'dots'
  | 'grid'
  | 'stripes'
  | 'rings'
  | 'cross';

export type IconCategory = 'all' | 'chat' | 'study' | 'work' | 'life';

export type LucideIconId =
  | 'messages-square'
  | 'message-circle'
  | 'message-square'
  | 'users'
  | 'user-plus'
  | 'megaphone'
  | 'bell'
  | 'at-sign'
  | 'heart-pulse'
  | 'stethoscope'
  | 'cross'
  | 'pill'
  | 'flask-conical'
  | 'microscope'
  | 'book-open'
  | 'graduation-cap'
  | 'award'
  | 'lightbulb'
  | 'code-2'
  | 'terminal'
  | 'cpu'
  | 'briefcase'
  | 'file-text'
  | 'calendar'
  | 'folder-kanban'
  | 'layers'
  | 'pen-tool'
  | 'rocket'
  | 'sparkles'
  | 'flame'
  | 'star'
  | 'heart'
  | 'coffee'
  | 'music'
  | 'headphones'
  | 'camera'
  | 'gamepad-2'
  | 'trophy'
  | 'compass'
  | 'map-pin'
  | 'globe'
  | 'sun'
  | 'moon'
  | 'leaf'
  | 'shield-check'
  | 'zap'
  | 'home'
  | 'smile';

export type IconSelection = 'none' | 'upload' | LucideIconId | (string & {});

export interface AvatarState {
  tpl: TemplateId;
  theme: AvatarThemeId;
  pattern: AvatarPatternId;
  patternOpacity: number;
  title: string;
  sub: string;
  upper: boolean;
  font: FontId;
  fit: boolean;
  icon: IconSelection;
  iconSize: number;
  iconStroke: number;
  iconOpacity: number;
  iconDy: number;
  titleSize: number;
  subSize: number;
  track: number;
  dy: number;
  bg: string;
  bg2: string;
  grad: boolean;
  gradAngle: number;
  ring: string;
  text: string;
  accent: string;
  ringOn: boolean;
  ringW: number;
  gap: number;
  img: string | null;
  imgAspect: number;
  imgCircle: boolean;
}

export interface TemplateDefaults {
  iconSize: number;
  titleSize: number;
  subSize: number;
  iconOpacity: number;
  track: number;
  iconDy: number;
  dy: number;
}

export interface FontOption {
  label: string;
  desc: string;
  titleLabel: string;
  subLabel: string;
  titleFam: string;
  titleWeight: number;
  subFam: string;
  subWeight: number;
}

export interface ColorPreset {
  n: string;
  bg: string;
  bg2?: string;
  grad?: boolean;
  ring: string;
  text: string;
  accent: string;
}

export interface AvatarThemeOption {
  id: AvatarThemeId;
  name: string;
  desc: string;
}

export interface AvatarPatternOption {
  id: AvatarPatternId;
  name: string;
  desc: string;
}

export interface ResolvedThemeColors {
  bg: string;
  bg2: string;
  grad: boolean;
  gradAngle: number;
  ring: string;
  text: string;
  accent: string;
  glow: boolean;
  spotlight: boolean;
  doubleRing: boolean;
}

export interface PreviewUiState {
  shape: 'round' | 'square';
  panel: 'light' | 'dark';
  guide: boolean;
}

export type ExportSize = 512 | 1024 | 2048;

export type ClipboardCopyKind = 'blob' | 'png-url' | 'svg-url';

export interface ContrastBadge {
  id: string;
  label: string;
  ratio: number;
  level: 'ok' | 'warn' | 'bad';
  statusText: string;
}
