import type { AvatarState } from '../types/avatar';
import { RangeField } from './RangeField';

interface LayoutCardProps {
  state: AvatarState;
  onPatch: (patch: Partial<AvatarState>) => void;
}

export function LayoutCard({ state, onPatch }: LayoutCardProps) {
  return (
    <section
      id="section-layout"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
        7. Viền &amp; bố cục
      </h2>

      <div className="mt-2">
        <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 text-sm text-[var(--fg)]">
          <input
            type="checkbox"
            checked={state.ringOn}
            onChange={(e) => onPatch({ ringOn: e.target.checked })}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span>Hiện viền ngoài</span>
        </label>
      </div>

      <RangeField
        label="Độ dày viền"
        value={state.ringW}
        min={4}
        max={80}
        step={1}
        displayValue={`${Math.round(state.ringW)}`}
        onChange={(ringW) => onPatch({ ringW })}
      />

      <RangeField
        label="Khoảng cách giữa các dòng"
        value={state.gap}
        min={0.4}
        max={2.2}
        step={0.05}
        displayValue={`×${state.gap.toFixed(2)}`}
        onChange={(gap) => onPatch({ gap })}
      />

      <RangeField
        label="Dịch cả cụm theo chiều dọc"
        value={state.dy}
        min={-200}
        max={200}
        step={1}
        displayValue={`${Math.round(state.dy)}`}
        onChange={(dy) => onPatch({ dy })}
      />
    </section>
  );
}
