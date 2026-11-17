import { useId } from 'react';
import { Ban, Check, Grid2x2 } from 'lucide-react';
import { AVATAR_PATTERNS, normalizePatternId } from '../data/avatarConstants';
import type { AvatarPatternId, AvatarState } from '../types/avatar';
import { relativeLuminance } from '../utils/colorContrast';
import { resolveThemedColors } from '../utils/themeEngine';
import { RangeField } from './RangeField';

interface PatternsCardProps {
  state: AvatarState;
  onPatch: (patch: Partial<AvatarState>) => void;
}

function renderMiniPatternPreview(
  patternId: AvatarPatternId,
  uid: string,
  bg: string,
  bg2: string,
  grad: boolean,
  patColor: string
) {
  const fill = grad ? `url(#${uid}-bg)` : bg;
  const patRef = `url(#${uid}-${patternId})`;
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className="h-9 w-9 shrink-0 rounded-full border border-[var(--line)] shadow-xs"
    >
      <defs>
        {grad && (
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={bg} />
            <stop offset="1" stopColor={bg2} />
          </linearGradient>
        )}
        {patternId === 'dots' && (
          <pattern id={`${uid}-dots`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.15" fill={patColor} fillOpacity="0.45" />
          </pattern>
        )}
        {patternId === 'grid' && (
          <pattern id={`${uid}-grid`} width="9" height="9" patternUnits="userSpaceOnUse">
            <path
              d="M 9 0 L 0 0 0 9"
              fill="none"
              stroke={patColor}
              strokeWidth="0.9"
              strokeOpacity="0.38"
            />
          </pattern>
        )}
        {patternId === 'stripes' && (
          <pattern
            id={`${uid}-stripes`}
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={patColor}
              strokeWidth="1.5"
              strokeOpacity="0.38"
            />
          </pattern>
        )}
        {patternId === 'cross' && (
          <pattern id={`${uid}-cross`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M5 3v4M3 5h4"
              fill="none"
              stroke={patColor}
              strokeWidth="1"
              strokeLinecap="round"
              strokeOpacity="0.42"
            />
          </pattern>
        )}
      </defs>
      <rect width="36" height="36" fill={fill} />
      {patternId === 'rings' ? (
        <>
          <circle cx="18" cy="18" r="7" fill="none" stroke={patColor} strokeOpacity="0.42" strokeWidth="1" />
          <circle cx="18" cy="18" r="12" fill="none" stroke={patColor} strokeOpacity="0.42" strokeWidth="1" />
        </>
      ) : (
        patternId !== 'none' && <rect width="36" height="36" fill={patRef} />
      )}
    </svg>
  );
}

export function PatternsCard({ state, onPatch }: PatternsCardProps) {
  const uid = useId().replace(/:/g, '');
  const activePattern = normalizePatternId(state.pattern);
  const resolved = resolveThemedColors(state);
  const isLight = relativeLuminance(resolved.bg) > 0.5;
  const patColor = isLight ? '#0F172A' : resolved.glow ? resolved.accent : '#FFFFFF';
  const activeOption = AVATAR_PATTERNS.find((p) => p.id === activePattern);

  return (
    <section
      id="section-patterns"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-[var(--fg)]">
          <Grid2x2 className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
          <span>4. Họa tiết nền (Patterns)</span>
        </h2>
        <span className="text-xs text-[var(--muted)]">
          {activePattern === 'none' ? 'Đang tắt' : activeOption?.name}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {AVATAR_PATTERNS.map((option) => {
          const active = activePattern === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPatch({ pattern: option.id })}
              aria-pressed={active}
              className={`flex min-h-[56px] items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                active
                  ? 'border-[var(--brand)] bg-[var(--soft)]'
                  : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)]/60'
              }`}
            >
              {option.id === 'none' ? (
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]"
                >
                  <Ban className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : (
                renderMiniPatternPreview(
                  option.id,
                  `${uid}-${option.id}`,
                  resolved.bg,
                  resolved.bg2,
                  resolved.grad,
                  patColor
                )
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[13px] font-semibold leading-tight text-[var(--fg)]">
                    {option.name}
                  </span>
                  {active && (
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-[var(--muted)]">
                  {option.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {activePattern !== 'none' && (
        <RangeField
          label="Độ đậm họa tiết"
          value={state.patternOpacity}
          min={0.04}
          max={0.3}
          step={0.01}
          displayValue={`${Math.round(state.patternOpacity * 100)}%`}
          onChange={(patternOpacity) => onPatch({ patternOpacity })}
        />
      )}
    </section>
  );
}
