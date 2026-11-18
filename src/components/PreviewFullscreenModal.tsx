import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Circle, Moon, Shield, Square, Sun, X, ZoomIn } from 'lucide-react';
import type { PreviewUiState } from '../types/avatar';

interface PreviewFullscreenModalProps {
  isOpen: boolean;
  svg: string;
  groupName: string;
  ui: PreviewUiState;
  onUiChange: (patch: Partial<PreviewUiState>) => void;
  onClose: () => void;
}

const ZOOM_LEVELS = [1, 1.5, 2] as const;
type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export function PreviewFullscreenModal({
  isOpen,
  svg,
  groupName,
  ui,
  onUiChange,
  onClose,
}: PreviewFullscreenModalProps) {
  const [zoom, setZoom] = useState<ZoomLevel>(1);

  useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const cycleZoom = () => {
    setZoom((prev) => {
      const idx = ZOOM_LEVELS.indexOf(prev);
      return ZOOM_LEVELS[(idx + 1) % ZOOM_LEVELS.length];
    });
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Xem trước phóng to avatar ${groupName}`}
      data-testid="fullscreen-preview-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/85 p-3 backdrop-blur-md sm:p-6"
    >
      {/* Top Modal Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex w-full max-w-[960px] items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 shadow-lg"
      >
        <div className="min-w-0">
          <h2 className="truncate font-display text-sm font-semibold text-[var(--fg)] sm:text-base">
            Xem chi tiết: {groupName}
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            {ui.shape === 'round' ? 'Hình tròn' : 'Hình vuông'} ·{' '}
            {ui.panel === 'dark' ? 'Nền tối' : 'Nền sáng'} · Thu phóng {zoom}×
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng xem trước phóng to"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-[var(--brand)] cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Center Large Inspection Canvas */}
      <div
        tabIndex={0}
        aria-label="Vùng xem trước phóng to"
        onClick={(e) => e.stopPropagation()}
        className={`mx-auto my-3 flex w-full max-w-[960px] flex-1 items-center justify-center overflow-auto rounded-3xl border border-[var(--line)] p-6 shadow-2xl transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--brand)] ${
          ui.panel === 'dark' ? 'bg-[var(--panel-d)]' : 'bg-[var(--panel-l)]'
        }`}
      >
        <div
          style={{
            width: `min(${Math.round(78 * zoom)}vw, ${Math.round(62 * zoom)}vh)`,
            height: `min(${Math.round(78 * zoom)}vw, ${Math.round(62 * zoom)}vh)`,
          }}
          className="relative m-auto shrink-0 transition-[width,height] duration-150"
        >
          <div
            data-testid="fullscreen-avatar-surface"
            data-shape={ui.shape}
            role="img"
            aria-label={`Avatar phóng to ${groupName}`}
            className={`h-full w-full overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-[border-radius] duration-150 [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${
              ui.shape === 'square' ? 'rounded-none' : 'rounded-full'
            }`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {ui.guide && (
            <div
              data-testid="fullscreen-safe-zone-guide"
              aria-hidden="true"
              className="pointer-events-none absolute inset-[10%] rounded-full border-2 border-dashed border-white mix-blend-difference"
            />
          )}
        </div>
      </div>

      {/* Bottom Inspection Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex w-full max-w-[960px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-2.5 shadow-lg"
      >
        <div
          role="group"
          aria-label="Hình dạng xem trước phóng to"
          className="inline-flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => onUiChange({ shape: 'round' })}
            aria-pressed={ui.shape === 'round'}
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer sm:text-sm ${
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer sm:text-sm ${
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
          aria-label="Nền kiểm tra phóng to"
          className="inline-flex overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => onUiChange({ panel: 'light' })}
            aria-pressed={ui.panel === 'light'}
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer sm:text-sm ${
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
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer sm:text-sm ${
              ui.panel === 'dark'
                ? 'bg-[var(--brand)] text-[var(--brand-fg)]'
                : 'text-[var(--fg)] hover:bg-[var(--soft)]'
            }`}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tối</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onUiChange({ guide: !ui.guide })}
          aria-pressed={ui.guide}
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer sm:text-sm ${
            ui.guide
              ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--fg)]'
              : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]'
          }`}
        >
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Vùng an toàn</span>
        </button>

        <button
          type="button"
          onClick={cycleZoom}
          aria-label={`Đổi mức phóng đại (hiện tại ${zoom}×)`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 text-xs font-semibold tabular-nums text-[var(--fg)] transition-colors hover:border-[var(--brand)] whitespace-nowrap cursor-pointer sm:text-sm"
        >
          <ZoomIn className="h-3.5 w-3.5 text-[var(--brand)]" aria-hidden="true" />
          <span>Phóng {zoom}×</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
