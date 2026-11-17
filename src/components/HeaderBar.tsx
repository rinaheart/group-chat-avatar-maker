import { useRef, type ChangeEvent } from 'react';
import { Dices, FolderOpen, Moon, RotateCcw, Sun } from 'lucide-react';

interface HeaderBarProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onImportSvg: (svgText: string) => void;
  onRandomize: () => void;
  onReset: () => void;
}

export function HeaderBar({
  isDarkTheme,
  onToggleTheme,
  onImportSvg,
  onRandomize,
  onReset,
}: HeaderBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onImportSvg(String(reader.result ?? ''));
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 pt-3.5 sm:px-6">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight text-[var(--fg)]">
          Avatar Maker
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Tạo và chỉnh sửa avatar tròn 1:1 cho group chat
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Mở lại file SVG do ứng dụng này xuất để sửa tiếp"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--line)] bg-transparent px-3.5 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FolderOpen className="h-4 w-4" aria-hidden="true" />
          <span>Mở SVG để sửa</span>
        </button>

        <button
          type="button"
          onClick={onRandomize}
          title="Tạo ngẫu nhiên mẫu, màu, chủ đề, họa tiết, icon và cặp font"
          aria-label="Ngẫu nhiên hóa thiết kế avatar"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--brand)]/40 bg-[var(--soft)] px-3.5 py-2 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Dices className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
          <span>Ngẫu nhiên</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--line)] bg-transparent px-3.5 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Đặt lại</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDarkTheme ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
          title={isDarkTheme ? 'Giao diện sáng' : 'Giao diện tối'}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] shrink-0 cursor-pointer"
        >
          {isDarkTheme ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Chọn file SVG để nhập cấu hình"
        />
      </div>
    </header>
  );
}
