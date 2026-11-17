import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Grid2x2,
  Palette,
  Shapes,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Type,
} from 'lucide-react';
import {
  MOBILE_QUICK_NAV_ITEMS,
  pickActiveNavSection,
  type NavSectionId,
  type QuickNavIconKey,
} from '../utils/sectionNav';

function renderNavIcon(icon: QuickNavIconKey) {
  const cls = 'h-3.5 w-3.5 shrink-0';
  switch (icon) {
    case 'eye':
      return <Eye className={cls} aria-hidden="true" />;
    case 'shapes':
      return <Shapes className={cls} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={cls} aria-hidden="true" />;
    case 'palette':
      return <Palette className={cls} aria-hidden="true" />;
    case 'grid':
      return <Grid2x2 className={cls} aria-hidden="true" />;
    case 'type':
      return <Type className={cls} aria-hidden="true" />;
    case 'smile':
      return <Smile className={cls} aria-hidden="true" />;
    case 'sliders':
      return <SlidersHorizontal className={cls} aria-hidden="true" />;
  }
}

export function MobileQuickNav() {
  const [activeId, setActiveId] = useState<NavSectionId>('section-preview');
  const manualLockUntilRef = useRef<number>(0);

  useEffect(() => {
    const syncActiveSection = () => {
      if (Date.now() < manualLockUntilRef.current) return;

      const measurements = MOBILE_QUICK_NAV_ITEMS.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id: item.id,
          top: rect.top,
          height: rect.height,
        };
      }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const atBottom = docHeight - scrollBottom <= 24;

      const nextActive = pickActiveNavSection(measurements, {
        anchorY: 130,
        atBottom,
      });
      setActiveId(nextActive);
    };

    syncActiveSection();
    window.addEventListener('scroll', syncActiveSection, { passive: true });
    window.addEventListener('resize', syncActiveSection, { passive: true });
    return () => {
      window.removeEventListener('scroll', syncActiveSection);
      window.removeEventListener('resize', syncActiveSection);
    };
  }, []);

  const handleJump = (id: NavSectionId) => {
    setActiveId(id);
    manualLockUntilRef.current = Date.now() + 550;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      aria-label="Thanh chọn nhanh các mục tùy chỉnh"
      data-testid="mobile-quick-nav"
      className="fixed top-1/2 right-1.5 z-35 flex -translate-y-1/2 flex-col gap-0.5 rounded-2xl border border-[var(--line)] bg-[var(--card)]/90 p-1 shadow-lg backdrop-blur-md lg:hidden"
    >
      {MOBILE_QUICK_NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleJump(item.id)}
            aria-label={item.ariaLabel}
            aria-current={isActive ? 'location' : undefined}
            className={`flex min-h-[42px] w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand)] cursor-pointer ${
              isActive
                ? 'bg-[var(--brand)] text-[var(--brand-fg)] shadow-xs'
                : 'text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--fg)]'
            }`}
          >
            {renderNavIcon(item.icon)}
            <span className="text-[9px] font-semibold leading-none tracking-tight">
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
