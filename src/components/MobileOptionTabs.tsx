import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Eye,
  Grid2x2,
  Layers,
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
  type MobileOptionTabId,
  type QuickNavIconKey,
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
  }
}

export function MobileOptionTabs({
  activeTab,
  onSelectTab,
  onJumpToPreview,
}: MobileOptionTabsProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [isBarScrolledPast, setIsBarScrolledPast] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Observe whether the inline tab bar has scrolled above the viewport
  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBarScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep active tab centered horizontally inside the scroll strip
  useEffect(() => {
    const btn = tabRefs.current[activeTab];
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  // Close bottom sheet on Escape
  useEffect(() => {
    if (!isSheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSheetOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSheetOpen]);

  const activeMeta = MOBILE_OPTION_TABS.find((t) => t.id === activeTab);

  const handleChooseFromSheet = (tab: (typeof MOBILE_OPTION_TABS)[number]) => {
    onSelectTab(tab.id);
    setIsSheetOpen(false);
    window.requestAnimationFrame(() => {
      if (tab.id === 'all') {
        barRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tab.sectionId) {
        document.getElementById(tab.sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  return (
    <>
      <div
        ref={barRef}
        className="scroll-mt-24 lg:hidden"
        data-testid="mobile-option-tabs"
      >
        <div
          role="tablist"
          aria-label="Chọn mục tùy chỉnh"
          className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--card)] p-1.5"
        >
          {MOBILE_OPTION_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                  active
                    ? 'bg-[var(--brand)] text-[var(--brand-fg)] shadow-xs'
                    : 'text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--fg)]'
                }`}
              >
                {renderTabIcon(tab.icon, 'h-3.5 w-3.5 shrink-0')}
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zero-column-loss thumb-zone floating trigger when inline tab bar scrolls out of view */}
      {isBarScrolledPast && !isSheetOpen && (
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          data-testid="mobile-sheet-trigger"
          aria-label="Mở menu chọn nhanh mục tùy chỉnh"
          className="fixed right-4 bottom-[76px] z-35 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--card)]/92 px-3.5 text-xs font-semibold text-[var(--fg)] shadow-lg backdrop-blur-md transition-transform active:scale-95 hover:border-[var(--brand)] lg:hidden cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
          <span>{activeMeta?.shortLabel ?? 'Mục'}</span>
        </button>
      )}

      {/* Ergonomic mobile bottom sheet for 1-tap switching from anywhere */}
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
                Chọn nhanh mục tùy chỉnh
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
                    onClick={() => handleChooseFromSheet(tab)}
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
