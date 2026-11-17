import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { ColorCard } from './components/ColorCard';
import { ContentCard } from './components/ContentCard';
import { HeaderBar } from './components/HeaderBar';
import { IconCard } from './components/IconCard';
import { LayoutCard } from './components/LayoutCard';
import { MobileQuickNav } from './components/MobileQuickNav';
import { PatternsCard } from './components/PatternsCard';
import { PreviewStage } from './components/PreviewStage';
import { TemplateCard } from './components/TemplateCard';
import { ThemeCard } from './components/ThemeCard';
import { Toast } from './components/Toast';
import {
  AVATAR_THEMES,
  STORAGE_KEY,
  TEMPLATE_DEFAULTS,
  createDefaultState,
  normalizeFontId,
  normalizePatternId,
  normalizeThemeId,
} from './data/avatarConstants';
import { normalizeIconId } from './data/lucideIcons';
import type {
  AvatarState,
  AvatarThemeId,
  ClipboardCopyKind,
  ExportSize,
  PreviewUiState,
  TemplateId,
} from './types/avatar';
import {
  buildPngDataUrl,
  copyAvatarPngToClipboard,
  copyDataUrlToClipboard,
  downloadBlob,
  exportAvatarSvg,
  readUploadedImage,
  renderPngBlob,
} from './utils/exportHandlers';
import {
  buildExportBaseName,
  buildSvgDataUrl,
  formatAppVersion,
  parseImportedSVG,
} from './utils/svgEngine';
import { createRandomizedState } from './utils/randomizeAvatar';

const APP_BUILD_MS = Number(import.meta.env.VITE_APP_BUILD_MS) || Date.now();
const APP_VERSION = formatAppVersion(APP_BUILD_MS);

function loadInitialState(): AvatarState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const merged = { ...createDefaultState(), ...parsed };
        merged.icon = normalizeIconId(merged.icon);
        merged.font = normalizeFontId(merged.font);
        merged.theme = normalizeThemeId(merged.theme);
        merged.pattern = normalizePatternId(merged.pattern);
        return merged;
      }
    }
  } catch {
    // Fallback to default state if storage is unavailable or corrupted
  }
  return createDefaultState();
}

function getInitialDarkTheme(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export default function App() {
  const [state, setState] = useState<AvatarState>(loadInitialState);
  const [ui, setUi] = useState<PreviewUiState>({
    shape: 'round',
    panel: 'light',
    guide: false,
  });
  const [exportSize, setExportSize] = useState<ExportSize>(1024);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedKind, setCopiedKind] = useState<ClipboardCopyKind | null>(null);
  const [isMobilePinned, setIsMobilePinned] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(getInitialDarkTheme);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const copiedTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  const markCopied = useCallback((kind: ClipboardCopyKind) => {
    setCopiedKind(kind);
    if (copiedTimerRef.current) {
      window.clearTimeout(copiedTimerRef.current);
    }
    copiedTimerRef.current = window.setTimeout(() => {
      setCopiedKind(null);
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    };
  }, []);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage quota errors
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [state]);

  const patchState = useCallback((patch: Partial<AvatarState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSelectTemplate = useCallback((tpl: TemplateId) => {
    setState((prev) => ({
      ...prev,
      tpl,
      ...TEMPLATE_DEFAULTS[tpl],
    }));
  }, []);

  const handleSelectTheme = useCallback(
    (themeId: AvatarThemeId) => {
      const themeMeta = AVATAR_THEMES.find((t) => t.id === themeId);
      setState((prev) => ({
        ...prev,
        theme: themeId,
      }));
      showToast(`Đã áp dụng chủ đề ${themeMeta?.name ?? themeId}`);
    },
    [showToast]
  );

  const handleToggleMobilePin = useCallback(() => {
    setIsMobilePinned((prev) => {
      const next = !prev;
      showToast(next ? 'Đã ghim vùng xem trước trên mobile' : 'Đã bỏ ghim vùng xem trước');
      return next;
    });
  }, [showToast]);

  const handleReset = useCallback(() => {
    setState(createDefaultState());
    showToast('Đã đặt lại về mặc định');
  }, [showToast]);

  const handleRandomize = useCallback(() => {
    setState((prev) => createRandomizedState(prev));
    showToast('Đã tạo tổ hợp avatar ngẫu nhiên');
  }, [showToast]);

  const handleImportSvg = useCallback(
    (svgText: string) => {
      const result = parseImportedSVG(svgText);
      if (result.ok) {
        setState(result.state);
        showToast('Đã mở cấu hình từ SVG');
      } else {
        showToast(result.error);
      }
    },
    [showToast]
  );

  const handleUploadImage = useCallback(
    async (file: File) => {
      try {
        const { dataUrl, aspect } = await readUploadedImage(file);
        setState((prev) => ({
          ...prev,
          img: dataUrl,
          imgAspect: aspect,
          icon: 'upload',
        }));
        showToast('Đã tải ảnh logo lên');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Không đọc được ảnh này.');
      }
    },
    [showToast]
  );

  const handleExportPng = useCallback(
    async (round: boolean) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const blob = await renderPngBlob(state, exportSize, round);
        const filename = `${buildExportBaseName(state.title)}${round ? '_tron' : ''}.png`;
        downloadBlob(blob, filename);
        showToast(`Đã tải PNG ${round ? 'tròn ' : 'vuông '}${exportSize} px`);
      } catch (err) {
        showToast(
          `Không xuất được PNG: ${err instanceof Error ? err.message : 'lỗi không rõ'}`
        );
      } finally {
        setIsExporting(false);
      }
    },
    [exportSize, isExporting, showToast, state]
  );

  const handleExportSvg = useCallback(() => {
    exportAvatarSvg(state);
    showToast('Đã tải SVG');
  }, [showToast, state]);

  const handleCopyImage = useCallback(async () => {
    if (isCopying) return;
    setIsCopying(true);
    const round = ui.shape === 'round';
    try {
      await copyAvatarPngToClipboard(state, exportSize, round);
      markCopied('blob');
      showToast(
        `Đã sao chép ảnh PNG ${round ? 'tròn ' : 'vuông '}${exportSize} px vào clipboard`
      );
    } catch (err) {
      showToast(
        `Không sao chép được ảnh: ${
          err instanceof Error ? err.message : 'trình duyệt không hỗ trợ'
        }`
      );
    } finally {
      setIsCopying(false);
    }
  }, [exportSize, isCopying, markCopied, showToast, state, ui.shape]);

  const handleCopyDataUrl = useCallback(
    async (format: 'png' | 'svg') => {
      if (isCopying) return;
      setIsCopying(true);
      try {
        if (format === 'svg') {
          const dataUrl = buildSvgDataUrl(state, exportSize);
          await copyDataUrlToClipboard(dataUrl);
          markCopied('svg-url');
          showToast('Đã sao chép Data URL SVG vào clipboard');
        } else {
          const round = ui.shape === 'round';
          const dataUrl = await buildPngDataUrl(state, exportSize, round);
          await copyDataUrlToClipboard(dataUrl);
          markCopied('png-url');
          showToast(`Đã sao chép Data URL PNG (${exportSize} px) vào clipboard`);
        }
      } catch (err) {
        showToast(
          `Không sao chép được Data URL: ${
            err instanceof Error ? err.message : 'trình duyệt không hỗ trợ'
          }`
        );
      } finally {
        setIsCopying(false);
      }
    },
    [exportSize, isCopying, markCopied, showToast, state, ui.shape]
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <HeaderBar
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme((prev) => !prev)}
        onImportSvg={handleImportSvg}
        onRandomize={handleRandomize}
        onReset={handleReset}
      />

      <main className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-4 pl-4 pr-[58px] pt-3.5 pb-24 sm:pl-6 lg:grid-cols-[minmax(320px,460px)_1fr] lg:px-6 lg:pb-8">
        <PreviewStage
          state={state}
          ui={ui}
          exportSize={exportSize}
          isExporting={isExporting}
          isCopying={isCopying}
          copiedKind={copiedKind}
          isMobilePinned={isMobilePinned}
          onUiChange={(patch) => setUi((prev) => ({ ...prev, ...patch }))}
          onExportSizeChange={setExportSize}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onCopyImage={handleCopyImage}
          onCopyDataUrl={handleCopyDataUrl}
          onToggleMobilePin={handleToggleMobilePin}
        />

        <div className="flex min-w-0 flex-col gap-3">
          <TemplateCard state={state} onSelectTemplate={handleSelectTemplate} />
          <ThemeCard state={state} onSelectTheme={handleSelectTheme} />
          <ColorCard state={state} onPatch={patchState} />
          <PatternsCard state={state} onPatch={patchState} />
          <ContentCard state={state} onPatch={patchState} />
          <IconCard
            state={state}
            onPatch={patchState}
            onUploadImage={handleUploadImage}
          />
          <LayoutCard state={state} onPatch={patchState} />
        </div>
      </main>

      <footer className="mx-auto flex max-w-[1200px] flex-col items-center gap-1 pl-4 pr-[58px] pb-24 text-center text-[11px] text-[var(--muted)] sm:pl-6 lg:px-6 lg:pb-8">
        <p className="m-0 leading-relaxed">
          Xử lý hoàn toàn trên trình duyệt · Tự lưu cục bộ (localStorage)
        </p>
        <p
          data-testid="app-version"
          className="m-0 font-mono text-[10px] tabular-nums tracking-wide text-[var(--muted)]"
        >
          {APP_VERSION} (GMT+7)
        </p>
      </footer>

      <MobileQuickNav />

      {/* Mobile-first sticky thumb-zone export bar (<1024px, height 64px <= 8% viewport) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--card)]/90 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[600px] items-center gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExportPng(false)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand)] px-3 text-sm font-semibold text-[var(--brand-fg)] transition-opacity hover:opacity-95 disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Tải PNG ({exportSize}px)</span>
          </button>
          <button
            type="button"
            disabled={isCopying || isExporting}
            onClick={handleCopyImage}
            aria-label="Sao chép ảnh PNG vào clipboard"
            className={`inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer ${
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
            <span>{copiedKind === 'blob' ? 'Đã chép' : 'Sao chép'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportSvg}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--brand)] whitespace-nowrap cursor-pointer"
          >
            <FileCode2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>SVG</span>
          </button>
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
