import { useMemo } from 'react';
import { AlertTriangle, Check, Minus } from 'lucide-react';
import { AVATAR_THEMES, PRESETS, normalizeThemeId } from '../data/avatarConstants';
import type { AvatarState, ColorPreset } from '../types/avatar';
import { evaluateContrast } from '../utils/colorContrast';
import { RangeField } from './RangeField';

interface ColorCardProps {
  state: AvatarState;
  onPatch: (patch: Partial<AvatarState>) => void;
}

function isPresetActive(preset: ColorPreset, state: AvatarState): boolean {
  const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  return (
    eq(preset.bg, state.bg) &&
    eq(preset.ring, state.ring) &&
    eq(preset.text, state.text) &&
    eq(preset.accent, state.accent) &&
    Boolean(preset.grad) === Boolean(state.grad) &&
    (!preset.grad || eq(preset.bg2 ?? state.bg2, state.bg2))
  );
}

export function ColorCard({ state, onPatch }: ColorCardProps) {
  const contrastBadges = useMemo(() => evaluateContrast(state), [state]);

  const applyPreset = (preset: ColorPreset) => {
    onPatch({
      bg: preset.bg,
      ring: preset.ring,
      text: preset.text,
      accent: preset.accent,
      grad: Boolean(preset.grad),
      ...(preset.bg2 ? { bg2: preset.bg2 } : {}),
    });
  };

  const activeThemeId = normalizeThemeId(state.theme);
  const activeThemeName =
    AVATAR_THEMES.find((t) => t.id === activeThemeId)?.name ?? 'Classic Corporate';

  return (
    <section
      id="section-color"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
          3. Bộ màu chi tiết
        </h2>
        {activeThemeId !== 'classic' && (
          <span className="rounded-lg bg-[var(--soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--fg)]">
            Áp chồng: {activeThemeName}
          </span>
        )}
      </div>

      {/* Preset swatches */}
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {PRESETS.map((preset) => {
          const active = isPresetActive(preset, state);
          const bgStyle = preset.grad
            ? `linear-gradient(135deg, ${preset.bg}, ${preset.bg2})`
            : preset.bg;
          return (
            <button
              key={preset.n}
              type="button"
              onClick={() => applyPreset(preset)}
              aria-pressed={active}
              title={preset.n}
              className={`flex min-h-[44px] flex-col items-center rounded-xl border-2 p-1.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                active
                  ? 'border-[var(--brand)] bg-[var(--soft)]'
                  : 'border-transparent hover:border-[var(--line)]'
              }`}
            >
              <span
                aria-hidden="true"
                style={{
                  background: bgStyle,
                  borderColor: preset.ring,
                  color: preset.text,
                }}
                className="mb-1 grid h-11 w-11 place-items-center rounded-full border-4 text-[15px] font-extrabold shadow-xs"
              >
                <span
                  style={{ borderColor: preset.accent }}
                  className="border-b-[3px] leading-[1.1]"
                >
                  Aa
                </span>
              </span>
              <span className="line-clamp-2 text-[11px] leading-tight text-[var(--muted)]">
                {preset.n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom 4 color pickers */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--muted)]">
          <span>Nền</span>
          <input
            type="color"
            value={state.bg}
            onChange={(e) => onPatch({ bg: e.target.value })}
            aria-label="Màu nền"
            className="h-11 w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--card)] p-1"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--muted)]">
          <span>Viền</span>
          <input
            type="color"
            value={state.ring}
            onChange={(e) => onPatch({ ring: e.target.value })}
            aria-label="Màu viền"
            className="h-11 w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--card)] p-1"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--muted)]">
          <span>Chữ chính</span>
          <input
            type="color"
            value={state.text}
            onChange={(e) => onPatch({ text: e.target.value })}
            aria-label="Màu chữ chính"
            className="h-11 w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--card)] p-1"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--muted)]">
          <span>Nhấn / icon</span>
          <input
            type="color"
            value={state.accent}
            onChange={(e) => onPatch({ accent: e.target.value })}
            aria-label="Màu nhấn và icon"
            className="h-11 w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--card)] p-1"
          />
        </label>
      </div>

      {/* Gradient controls */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 text-sm text-[var(--fg)]">
          <input
            type="checkbox"
            checked={state.grad}
            onChange={(e) => onPatch({ grad: e.target.checked })}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span>Nền chuyển sắc</span>
        </label>

        {state.grad && (
          <label className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>Màu 2</span>
            <input
              type="color"
              value={state.bg2}
              onChange={(e) => onPatch({ bg2: e.target.value })}
              aria-label="Màu nền chuyển sắc thứ 2"
              className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--card)] p-1"
            />
          </label>
        )}
      </div>

      {state.grad && (
        <RangeField
          label="Góc chuyển sắc"
          value={state.gradAngle}
          min={0}
          max={360}
          step={5}
          displayValue={`${state.gradAngle}°`}
          onChange={(gradAngle) => onPatch({ gradAngle })}
        />
      )}

      {/* WCAG Contrast Indicator (Icon + Ratio + Label, never color-only) */}
      <div
        aria-label="Kiểm tra độ tương phản màu sắc"
        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line)] pt-3 text-xs"
      >
        {contrastBadges.map((item) => (
          <div
            key={item.id}
            className={`inline-flex items-center gap-1.5 font-medium ${
              item.level === 'ok'
                ? 'text-emerald-700 dark:text-emerald-400'
                : item.level === 'warn'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {item.level === 'ok' ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : item.level === 'warn' ? (
              <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span className="text-[var(--muted)]">{item.label}:</span>
            <span className="font-mono tabular-nums">{item.ratio.toFixed(1)}:1</span>
            <span>({item.statusText})</span>
          </div>
        ))}
      </div>
    </section>
  );
}
