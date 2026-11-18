export type NavSectionId =
  | 'section-preview'
  | 'section-template'
  | 'section-theme'
  | 'section-color'
  | 'section-patterns'
  | 'section-content'
  | 'section-icon'
  | 'section-layout'
  | 'section-export';

export type MobileOptionTabId =
  | 'template'
  | 'theme'
  | 'color'
  | 'patterns'
  | 'content'
  | 'icon'
  | 'layout'
  | 'export'
  | 'all';

export type MobileStudioDockId =
  | 'structure'
  | 'style'
  | 'color'
  | 'content'
  | 'icon'
  | 'export';

export type QuickNavIconKey =
  | 'eye'
  | 'shapes'
  | 'sparkles'
  | 'palette'
  | 'grid'
  | 'type'
  | 'smile'
  | 'sliders'
  | 'layers'
  | 'download';

export interface OptionTabItem {
  id: MobileOptionTabId;
  sectionId: NavSectionId | null;
  stepNumber: number | null;
  shortLabel: string;
  fullLabel: string;
  icon: QuickNavIconKey;
}

export interface StudioDockGroup {
  id: MobileStudioDockId;
  label: string;
  fullLabel: string;
  icon: QuickNavIconKey;
  defaultTab: MobileOptionTabId;
  tabs: readonly MobileOptionTabId[];
}

export const MOBILE_OPTION_TABS: readonly OptionTabItem[] = [
  {
    id: 'template',
    sectionId: 'section-template',
    stepNumber: 1,
    shortLabel: 'Mẫu',
    fullLabel: '1. Mẫu (Template)',
    icon: 'shapes',
  },
  {
    id: 'theme',
    sectionId: 'section-theme',
    stepNumber: 2,
    shortLabel: 'Chủ đề',
    fullLabel: '2. Chủ đề phong cách',
    icon: 'sparkles',
  },
  {
    id: 'color',
    sectionId: 'section-color',
    stepNumber: 3,
    shortLabel: 'Màu',
    fullLabel: '3. Bộ màu chi tiết',
    icon: 'palette',
  },
  {
    id: 'patterns',
    sectionId: 'section-patterns',
    stepNumber: 4,
    shortLabel: 'Họa tiết',
    fullLabel: '4. Họa tiết nền',
    icon: 'grid',
  },
  {
    id: 'content',
    sectionId: 'section-content',
    stepNumber: 5,
    shortLabel: 'Chữ & Font',
    fullLabel: '5. Nội dung & Font',
    icon: 'type',
  },
  {
    id: 'icon',
    sectionId: 'section-icon',
    stepNumber: 6,
    shortLabel: 'Icon',
    fullLabel: '6. Icon (Lucide)',
    icon: 'smile',
  },
  {
    id: 'layout',
    sectionId: 'section-layout',
    stepNumber: 7,
    shortLabel: 'Bố cục',
    fullLabel: '7. Viền & bố cục',
    icon: 'sliders',
  },
  {
    id: 'all',
    sectionId: null,
    stepNumber: null,
    shortLabel: 'Tất cả',
    fullLabel: 'Xem tất cả 7 mục',
    icon: 'layers',
  },
];

export const MOBILE_STUDIO_DOCK_GROUPS: readonly StudioDockGroup[] = [
  {
    id: 'structure',
    label: 'Mẫu',
    fullLabel: 'Mẫu & Viền bố cục',
    icon: 'shapes',
    defaultTab: 'template',
    tabs: ['template', 'layout'],
  },
  {
    id: 'style',
    label: 'Chủ đề',
    fullLabel: 'Chủ đề & Họa tiết',
    icon: 'sparkles',
    defaultTab: 'theme',
    tabs: ['theme', 'patterns'],
  },
  {
    id: 'color',
    label: 'Màu sắc',
    fullLabel: 'Bộ màu chi tiết',
    icon: 'palette',
    defaultTab: 'color',
    tabs: ['color'],
  },
  {
    id: 'content',
    label: 'Chữ',
    fullLabel: 'Nội dung & Font',
    icon: 'type',
    defaultTab: 'content',
    tabs: ['content'],
  },
  {
    id: 'icon',
    label: 'Icon',
    fullLabel: 'Icon & Logo',
    icon: 'smile',
    defaultTab: 'icon',
    tabs: ['icon'],
  },
  {
    id: 'export',
    label: 'Xuất',
    fullLabel: 'Xuất & Sao chép',
    icon: 'download',
    defaultTab: 'export',
    tabs: ['export'],
  },
];

const ORDERED_PANEL_TABS: readonly Exclude<MobileOptionTabId, 'all' | 'export'>[] = [
  'template',
  'theme',
  'color',
  'patterns',
  'content',
  'icon',
  'layout',
];

export function resolveDockGroupForTab(tab: MobileOptionTabId): StudioDockGroup | null {
  if (tab === 'all') return null;
  return (
    MOBILE_STUDIO_DOCK_GROUPS.find((group) => group.tabs.includes(tab)) ?? null
  );
}

export function getSubTabsForTab(tab: MobileOptionTabId): readonly OptionTabItem[] {
  const group = resolveDockGroupForTab(tab);
  if (!group || group.tabs.length <= 1) return [];
  return group.tabs
    .map((id) => MOBILE_OPTION_TABS.find((t) => t.id === id))
    .filter((t): t is OptionTabItem => Boolean(t));
}

export function getAdjacentOptionTab(
  current: MobileOptionTabId,
  direction: -1 | 1
): OptionTabItem | null {
  if (current === 'all' || current === 'export') return null;
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
