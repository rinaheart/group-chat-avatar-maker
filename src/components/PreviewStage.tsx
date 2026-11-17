import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Circle,
  Copy,
  Download,
  FileCode2,
  Moon,
  Pin,
  PinOff,
  Square,
  Sun,
} from 'lucide-react';
import type {
  AvatarState,
  ClipboardCopyKind,
  ExportSize,
  PreviewUiState,
} from '../types/avatar';
import { buildSVG } from '../utils/svgEngine';

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
        className={`rounded-2xl p-[6%] transition-colors duration-150 ${
          ui.panel === 'dark' ? 'bg-[var(--panel-d)]' : 'bg-[var(--panel-l)]'
        }`}
      >
        <div className="relative mx-auto aspect-square w-full max-w-[360px] lg:max-w-none">
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              ui.panel === 'light'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Nền sáng</span>
          </button>
          <button
            type="button"
            onClick={() => onUiChange({ panel: 'dark' })}
            aria-pressed={ui.panel === 'dark'}
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              ui.panel === 'dark'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Nền tối</span>
          </button>
        </div>

        <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-xl px-1.5 text-sm text-[var(--fg)]">
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
            aria-label={isMobilePinned ? 'Đang ghim vùng xem trước khi cuộn' : 'Ghim vùng xem trước khi cuộn'}
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
              <span className="shrink-0 text-[11px] tabular-nums text-[var(--muted)]">
                12:30
              </span>
            </div>
            <p className="truncate text-xs text-[var(--muted)]">
              Xem thử hiển thị thực tế 40 px trong danh sách chat
            </p>
          </div>
        </div>
      </div>

      {/* Export Controls */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="export-size-select" className="text-sm font-medium text-[var(--fg)]">
            Cỡ xuất ảnh
          </label>
          <div className="flex items-center gap-1.5">
            <select
              id="export-size-select"
              value={exportSize}
              onChange={(e) => onExportSizeChange(Number(e.target.value) as ExportSize)}
              className="min-h-[44px] rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 text-sm font-medium tabular-nums text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
            >
              <option value={512}>512</option>
              <option value={1024}>1024</option>
              <option value={2048}>2048</option>
            </select>
            <span className="text-sm text-[var(--muted)]">px</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExportPng(false)}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-fg)] transition-opacity hover:opacity-95 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap cursor-pointer"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Tải PNG vuông</span>
          </button>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExportPng(true)}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3.5 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--brand)] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap cursor-pointer"
            >
              <Circle className="h-4 w-4" aria-hidden="true" />
              <span>PNG tròn (trong suốt)</span>
            </button>

            <button
              type="button"
              onClick={onExportSvg}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3.5 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap cursor-pointer"
            >
              <FileCode2 className="h-4 w-4" aria-hidden="true" />
              <span>Tải SVG</span>
            </button>
          </div>
        </div>

        <div className="mt-3 border-t border-[var(--line)] pt-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted)]">
            Sao chép vào clipboard (dán nhanh vào app chat)
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isCopying || isExporting}
              onClick={onCopyImage}
              aria-label={`Sao chép ảnh PNG ${ui.shape === 'round' ? 'tròn' : 'vuông'} vào clipboard`}
              className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap cursor-pointer ${
                copiedKind === 'blob'
                  ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
                  : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]'
              }`}
            >
              {copiedKind === 'blob' ? (
                <Check className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {copiedKind === 'blob'
                  ? 'Đã sao chép ảnh'
                  : `Sao chép ảnh (${ui.shape === 'round' ? 'tròn' : 'vuông'})`}
              </span>
            </button>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={isCopying || isExporting}
                onClick={() => onCopyDataUrl('png')}
                aria-label="Sao chép Data URL PNG"
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap cursor-pointer ${
                  copiedKind === 'png-url'
                    ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]'
                }`}
              >
                {copiedKind === 'png-url' ? (
                  <Check className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{copiedKind === 'png-url' ? 'Đã chép URL PNG' : 'Data URL (PNG)'}</span>
              </button>

              <button
                type="button"
                disabled={isCopying}
                onClick={() => onCopyDataUrl('svg')}
                aria-label="Sao chép Data URL SVG"
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap cursor-pointer ${
                  copiedKind === 'svg-url'
                    ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
                    : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]'
                }`}
              >
                {copiedKind === 'svg-url' ? (
                  <Check className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{copiedKind === 'svg-url' ? 'Đã chép URL SVG' : 'Data URL (SVG)'}</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-[var(--muted)]">
          PNG vuông dùng để tải lên Zalo / Messenger / Telegram (ứng dụng tự cắt tròn). Nút sao
          chép ảnh cho phép dán trực tiếp (Ctrl+V) vào khung chat hoặc lấy Data URL để nhúng nhanh.
        </p>
      </div>
    </section>
  );
}
