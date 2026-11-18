import { useId } from 'react';
import { Check, Circle, Copy, Download, FileCode2 } from 'lucide-react';
import type { ClipboardCopyKind, ExportSize, PreviewUiState } from '../types/avatar';

interface ExportCardProps {
  shape: PreviewUiState['shape'];
  exportSize: ExportSize;
  isExporting: boolean;
  isCopying: boolean;
  copiedKind: ClipboardCopyKind | null;
  onExportSizeChange: (size: ExportSize) => void;
  onExportPng: (round: boolean) => void;
  onExportSvg: () => void;
  onCopyImage: () => void;
  onCopyDataUrl: (format: 'png' | 'svg') => void;
}

export function ExportCard({
  shape,
  exportSize,
  isExporting,
  isCopying,
  copiedKind,
  onExportSizeChange,
  onExportPng,
  onExportSvg,
  onCopyImage,
  onCopyDataUrl,
}: ExportCardProps) {
  const sizeSelectId = useId();

  return (
    <section
      aria-label="Tùy chọn xuất và sao chép"
      className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={sizeSelectId} className="text-sm font-medium text-[var(--fg)]">
          Cỡ xuất ảnh
        </label>
        <div className="flex items-center gap-1.5">
          <select
            id={sizeSelectId}
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
            aria-label={`Sao chép ảnh PNG ${shape === 'round' ? 'tròn' : 'vuông'} vào clipboard`}
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
                : `Sao chép ảnh (${shape === 'round' ? 'tròn' : 'vuông'})`}
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
        PNG vuông dùng để tải lên Zalo / Messenger / Telegram (ứng dụng tự cắt tròn). Nút sao chép
        ảnh cho phép dán trực tiếp (Ctrl+V) vào khung chat hoặc lấy Data URL để nhúng nhanh.
      </p>
    </section>
  );
}
