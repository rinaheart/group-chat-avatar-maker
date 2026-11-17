import {
  AtSign,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  Code2,
  Coffee,
  Compass,
  Cpu,
  Cross,
  FileText,
  Flame,
  FlaskConical,
  FolderKanban,
  Gamepad2,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  Layers,
  Leaf,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Microscope,
  Moon,
  Music,
  PenTool,
  Pill,
  Rocket,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Terminal,
  Trophy,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { IconCategory, LucideIconId } from '../types/avatar';

type IconNodeTuple = [tag: string, attrs: Record<string, string | number>];

export interface LucideIconEntry {
  id: LucideIconId;
  name: string;
  category: Exclude<IconCategory, 'all'>;
  keywords: string;
  component: LucideIcon;
  svgInner: string;
}

function escapeAttr(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractLucideSvgInner(IconComponent: LucideIcon): string {
  const renderFn = (IconComponent as unknown as {
    render?: (props: Record<string, unknown>, ref: null) => {
      props?: { iconNode?: IconNodeTuple[] };
    };
  }).render;

  if (typeof renderFn !== 'function') {
    return '';
  }

  const rendered = renderFn({}, null);
  const nodes = rendered?.props?.iconNode ?? [];

  return nodes
    .map(([tag, attrs]) => {
      const attrString = Object.entries(attrs)
        .filter(([key]) => key !== 'key')
        .map(([key, val]) => `${key}="${escapeAttr(val)}"`)
        .join(' ');
      return `<${tag} ${attrString}/>`;
    })
    .join('');
}

function defineIcon(
  id: LucideIconId,
  name: string,
  category: Exclude<IconCategory, 'all'>,
  keywords: string,
  component: LucideIcon
): LucideIconEntry {
  return {
    id,
    name,
    category,
    keywords: `${name} ${id} ${keywords}`.toLowerCase(),
    component,
    svgInner: extractLucideSvgInner(component),
  };
}

export const LUCIDE_ICON_CATEGORIES: Array<{ id: IconCategory; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'chat', label: 'Nhóm & Chat' },
  { id: 'study', label: 'Học & Y tế' },
  { id: 'work', label: 'Công việc' },
  { id: 'life', label: 'Đời sống' },
];

export const LUCIDE_ICONS: LucideIconEntry[] = [
  // Nhóm & Chat
  defineIcon('messages-square', 'Chat đôi', 'chat', 'chat group tin nhan', MessagesSquare),
  defineIcon('message-circle', 'Chat tròn', 'chat', 'chat bubble tro chuyen', MessageCircle),
  defineIcon('message-square', 'Tin nhắn', 'chat', 'message square tin nhan', MessageSquare),
  defineIcon('users', 'Nhóm', 'chat', 'group team thanh vien', Users),
  defineIcon('user-plus', 'Thêm thành viên', 'chat', 'invite member nhom', UserPlus),
  defineIcon('megaphone', 'Thông báo loa', 'chat', 'announcement loa kenh', Megaphone),
  defineIcon('bell', 'Chuông thông báo', 'chat', 'bell notify nhac nho', Bell),
  defineIcon('at-sign', 'Đề cập @', 'chat', 'mention tag email', AtSign),

  // Học tập & Y tế
  defineIcon('heart-pulse', 'Nhịp tim', 'study', 'y te suc khoe nhip tim', HeartPulse),
  defineIcon('stethoscope', 'Ống nghe', 'study', 'y khoa bac si benh vien', Stethoscope),
  defineIcon('cross', 'Chữ thập y tế', 'study', 'y te cap cuu benh vien', Cross),
  defineIcon('pill', 'Viên thuốc', 'study', 'duoc thuoc y te', Pill),
  defineIcon('flask-conical', 'Bình thí nghiệm', 'study', 'lab hoa hoc nckh', FlaskConical),
  defineIcon('microscope', 'Kính hiển vi', 'study', 'nghien cuu khoa hoc lab', Microscope),
  defineIcon('book-open', 'Sách mở', 'study', 'hoc tap doc sach tai lieu', BookOpen),
  defineIcon('graduation-cap', 'Tốt nghiệp', 'study', 'lop hoc sinh vien khoa', GraduationCap),
  defineIcon('award', 'Thành tích', 'study', 'giai thuong huy chuong', Award),
  defineIcon('lightbulb', 'Ý tưởng', 'study', 'sang tao idea den', Lightbulb),

  // Công việc & Công nghệ
  defineIcon('code-2', 'Lập trình', 'work', 'dev code tech lap trinh', Code2),
  defineIcon('terminal', 'Terminal', 'work', 'cli devops server', Terminal),
  defineIcon('cpu', 'Vi xử lý / AI', 'work', 'chip tech phan cung', Cpu),
  defineIcon('briefcase', 'Công việc', 'work', 'van phong cong ty du an', Briefcase),
  defineIcon('file-text', 'Tài liệu', 'work', 'docs van ban ghi chu', FileText),
  defineIcon('calendar', 'Lịch trình', 'work', 'event su kien deadline', Calendar),
  defineIcon('folder-kanban', 'Quản lý dự án', 'work', 'task sprint board', FolderKanban),
  defineIcon('layers', 'Thiết kế / Tầng', 'work', 'ui ux design stack', Layers),
  defineIcon('pen-tool', 'Đồ họa', 'work', 'vector thiet ke sang tao', PenTool),
  defineIcon('rocket', 'Khởi chạy', 'work', 'startup launch tang toc', Rocket),

  // Đời sống & Giải trí
  defineIcon('sparkles', 'Nổi bật', 'life', 'moi sang tao phep thuat', Sparkles),
  defineIcon('flame', 'Nhiệt huyết', 'life', 'fire hot streak', Flame),
  defineIcon('star', 'Ngôi sao', 'life', 'yeu thich top vip', Star),
  defineIcon('heart', 'Trái tim', 'life', 'gia dinh ban than yeu', Heart),
  defineIcon('coffee', 'Cà phê', 'life', 'cafe chill hop nhom', Coffee),
  defineIcon('music', 'Âm nhạc', 'life', 'nhac hat karaoke', Music),
  defineIcon('headphones', 'Podcast / Audio', 'life', 'nghe nhac voice chat', Headphones),
  defineIcon('camera', 'Nhiếp ảnh', 'life', 'chup anh ky niem', Camera),
  defineIcon('gamepad-2', 'Gaming', 'life', 'game clan esports', Gamepad2),
  defineIcon('trophy', 'Thể thao / Cup', 'life', 'giai dau bong da chay bo', Trophy),
  defineIcon('compass', 'Khám phá', 'life', 'du lich phuot travel', Compass),
  defineIcon('map-pin', 'Địa điểm', 'life', 'check in gap mat', MapPin),
  defineIcon('globe', 'Toàn cầu', 'life', 'community mang luoi', Globe),
  defineIcon('sun', 'Mặt trời', 'life', 'buoi sang nang dong', Sun),
  defineIcon('moon', 'Mặt trăng', 'life', 'ca dem chill night', Moon),
  defineIcon('leaf', 'Thiên nhiên', 'life', 'xanh moi truong cay', Leaf),
  defineIcon('shield-check', 'Bảo mật', 'life', 'admin mod tin cay', ShieldCheck),
  defineIcon('zap', 'Tia chớp', 'life', 'nhanh flash nang luong', Zap),
  defineIcon('home', 'Gia đình', 'life', 'nha phong tro chung cu', Home),
  defineIcon('smile', 'Vui vẻ', 'life', 'ban be giai tri', Smile),
];

const LUCIDE_ICON_MAP = new Map<string, LucideIconEntry>(
  LUCIDE_ICONS.map((entry) => [entry.id, entry])
);

const LEGACY_ICON_ALIASES: Record<string, LucideIconId> = {
  chat2: 'messages-square',
  chat: 'message-circle',
  msgsq: 'message-square',
  heart: 'heart-pulse',
  steth: 'stethoscope',
  flask: 'flask-conical',
  book: 'book-open',
  cap: 'graduation-cap',
  bulb: 'lightbulb',
  file: 'file-text',
  cal: 'calendar',
  code: 'code-2',
};

export function normalizeIconId(iconId: string): string {
  if (iconId === 'none' || iconId === 'upload') return iconId;
  if (LUCIDE_ICON_MAP.has(iconId)) return iconId;
  return LEGACY_ICON_ALIASES[iconId] ?? 'messages-square';
}

export function resolveLucideIcon(iconId: string): LucideIconEntry | null {
  if (iconId === 'none' || iconId === 'upload') return null;
  const normalized = normalizeIconId(iconId);
  return LUCIDE_ICON_MAP.get(normalized) ?? null;
}
