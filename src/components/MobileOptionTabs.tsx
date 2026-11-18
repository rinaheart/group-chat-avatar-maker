import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Grid2x2,
  Layers,
  LayoutGrid,
  Palette,
  Shapes,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import {
  MOBILE_OPTION_TABS,
  MOBILE_STUDIO_DOCK_GROUPS,
  getAdjacentOptionTab,
  getSubTabsForTab,
  resolveDockGroupForTab,
  type MobileOptionTabId,
  type QuickNavIconKey,
  type StudioDockGroup,
} from '../utils/sectionNav';

interface MobileOptionTabsProps {
  activeTab: MobileOptionTabId;
  onSelectTab: (tab: MobileOptionTabId) => void;
  onJumpToPreview: () => void;
}

function renderTabIcon(icon: QuickNavIconKey, className = 'h-4 w-4 shrink-0') {
  switch (icon) {
    case 'eye':
      return <Eye className={className} aria-hidden="true" />;
    case 'shapes':
      return <Shapes className={className} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'palette':
      return <Palette className={className} aria-hidden="true" />;
    case 'grid':
      return <Grid2x2 className={className} aria-hidden="true" />;
    case 'type':
      return <Type className={className} aria-hidden="true" />;
    case 'smile':
      return <Smile className={className} aria-hidden="true" />;
    case 'sliders':
      return <SlidersHorizontal className={className} aria-hidden="true" />;
    case 'layers':
      return <Layers className={className} aria-hidden="true" />;
    case 'download':
      return <Download className={className} aria-hidden="true" />;
  }
}

export function MobileOptionTabs({
  activeTab,
  onSelectTab,
  onJumpToPreview,
}: MobileOptionTabsProps) {
  const workspaceHeaderRef = useRef<HTMLDivElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Close bottom sheet on Escape
  useEffect(() => {
    if (!isSheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSheetOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSheetOpen]);

  const activeDockGroup = resolveDockGroupForTab(activeTab);
  const subTabs = getSubTabsForTab(activeTab);
  const activeOptionMeta = MOBILE_OPTION_TABS.find((t) => t.id === activeTab);
  const prevTab = getAdjacentOptionTab(activeTab, -1);
  const nextTab = getAdjacentOptionTab(activeTab, 1);

  const keepWorkspaceInView = () => {
    const headerEl = workspaceHeaderRef.current;
    if (!headerEl || typeof window === 'undefined') return;
    headerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectWithFraming = (next: MobileOptionTabId) => {
    onSelectTab(next);
    window.requestAnimationFrame(keepWorkspaceInView);
  };

  const handleDockGroupClick = (group: StudioDockGroup) => {
    if (group.tabs.includes(activeTab) && group.tabs.length > 1) {
      const idx = group.tabs.indexOf(activeTab);
      const nextSub = group.tabs[(idx + 1) % group.tabs.length];
      handleSelectWithFraming(nextSub);
      return;
    }
    handleSelectWithFraming(group.defaultTab);
  };

  const handleChooseFromSheet = (tabId: MobileOptionTabId, sectionId?: string | null) => {
    onSelectTab(tabId);
    setIsSheetOpen(false);
    window.requestAnimationFrame(() => {
      if (tabId === 'all') {
        workspaceHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (sectionId && activeTab === 'all') {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        keepWorkspaceInView();
      }
    });
  };

  const activeTitle =
    activeTab === 'export'
      ? 'Xuất file & Sao chép nhanh'
      : activeTab === 'all'
        ? 'Tất cả 7 mục tùy chỉnh'
        : activeOptionMeta?.fullLabel ?? 'Tùy chỉnh';

  return (
    <>
      {/* Tier 2: Compact Contextual Workspace Header right above the active option card */}
      <div
        id="mobile-workspace-anchor"
        ref={workspaceHeaderRef}
        className="scroll-mt-[82px] flex flex-col gap-2 lg:hidden"
        data-testid="mobile-option-tabs"
      >
        <div className="flex items-center justify-between gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-2.5 py-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            data-testid="mobile-sheet-trigger"
            aria-label="Mở danh mục tất cả tùy chỉnh"
            className="inline-flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-xl px-2 text-left transition-colors hover:bg-[var(--soft)] focus-visible:outline-2 focus-visible:outline-[var(--brand)] cursor-pointer"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--soft)] text-[var(--brand)]">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[var(--fg)]">
                {activeOptionMeta
                  ? `${activeOptionMeta.stepNumber ? `${activeOptionMeta.stepNumber}. ` : ''}${activeOptionMeta.shortLabel}`
                  : activeTitle}
              </div>
              <div className="truncate text-[11px] text-[var(--muted)]">
                {activeOptionMeta?.stepNumber
                  ? `Mục ${activeOptionMeta.stepNumber}/7 · Chọn nhanh`
                  : 'Bảng chọn 7 mục'}
              </div>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            {activeTab !== 'all' && activeTab !== 'export' && (
              <>
                <button
                  type="button"
                  disabled={!prevTab}
                  onClick={() => prevTab && handleSelectWithFraming(prevTab.id)}
                  aria-label={prevTab ? `Mục trước: ${prevTab.shortLabel}` : 'Mục đầu tiên'}
                  title={prevTab ? `Trước: ${prevTab.fullLabel}` : 'Đang ở mục đầu'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--fg)] transition-colors hover:border-[var(--brand)] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={!nextTab}
                  onClick={() => nextTab && handleSelectWithFraming(nextTab.id)}
                  aria-label={nextTab ? `Mục tiếp: ${nextTab.shortLabel}` : 'Mục cuối cùng'}
                  title={nextTab ? `Tiếp: ${nextTab.fullLabel}` : 'Đang ở mục cuối'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--fg)] transition-colors hover:border-[var(--brand)] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                handleSelectWithFraming(activeTab === 'all' ? 'template' : 'all')
              }
              aria-pressed={activeTab === 'all'}
              className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border px-2.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]'
                  : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]'
              }`}
            >
              <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{activeTab === 'all' ? 'Từng mục' : 'Tất cả'}</span>
            </button>
          </div>
        </div>

        {/* Sub-dock segmented switcher when active dock group contains 2 related tools */}
        {subTabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Chọn công cụ con trong nhóm"
            data-testid="mobile-sub-tabs"
            className="grid grid-cols-2 gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-1"
          >
            {subTabs.map((sub) => {
              const isSubActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  role="tab"
                  aria-selected={isSubActive}
                  onClick={() => handleSelectWithFraming(sub.id)}
                  className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    isSubActive
                      ? 'bg-[var(--brand)] text-[var(--brand-fg)] shadow-2xs'
                      : 'text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--fg)]'
                  }`}
                >
                  {renderTabIcon(sub.icon, 'h-3.5 w-3.5 shrink-0')}
                  <span>{sub.fullLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tier 1: Fixed Bottom Studio Dock in the Natural Thumb Zone (6 tabs, 0 horizontal scroll, <= 54px height) */}
      <nav
        aria-label="Thanh công cụ chỉnh sửa nhanh"
        data-testid="mobile-studio-dock"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--card)]/95 px-1.5 py-1 backdrop-blur-md lg:hidden"
      >
        <div
          role="tablist"
          aria-label="Nhóm công cụ thiết kế"
          className="mx-auto grid max-w-[600px] grid-cols-6 gap-1"
        >
          {MOBILE_STUDIO_DOCK_GROUPS.map((group) => {
            const isActive = activeDockGroup?.id === group.id;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={group.fullLabel}
                onClick={() => handleDockGroupClick(group)}
                className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-semibold tracking-tight transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                  isActive
                    ? 'bg-[var(--brand)] text-[var(--brand-fg)] shadow-xs'
                    : 'text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--fg)]'
                }`}
              >
                {renderTabIcon(group.icon, 'h-4 w-4 shrink-0')}
                <span className="max-w-full truncate leading-none">{group.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Full 7-Section + Export Bottom Sheet for instant 1-tap overview jump */}
      {isSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chọn nhanh mục tùy chỉnh"
          data-testid="mobile-option-sheet"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[600px] rounded-t-3xl border-t border-[var(--line)] bg-[var(--card)] px-4 pt-3 pb-6 shadow-2xl"
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--line)]"
            />
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-[var(--fg)]">
                Chọn nhanh mục tùy chỉnh (1–7)
              </h2>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Đóng menu chọn mục"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--fg)] hover:border-[var(--brand)] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MOBILE_OPTION_TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleChooseFromSheet(tab.id, tab.sectionId)}
                    aria-pressed={active}
                    className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
                        : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]/60'
                    }`}
                  >
                    {renderTabIcon(
                      tab.icon,
                      `h-4 w-4 shrink-0 ${active ? 'text-[var(--brand)]' : 'text-[var(--muted)]'}`
                    )}
                    <span className="truncate">{tab.fullLabel}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleChooseFromSheet('export', 'section-export')}
                aria-pressed={activeTab === 'export'}
                className={`col-span-2 flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'export'
                    ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]/60'
                }`}
              >
                <Download className="h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <span>Xuất PNG / SVG & Sao chép vào Clipboard</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSheetOpen(false);
                onJumpToPreview();
              }}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 text-xs font-semibold text-[var(--fg)] hover:border-[var(--brand)] cursor-pointer"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              <span>Lên vùng xem trước</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
