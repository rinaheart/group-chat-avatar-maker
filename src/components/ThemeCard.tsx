import { Check } from 'lucide-react';
import { AVATAR_THEMES, normalizeThemeId } from '../data/avatarConstants';
import type { AvatarState, AvatarThemeId } from '../types/avatar';
import { resolveThemedColors } from '../utils/themeEngine';

interface ThemeCardProps {
  state: AvatarState;
  onSelectTheme: (themeId: AvatarThemeId) => void;
}

export function ThemeCard({ state, onSelectTheme }: ThemeCardProps) {
  const activeTheme = normalizeThemeId(state.theme);

  return (
    <section
      id="section-theme"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
          2. Chủ đề phong cách (Theme)
        </h2>
        <span className="text-xs text-[var(--muted)]">Áp chồng được với bộ màu</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {AVATAR_THEMES.map((themeOption) => {
          const active = activeTheme === themeOption.id;
          const preview = resolveThemedColors({
            ...state,
            theme: themeOption.id,
          });
          const background = preview.grad
            ? `linear-gradient(${preview.gradAngle}deg, ${preview.bg}, ${preview.bg2})`
            : preview.bg;

          return (
            <button
              key={themeOption.id}
              type="button"
              onClick={() => onSelectTheme(themeOption.id)}
              aria-pressed={active}
              className={`group relative flex min-h-[56px] items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                active
                  ? 'border-[var(--brand)] bg-[var(--soft)]'
                  : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)]/60'
              }`}
            >
              <span
                aria-hidden="true"
                style={{
                  background,
                  borderColor: preview.ring,
                  color: preview.text,
                  boxShadow: preview.glow ? `0 0 10px ${preview.ring}` : undefined,
                }}
                className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] text-xs font-extrabold shadow-xs"
              >
                {preview.spotlight && (
                  <span
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 65%)',
                    }}
                    className="pointer-events-none absolute inset-0"
                  />
                )}
                {preview.doubleRing && (
                  <span
                    style={{ borderColor: preview.accent }}
                    className="pointer-events-none absolute inset-[2px] rounded-full border opacity-55"
                  />
                )}
                <span
                  style={{ borderColor: preview.accent }}
                  className="relative border-b-2 leading-none"
                >
                  Aa
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[13px] font-semibold leading-tight text-[var(--fg)]">
                    {themeOption.name}
                  </span>
                  {active && (
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-[var(--muted)]">
                  {themeOption.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
