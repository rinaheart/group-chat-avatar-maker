export type NavSectionId =
  | 'section-preview'
  | 'section-template'
  | 'section-theme'
  | 'section-color'
  | 'section-patterns'
  | 'section-content'
  | 'section-icon'
  | 'section-layout';

export type MobileOptionTabId =
  | 'template'
  | 'theme'
  | 'color'
  | 'patterns'
  | 'content'
  | 'icon'
  | 'layout'
  | 'all';

export type QuickNavIconKey =
  | 'eye'
  | 'shapes'
  | 'sparkles'
  | 'palette'
  | 'grid'
  | 'type'
  | 'smile'
  | 'sliders'
  | 'layers';

export interface OptionTabItem {
  id: MobileOptionTabId;
  sectionId: NavSectionId | null;
  shortLabel: string;
  fullLabel: string;
  icon: QuickNavIconKey;
}

export const MOBILE_OPTION_TABS: readonly OptionTabItem[] = [
  {
    id: 'template',
    sectionId: 'section-template',
    shortLabel: 'Mẫu',
    fullLabel: '1. Mẫu (Template)',
    icon: 'shapes',
  },
  {
    id: 'theme',
    sectionId: 'section-theme',
    shortLabel: 'Chủ đề',
    fullLabel: '2. Chủ đề phong cách',
    icon: 'sparkles',
  },
  {
    id: 'color',
    sectionId: 'section-color',
    shortLabel: 'Màu',
    fullLabel: '3. Bộ màu chi tiết',
    icon: 'palette',
  },
  {
    id: 'patterns',
    sectionId: 'section-patterns',
    shortLabel: 'Họa tiết',
    fullLabel: '4. Họa tiết nền',
    icon: 'grid',
  },
  {
    id: 'content',
    sectionId: 'section-content',
    shortLabel: 'Chữ & Font',
    fullLabel: '5. Nội dung & Font',
    icon: 'type',
  },
  {
    id: 'icon',
    sectionId: 'section-icon',
    shortLabel: 'Icon',
    fullLabel: '6. Icon (Lucide)',
    icon: 'smile',
  },
  {
    id: 'layout',
    sectionId: 'section-layout',
    shortLabel: 'Bố cục',
    fullLabel: '7. Viền & bố cục',
    icon: 'sliders',
  },
  {
    id: 'all',
    sectionId: null,
    shortLabel: 'Tất cả',
    fullLabel: 'Xem tất cả 7 mục',
    icon: 'layers',
  },
];

const ORDERED_PANEL_TABS: readonly Exclude<MobileOptionTabId, 'all'>[] = [
  'template',
  'theme',
  'color',
  'patterns',
  'content',
  'icon',
  'layout',
];

export function getAdjacentOptionTab(
  current: MobileOptionTabId,
  direction: -1 | 1
): OptionTabItem | null {
  if (current === 'all') return null;
  const idx = ORDERED_PANEL_TABS.indexOf(current);
  if (idx === -1) return null;
  const targetId = ORDERED_PANEL_TABS[idx + direction];
  if (!targetId) return null;
  return MOBILE_OPTION_TABS.find((t) => t.id === targetId) ?? null;
}

export interface SectionMeasurement {
  id: NavSectionId;
  top: number;
  height: number;
}

export function pickActiveNavSection(
  measurements: readonly SectionMeasurement[],
  options: {
    anchorY?: number;
    atBottom?: boolean;
  } = {}
): NavSectionId {
  if (measurements.length === 0) return 'section-preview';

  const anchorY = options.anchorY ?? 130;
  if (options.atBottom) {
    return measurements[measurements.length - 1].id;
  }

  let active = measurements[0].id;
  for (const item of measurements) {
    if (item.top <= anchorY) {
      active = item.id;
    } else {
      break;
    }
  }
  return active;
}
