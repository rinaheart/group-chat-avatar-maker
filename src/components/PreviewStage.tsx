import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Moon, Pin, PinOff, Square, Sun } from 'lucide-react';
import type {
  AvatarState,
  ClipboardCopyKind,
  ExportSize,
  PreviewUiState,
} from '../types/avatar';
import { buildSVG } from '../utils/svgEngine';
import { ExportCard } from './ExportCard';

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
      className="flex scroll-mt-20 flex-col gap-3 lg:sticky lg:top-3 lg:scroll-mt-4"
    >
      {/* Mobile pinned mini-preview strip when scrolled past the preview card */}
      {isMobilePinned && isMiniScrolledPast && (
        <div
          data-testid="mobile-pinned-preview"
          role="region"
          aria-label="Thanh xem trước thu gọn đang ghim"
          className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[var(--card)]/92 px-3 py-2 shadow-sm backdrop-blur-md lg:hidden"
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
        data-testid="preview-panel"
        data-panel={ui.panel}
        className={`rounded-2xl p-[5%] transition-colors duration-150 lg:p-[6%] ${
          ui.panel === 'dark' ? 'bg-[var(--panel-d)]' : 'bg-[var(--panel-l)]'
        }`}
      >
        <div className="relative mx-auto aspect-square w-full max-w-[232px] sm:max-w-[320px] lg:max-w-none">
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

      {/* Stage Preview Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Hình dạng xem trước"
          className="inline-flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => onUiChange({ shape: 'round' })}
            aria-pressed={ui.shape === 'round'}
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:text-sm ${
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:text-sm ${
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
          className="inline-flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => onUiChange({ panel: 'light' })}
            aria-pressed={ui.panel === 'light'}
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:px-3 sm:text-sm ${
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer sm:px-3 sm:text-sm ${
              ui.panel === 'dark'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tối</span>
          </button>
        </div>

        <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-xl px-1.5 text-xs text-[var(--fg)] sm:text-sm">
          <input
            type="checkbox"
            checked={ui.guide}
            onChange={(e) => onUiChange({ guide: e.target.checked })}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span className="whitespace-nowrap">Vùng an toàn</span>
        </label>
      </div>

      {/* Real Chat List Size Check (Messenger / Zalo / Telegram sizes) */}
      <div
        ref={miniCardRef}
        className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4"
      >
        <div className="mb-2 flex items-center justify-between gap-2 lg:hidden">
          <span className="text-xs font-medium text-[var(--muted)]">Xem nhanh cỡ chat</span>
          <button
            type="button"
            onClick={onToggleMobilePin}
            aria-pressed={isMobilePinned}
            aria-label={
              isMobilePinned ? 'Đang ghim vùng xem trước khi cuộn' : 'Ghim vùng xem trước khi cuộn'
            }
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              isMobilePinned
                ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
                : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]'
            }`}
          >
            <Pin
              className={`h-3.5 w-3.5 ${isMobilePinned ? 'text-[var(--brand)]' : ''}`}
              aria-hidden="true"
            />
            <span>{isMobilePinned ? 'Đang ghim khi cuộn' : 'Ghim xem trước'}</span>
          </button>
        </div>

        <div className="flex items-end justify-center gap-4 py-1 sm:gap-5">
          {miniSvgs.map(({ px, svg }) => (
            <figure key={px} className="m-0 text-center text-xs text-[var(--muted)]">
              <div
                aria-hidden="true"
                style={{ width: `${px}px`, height: `${px}px` }}
                className="mx-auto mb-1.5 overflow-hidden rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.28)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <figcaption className="tabular-nums">{px} px</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-[var(--line)] pt-3">
          <div
            aria-hidden="true"
            className="h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xs [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: chatPreviewAvatar }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold text-[var(--fg)]">
                {displayGroupName}
                {displaySub ? ` · ${displaySub}` : ''}
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-[var(--muted)]">12:30</span>
            </div>
            <p className="truncate text-xs text-[var(--muted)]">
              Xem thử hiển thị thực tế 40 px trong danh sách chat
            </p>
          </div>
        </div>
      </div>

      {/* Desktop sticky export card (mobile shows ExportCard cleanly after customization controls) */}
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
    </section>
  );
}
