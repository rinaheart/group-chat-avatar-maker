import { FONTS, normalizeFontId } from '../data/avatarConstants';
import type { AvatarState, FontId } from '../types/avatar';
import { RangeField } from './RangeField';

interface ContentCardProps {
  state: AvatarState;
  onPatch: (patch: Partial<AvatarState>) => void;
}

const FONT_KEYS = Object.keys(FONTS) as FontId[];

export function ContentCard({ state, onPatch }: ContentCardProps) {
  const activeFontId = normalizeFontId(state.font);
  const activeFont = FONTS[activeFontId];

  return (
    <section
      id="section-content"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">5. Nội dung</h2>

      <div className="mt-3 space-y-3">
        <label className="block text-[13px] text-[var(--muted)]">
          <span>Tiêu đề</span>
          <input
            type="text"
            value={state.title}
            maxLength={24}
            autoComplete="off"
            placeholder="VD: NCKH, TEAM, DEV..."
            onChange={(e) => onPatch({ title: e.target.value })}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[15px] text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
          />
        </label>

        <label className="block text-[13px] text-[var(--muted)]">
          <span>Phụ đề (để trống nếu không cần)</span>
          <input
            type="text"
            value={state.sub}
            maxLength={32}
            autoComplete="off"
            placeholder="VD: KHOA KTYH, 2026..."
            onChange={(e) => onPatch({ sub: e.target.value })}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[15px] text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
          />
        </label>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1">
        <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 text-sm text-[var(--fg)]">
          <input
            type="checkbox"
            checked={state.upper}
            onChange={(e) => onPatch({ upper: e.target.checked })}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span>IN HOA</span>
        </label>

        <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 text-sm text-[var(--fg)]">
          <input
            type="checkbox"
            checked={state.fit}
            onChange={(e) => onPatch({ fit: e.target.checked })}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span>Tự co chữ vừa khung</span>
        </label>
      </div>

      <label className="mt-2 block text-[13px] text-[var(--muted)]">
        <span>Cặp font kết hợp (Google Fonts)</span>
        <select
          value={activeFontId}
          onChange={(e) => onPatch({ font: e.target.value as FontId })}
          className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[15px] text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
        >
          {FONT_KEYS.map((key) => (
            <option key={key} value={key}>
              {FONTS[key].label}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-1.5 text-xs text-[var(--muted)]">
        Tiêu đề: <strong className="font-semibold text-[var(--fg)]">{activeFont.titleLabel}</strong> · Phụ đề:{' '}
        <strong className="font-semibold text-[var(--fg)]">{activeFont.subLabel}</strong> — {activeFont.desc}.
      </p>

      <RangeField
        label="Cỡ tiêu đề (tối đa)"
        value={state.titleSize}
        min={60}
        max={420}
        step={1}
        displayValue={`${Math.round(state.titleSize)}`}
        onChange={(titleSize) => onPatch({ titleSize })}
      />

      <RangeField
        label="Cỡ phụ đề (tối đa)"
        value={state.subSize}
        min={30}
        max={220}
        step={1}
        displayValue={`${Math.round(state.subSize)}`}
        onChange={(subSize) => onPatch({ subSize })}
      />

      <RangeField
        label="Giãn chữ"
        value={state.track}
        min={-3}
        max={30}
        step={1}
        displayValue={`${state.track}%`}
        onChange={(track) => onPatch({ track })}
      />

      <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
        File PNG đã “đóng băng” hình ảnh nên gửi qua chat không bị đổi font; SVG có thể hiển
        thị font thay thế nếu thiết bị nhận không cài sẵn font đó.
      </p>
    </section>
  );
}
