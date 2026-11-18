import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Ban, ImagePlus, Search, X } from 'lucide-react';
import {
  LUCIDE_ICONS,
  LUCIDE_ICON_CATEGORIES,
  normalizeIconId,
} from '../data/lucideIcons';
import type { AvatarState, IconCategory } from '../types/avatar';
import { RangeField } from './RangeField';

interface IconCardProps {
  state: AvatarState;
  onPatch: (patch: Partial<AvatarState>) => void;
  onUploadImage: (file: File) => void;
}

export function IconCard({ state, onPatch, onUploadImage }: IconCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<IconCategory>('all');
  const [query, setQuery] = useState('');

  const activeIconId = normalizeIconId(state.icon);

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LUCIDE_ICONS.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (!q) return true;
      return entry.keywords.includes(q);
    });
  }, [category, query]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
    e.target.value = '';
  };

  return (
    <section
      id="section-icon"
      className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 lg:scroll-mt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
          6. Icon (Lucide)
        </h2>
        <span className="text-xs tabular-nums text-[var(--muted)]">
          {filteredIcons.length} / {LUCIDE_ICONS.length} biểu tượng
        </span>
      </div>

      {/* Category tabs + search */}
      <div className="mt-3 flex flex-col gap-2.5">
        <div
          role="group"
          aria-label="Nhóm biểu tượng Lucide"
          className="flex items-center gap-1 overflow-x-auto rounded-xl bg-[var(--bg)] p-1"
        >
          {LUCIDE_ICON_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(cat.id)}
                className={`min-h-[44px] rounded-lg px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[var(--card)] text-[var(--fg)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm icon (vd: chat, code, y tế, sao, game...)"
            aria-label="Tìm biểu tượng Lucide"
            className="min-h-[44px] w-full rounded-xl border border-[var(--line)] bg-[var(--card)] pr-10 pl-9 text-sm text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Xóa từ khóa tìm icon"
              className="absolute top-1/2 right-1 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Lucide icon grid */}
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(46px,1fr))] gap-1.5">
        <button
          type="button"
          onClick={() => onPatch({ icon: 'none' })}
          aria-pressed={activeIconId === 'none'}
          aria-label="Không dùng icon"
          title="Không icon"
          className={`grid h-11 w-full place-items-center rounded-xl border-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
            activeIconId === 'none'
              ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--brand)]'
              : 'border-[var(--line)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--brand)]/60'
          }`}
        >
          <Ban className="h-5 w-5" aria-hidden="true" />
        </button>

        {filteredIcons.map(({ id, name, component: IconComponent }) => {
          const active = activeIconId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPatch({ icon: id })}
              aria-pressed={active}
              aria-label={`Chọn biểu tượng ${name}`}
              title={`${name} (${id})`}
              className={`grid h-11 w-full place-items-center rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
                active
                  ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--brand)]'
                  : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]/60'
              }`}
            >
              <IconComponent className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          );
        })}

        {state.img && (
          <button
            type="button"
            onClick={() => onPatch({ icon: 'upload' })}
            aria-pressed={activeIconId === 'upload'}
            aria-label="Dùng ảnh đã tải lên"
            title="Ảnh đã tải lên"
            className={`grid h-11 w-full place-items-center rounded-xl border-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] cursor-pointer ${
              activeIconId === 'upload'
                ? 'border-[var(--brand)] bg-[var(--soft)] text-[var(--brand)]'
                : 'border-[var(--line)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--brand)]/60'
            }`}
          >
            Ảnh
          </button>
        )}
      </div>

      {filteredIcons.length === 0 && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          Không tìm thấy biểu tượng phù hợp với “{query}”.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3.5 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          <span>Tải ảnh / logo lên…</span>
        </button>

        {state.img && activeIconId === 'upload' && (
          <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 text-sm text-[var(--fg)]">
            <input
              type="checkbox"
              checked={state.imgCircle}
              onChange={(e) => onPatch({ imgCircle: e.target.checked })}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            <span>Cắt tròn ảnh</span>
          </label>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Chọn ảnh hoặc logo từ máy"
        />
      </div>

      <RangeField
        label="Kích thước icon"
        value={state.iconSize}
        min={80}
        max={900}
        step={5}
        displayValue={`${Math.round(state.iconSize)}`}
        onChange={(iconSize) => onPatch({ iconSize })}
      />

      <RangeField
        label="Độ dày nét icon"
        value={state.iconStroke}
        min={0.8}
        max={3.2}
        step={0.05}
        displayValue={state.iconStroke.toFixed(2)}
        onChange={(iconStroke) => onPatch({ iconStroke })}
      />

      <RangeField
        label="Độ đậm icon"
        value={state.iconOpacity}
        min={0.05}
        max={1}
        step={0.01}
        displayValue={`${Math.round(state.iconOpacity * 100)}%`}
        onChange={(iconOpacity) => onPatch({ iconOpacity })}
      />

      <RangeField
        label="Dịch icon theo chiều dọc"
        value={state.iconDy}
        min={-250}
        max={250}
        step={1}
        displayValue={`${Math.round(state.iconDy)}`}
        onChange={(iconDy) => onPatch({ iconDy })}
      />
    </section>
  );
}
