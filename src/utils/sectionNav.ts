export type NavSectionId =
  | 'section-preview'
  | 'section-template'
  | 'section-theme'
  | 'section-color'
  | 'section-patterns'
  | 'section-content'
  | 'section-icon'
  | 'section-layout';

export type QuickNavIconKey =
  | 'eye'
  | 'shapes'
  | 'sparkles'
  | 'palette'
  | 'grid'
  | 'type'
  | 'smile'
  | 'sliders';

export interface QuickNavItem {
  id: NavSectionId;
  shortLabel: string;
  ariaLabel: string;
  icon: QuickNavIconKey;
}

export const MOBILE_QUICK_NAV_ITEMS: readonly QuickNavItem[] = [
  {
    id: 'section-preview',
    shortLabel: 'Xem',
    ariaLabel: 'Đi tới vùng xem trước',
    icon: 'eye',
  },
  {
    id: 'section-template',
    shortLabel: 'Mẫu',
    ariaLabel: 'Đi tới 1. Mẫu (Template)',
    icon: 'shapes',
  },
  {
    id: 'section-theme',
    shortLabel: 'Chủ đề',
    ariaLabel: 'Đi tới 2. Chủ đề phong cách',
    icon: 'sparkles',
  },
  {
    id: 'section-color',
    shortLabel: 'Màu',
    ariaLabel: 'Đi tới 3. Bộ màu chi tiết',
    icon: 'palette',
  },
  {
    id: 'section-patterns',
    shortLabel: 'Nền',
    ariaLabel: 'Đi tới 4. Họa tiết nền',
    icon: 'grid',
  },
  {
    id: 'section-content',
    shortLabel: 'Chữ',
    ariaLabel: 'Đi tới 5. Nội dung',
    icon: 'type',
  },
  {
    id: 'section-icon',
    shortLabel: 'Icon',
    ariaLabel: 'Đi tới 6. Icon (Lucide)',
    icon: 'smile',
  },
  {
    id: 'section-layout',
    shortLabel: 'Bố cục',
    ariaLabel: 'Đi tới 7. Viền & bố cục',
    icon: 'sliders',
  },
];

export interface SectionMeasurement {
  id: NavSectionId;
  top: number;
  height: number;
}

/**
 * Resolves the active navigation section from current viewport-relative bounding boxes.
 * Picks the last section whose top has crossed or sits near the anchor line (anchorY),
 * or falls back to the last section when scrolled to the bottom of the page.
 */
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
