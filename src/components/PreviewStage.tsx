import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Maximize2, Moon, Pin, PinOff, Square, Sun } from 'lucide-react';
import type {
  AvatarState,
  ClipboardCopyKind,
  ExportSize,
  PreviewUiState,
} from '../types/avatar';
import { buildSVG } from '../utils/svgEngine';
import { ExportCard } from './ExportCard';
import { PreviewFullscreenModal } from './PreviewFullscreenModal';

interface PreviewStageProps {
  state: AvatarState;
  ui: PreviewUiState;
  exportSize: ExportSize;
  isExporting: boolean;
  isCopying: boolean;
  copiedKind: ClipboardCopyKind | null;
  isMobilePinned: boolean;
  onUiChange: (patch: Partial<PreviewUiState>) => void;
  onExportSizeChange: (size: ExportSize) => void;
  onExportPng: (round: boolean) => void;
  onExportSvg: () => void;
  onCopyImage: () => void;
  onCopyDataUrl: (format: 'png' | 'svg') => void;
  onToggleMobilePin: () => void;
}

const PREVIEW_SIZES = [64, 48, 40, 32] as const;

export function PreviewStage({
  state,
  ui,
  exportSize,
  isExporting,
  isCopying,
  copiedKind,
  isMobilePinned,
  onUiChange,
  onExportSizeChange,
  onExportPng,
  onExportSvg,
  onCopyImage,
  onCopyDataUrl,
  onToggleMobilePin,
}: PreviewStageProps) {
  const miniCardRef = useRef<HTMLDivElement>(null);
  const [isMiniScrolledPast, setIsMiniScrolledPast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const el = miniCardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMiniScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mainSvg = useMemo(() => buildSVG(state, { pre: 'm' }), [state]);
  const fullscreenSvg = useMemo(
    () => (isFullscreen ? buildSVG(state, { pre: 'fs' }) : ''),
    [isFullscreen, state]
  );
  const miniSvgs = useMemo(
    () =>
      PREVIEW_SIZES.map((px) => ({
        px,
        svg: buildSVG(state, { pre: `s${px}` }),
      })),
    [state]
  );

  const chatPreviewAvatar = miniSvgs.find((s) => s.px === 40)?.svg ?? mainSvg;
  const displayGroupName = (state.upper ? state.title.toUpperCase() : state.title) || 'Nhóm chat';
  const displaySub = state.upper ? state.sub.toUpperCase() : state.sub;

  return (
    <section
      id="section-preview"
      aria-label="Xem trước và xuất file"
      className="flex scroll-mt-20 flex-col gap-2.5 lg:sticky lg:top-3 lg:scroll-mt-4 lg:gap-3"
    >
      {/* Mobile pinned mini-preview strip when scrolled past the preview card */}
      {isMobilePinned && isMiniScrolledPast && (
        <div
          data-testid="mobile-pinned-preview"
          role="region"
          aria-label="Thanh xem trước thu gọn đang ghim"
          className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[var(--card)]/92 px-3 py-1 shadow-sm backdrop-blur-md lg:hidden"
        >
          <div className="relative mx-auto flex max-w-[600px] items-center justify-center">
            <div className="flex items-end justify-center gap-3">
              {miniSvgs.map(({ px, svg }) => (
                <div
                  key={px}
                  aria-hidden="true"
                  style={{ width: `${px}px`, height: `${px}px` }}
                  className="shrink-0 overflow-hidden rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.28)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onToggleMobilePin}
              aria-label="Bỏ ghim vùng xem trước"
              title="Bỏ ghim"
              className="absolute top-0 right-0 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)]/90 text-[var(--fg)] transition-colors hover:border-[var(--brand)] cursor-pointer"
            >
              <PinOff className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main 1:1 Avatar Preview Stage */}
      <div
        ref={miniCardRef}
        data-testid="preview-panel"
        data-panel={ui.panel}
        className={`relative rounded-2xl p-3 transition-colors duration-150 sm:p-4 lg:p-[6%] ${
          ui.panel === 'dark' ? 'bg-[var(--panel-d)]' : 'bg-[var(--panel-l)]'
        }`}
      >
        {/* Top-left Mobile Pin Toggle Button (symmetrical with Fullscreen button on top-right) */}
        <button
          type="button"
          onClick={onToggleMobilePin}
          aria-pressed={isMobilePinned}
          aria-label={
            isMobilePinned ? 'Đang ghim vùng xem trước khi cuộn' : 'Ghim vùng xem trước khi cuộn'
          }
          title={isMobilePinned ? 'Đang ghim khi cuộn (chạm để tắt)' : 'Ghim xem trước khi cuộn'}
          data-testid="mobile-pin-toggle-btn"
          className={`absolute top-2.5 left-2.5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-xs backdrop-blur-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] lg:hidden cursor-pointer ${
            isMobilePinned
              ? 'border-[var(--brand)] bg-[var(--soft)]/95 text-[var(--brand)]'
              : 'border-[var(--line)] bg-[var(--card)]/90 text-[var(--fg)] hover:border-[var(--brand)]'
          }`}
        >
          <Pin className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Top-right Fullscreen Expand Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          aria-label="Mở rộng xem trước avatar toàn màn hình"
          title="Mở rộng xem chi tiết"
          data-testid="preview-fullscreen-btn"
          className="absolute top-2.5 right-2.5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)]/90 text-[var(--fg)] shadow-xs backdrop-blur-xs transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative mx-auto aspect-square w-full max-w-[156px] sm:max-w-[248px] lg:max-w-none">
          <div
            data-testid="avatar-preview"
            data-shape={ui.shape}
            role="img"
            aria-label={`Xem trước avatar nhóm ${displayGroupName}`}
            className={`h-full w-full overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.22)] transition-[border-radius] duration-150 [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${
              ui.shape === 'square' ? 'rounded-none' : 'rounded-full'
            }`}
            dangerouslySetInnerHTML={{ __html: mainSvg }}
          />
          {ui.guide && (
            <div
              data-testid="safe-zone-guide"
              aria-hidden="true"
              className="pointer-events-none absolute inset-[10%] rounded-full border-2 border-dashed border-white mix-blend-difference"
            />
          )}
        </div>
      </div>

      {/* Stage Preview Controls — 1 single row on 390px mobile with 0px overflow */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <div
          role="group"
          aria-label="Hình dạng xem trước"
          className="inline-flex shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => onUiChange({ shape: 'round' })}
            aria-pressed={ui.shape === 'round'}
            className={`inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:gap-1.5 sm:px-3 sm:text-sm ${
              ui.shape === 'round'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Circle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tròn</span>
          </button>
          <button
            type="button"
            onClick={() => onUiChange({ shape: 'square' })}
            aria-pressed={ui.shape === 'square'}
            className={`inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:gap-1.5 sm:px-3 sm:text-sm ${
              ui.shape === 'square'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Vuông</span>
          </button>
        </div>

        <div
          role="group"
          aria-label="Màu nền xem trước"
          className="inline-flex shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => onUiChange({ panel: 'light' })}
            aria-pressed={ui.panel === 'light'}
            className={`inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:gap-1.5 sm:px-3 sm:text-sm ${
              ui.panel === 'light'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sáng</span>
          </button>
          <button
            type="button"
            onClick={() => onUiChange({ panel: 'dark' })}
            aria-pressed={ui.panel === 'dark'}
            className={`inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:gap-1.5 sm:px-3 sm:text-sm ${
              ui.panel === 'dark'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tối</span>
          </button>
        </div>

        <label className="inline-flex min-h-[44px] shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card)] px-2 text-xs font-medium text-[var(--fg)] sm:px-2.5 sm:text-sm">
          <input
            type="checkbox"
            checked={ui.guide}
            onChange={(e) => onUiChange({ guide: e.target.checked })}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span className="whitespace-nowrap sm:hidden">An toàn</span>
          <span className="hidden whitespace-nowrap sm:inline">Vùng an toàn</span>
        </label>
      </div>

      {/* Real Chat List Size Check (Messenger / Zalo / Telegram sizes) */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-2.5 sm:p-4">
        <div className="flex items-end justify-center gap-4 py-0.5 sm:gap-5">
          {miniSvgs.map(({ px, svg }) => (
            <figure key={px} className="m-0 text-center text-[11px] text-[var(--muted)] sm:text-xs">
              <div
                aria-hidden="true"
                style={{ width: `${px}px`, height: `${px}px` }}
                className="mx-auto mb-1 overflow-hidden rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.28)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <figcaption className="tabular-nums">{px} px</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2.5 border-t border-[var(--line)] pt-2 sm:mt-3 sm:gap-3 sm:pt-3">
          <div
            aria-hidden="true"
            className="h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-xs sm:h-10 sm:w-10 [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: chatPreviewAvatar }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-xs font-semibold text-[var(--fg)] sm:text-sm">
                {displayGroupName}
                {displaySub ? ` · ${displaySub}` : ''}
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-[var(--muted)]">12:30</span>
            </div>
            <p className="truncate text-[11px] text-[var(--muted)] sm:text-xs">
              Xem thử hiển thị thực tế 40 px trong danh sách chat
            </p>
          </div>
        </div>
      </div>

      {/* Desktop sticky export card (mobile shows ExportCard via the Studio Dock 'Xuất' tab or 'Tất cả' mode) */}
      <div className="hidden lg:block">
        <ExportCard
          shape={ui.shape}
          exportSize={exportSize}
          isExporting={isExporting}
          isCopying={isCopying}
          copiedKind={copiedKind}
          onExportSizeChange={onExportSizeChange}
          onExportPng={onExportPng}
          onExportSvg={onExportSvg}
          onCopyImage={onCopyImage}
          onCopyDataUrl={onCopyDataUrl}
        />
      </div>

      <PreviewFullscreenModal
        isOpen={isFullscreen}
        svg={fullscreenSvg}
        groupName={displayGroupName}
        ui={ui}
        onUiChange={onUiChange}
        onClose={() => setIsFullscreen(false)}
      />
    </section>
  );
}
