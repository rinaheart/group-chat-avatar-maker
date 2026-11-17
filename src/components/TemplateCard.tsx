import { useMemo } from 'react';
import { TEMPLATE_DEFAULTS, TEMPLATES } from '../data/avatarConstants';
import type { AvatarState, TemplateId } from '../types/avatar';
import { buildSVG } from '../utils/svgEngine';

interface TemplateCardProps {
  state: AvatarState;
  onSelectTemplate: (tpl: TemplateId) => void;
}

const TEMPLATE_KEYS: TemplateId[] = ['A', 'B', 'C'];

export function TemplateCard({ state, onSelectTemplate }: TemplateCardProps) {
  const thumbnails = useMemo(
    () =>
      TEMPLATE_KEYS.map((key) => {
        const previewState: AvatarState =
          key === state.tpl
            ? state
            : { ...state, ...TEMPLATE_DEFAULTS[key], tpl: key };
        return {
          key,
          label: TEMPLATES[key],
          svg: buildSVG(previewState, { pre: `t${key}` }),
        };
      }),
    [state]
  );

  return (
    <section
      id="section-template"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
        1. Mẫu (Template)
      </h2>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {thumbnails.map(({ key, label, svg }) => {
          const active = state.tpl === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTemplate(key)}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-xl border-2 p-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                active
                  ? 'border-[var(--brand)] bg-[var(--soft)]'
                  : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)]/60'
              }`}
            >
              <div
                aria-hidden="true"
                className="mb-2 aspect-square w-full max-w-[92px] overflow-hidden rounded-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <span className="text-[13px] font-semibold leading-snug text-[var(--fg)]">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-xs text-[var(--muted)]">
        Đổi template sẽ đặt lại cỡ chữ và icon về mặc định của mẫu đó; màu sắc và nội dung giữ nguyên.
      </p>
    </section>
  );
}
