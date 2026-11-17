import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVATAR_PATTERNS,
  AVATAR_THEMES,
  FONTS,
  PRESETS,
  TEMPLATE_DEFAULTS,
  createDefaultState,
  normalizeFontId,
  normalizePatternId,
  normalizeThemeId,
} from '../data/avatarConstants';
import { LUCIDE_ICONS, normalizeIconId, resolveLucideIcon } from '../data/lucideIcons';
import { contrastRatio, evaluateContrast } from './colorContrast';
import {
  buildExportBaseName,
  buildSVG,
  buildSvgDataUrl,
  escapeXml,
  formatAppVersion,
  slugifyTitle,
} from './svgEngine';
import { resolveThemedColors } from './themeEngine';
import { createRandomizedState } from './randomizeAvatar';
import { MOBILE_QUICK_NAV_ITEMS, pickActiveNavSection } from './sectionNav';

test('createDefaultState returns expected default NCKH config with Lucide messages-square', () => {
  const def = createDefaultState();
  assert.equal(def.tpl, 'A');
  assert.equal(def.title, 'NCKH');
  assert.equal(def.sub, 'KHOA KTYH');
  assert.equal(def.icon, 'messages-square');
  assert.equal(def.bg, '#0049AC');
  assert.equal(def.ringW, 18);
});

test('all default color presets meet WCAG AA (>= 4.5:1) contrast for small chat avatars', () => {
  for (const preset of PRESETS) {
    const bgs = preset.grad && preset.bg2 ? [preset.bg, preset.bg2] : [preset.bg];
    const minText = Math.min(...bgs.map((b) => contrastRatio(preset.text, b)));
    const minAccent = Math.min(...bgs.map((b) => contrastRatio(preset.accent, b)));
    const minRing = Math.min(...bgs.map((b) => contrastRatio(preset.ring, b)));
    assert.ok(minText >= 4.5, `${preset.n} text contrast ${minText.toFixed(2)} < 4.5`);
    assert.ok(minAccent >= 4.5, `${preset.n} accent contrast ${minAccent.toFixed(2)} < 4.5`);
    assert.ok(minRing >= 4.5, `${preset.n} ring contrast ${minRing.toFixed(2)} < 4.5`);
  }
});

test('all Lucide icons extract valid SVG primitives and render cleanly in buildSVG', () => {
  assert.ok(LUCIDE_ICONS.length >= 40, 'Should provide rich Lucide icon library');
  const base = createDefaultState();
  for (const entry of LUCIDE_ICONS) {
    assert.ok(entry.svgInner.length > 0, `Icon ${entry.id} must have SVG primitives`);
    const svg = buildSVG({ ...base, icon: entry.id }, { pre: 'li' });
    assert.ok(!svg.includes('NaN'), `Icon ${entry.id} produced NaN`);
    assert.ok(!svg.includes('undefined'), `Icon ${entry.id} produced undefined`);
  }
});

test('legacy icon IDs map cleanly to Lucide icons', () => {
  assert.equal(normalizeIconId('chat2'), 'messages-square');
  assert.equal(normalizeIconId('flask'), 'flask-conical');
  assert.equal(normalizeIconId('cap'), 'graduation-cap');
  assert.equal(resolveLucideIcon('chat2')?.id, 'messages-square');
  assert.equal(resolveLucideIcon('none'), null);
});

test('buildSVG renders valid SVG for template A, B, and C without NaN or undefined', () => {
  const base = createDefaultState();
  for (const tpl of ['A', 'B', 'C'] as const) {
    const svg = buildSVG(
      { ...base, ...TEMPLATE_DEFAULTS[tpl], tpl },
      { pre: `t${tpl}`, meta: true, size: 1024 }
    );
    assert.ok(svg.startsWith('<svg '), `Template ${tpl} should start with <svg`);
    assert.ok(svg.includes('viewBox="0 0 1024 1024"'));
    assert.ok(svg.includes('width="1024" height="1024"'));
    assert.ok(svg.includes('<metadata id="avatar-maker-config">'));
    assert.ok(!svg.includes('NaN'), `Template ${tpl} must not contain NaN`);
    assert.ok(!svg.includes('undefined'), `Template ${tpl} must not contain undefined`);
    if (tpl === 'C') {
      assert.ok(svg.includes('<textPath '), 'Template C should render curved textPath');
    }
  }
});

test('buildSVG renders linearGradient when grad is enabled and escapes XML characters', () => {
  const state = {
    ...createDefaultState(),
    title: 'R&D <Lab>',
    sub: '"2026"',
    grad: true,
    bg: '#7C3AED',
    bg2: '#DB2777',
    gradAngle: 90,
  };
  const svg = buildSVG(state, { pre: 'g', meta: true });
  assert.ok(svg.includes('<linearGradient id="gbg"'));
  assert.ok(svg.includes('fill="url(#gbg)"'));
  assert.ok(svg.includes('R&amp;D &lt;Lab&gt;'));
  assert.ok(svg.includes('&quot;2026&quot;'));
});

test('buildSVG omits outer ring when ringOn is false', () => {
  const state = { ...createDefaultState(), ringOn: false };
  const svg = buildSVG(state, { pre: 'nr' });
  assert.ok(!svg.includes('r="470"'));
});

test('contrastRatio and evaluateContrast identify accessible vs unreadable combinations', () => {
  const high = contrastRatio('#FFFFFF', '#0049AC');
  assert.ok(high >= 7, `Expected >= 7, got ${high}`);
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF'), 1);

  const badState = {
    ...createDefaultState(),
    bg: '#FFFFFF',
    text: '#FFFFFF',
    accent: '#FFFFFF',
    ringOn: false,
  };
  const badges = evaluateContrast(badState);
  assert.equal(badges.length, 2);
  assert.equal(badges[0].level, 'bad');
  assert.equal(badges[0].statusText, 'Khó đọc');
});

test('slugifyTitle normalizes Vietnamese diacritics cleanly', () => {
  assert.equal(slugifyTitle('Đồ án KTYH 2026'), 'do-an-ktyh-2026');
  assert.equal(slugifyTitle('   '), 'avatar');
  const filename = buildExportBaseName('Nhóm Đọc Sách', Date.UTC(2026, 10, 17, 5, 30));
  assert.equal(filename, 'avatar_nhom-doc-sach_20261117_1230');
});

test('escapeXml encodes special XML characters', () => {
  assert.equal(escapeXml(`a&b<c>"d"`), 'a&amp;b&lt;c&gt;&quot;d&quot;');
});

test('buildSvgDataUrl produces a valid UTF-8 SVG data URL with metadata and target size', () => {
  const state = createDefaultState();
  const dataUrl = buildSvgDataUrl(state, 512);
  assert.ok(dataUrl.startsWith('data:image/svg+xml;charset=utf-8,'));
  const decoded = decodeURIComponent(dataUrl.slice('data:image/svg+xml;charset=utf-8,'.length));
  assert.ok(decoded.startsWith('<svg '));
  assert.ok(decoded.includes('width="512" height="512"'));
  assert.ok(decoded.includes('viewBox="0 0 1024 1024"'));
  assert.ok(decoded.includes('<metadata id="avatar-maker-config">'));
});

test('all 72 stacked combinations (6 AVATAR_THEMES x 12 PRESETS) satisfy WCAG AA >= 4.5:1 and render valid SVG', () => {
  const base = createDefaultState();
  assert.equal(AVATAR_THEMES.length, 6);
  assert.equal(PRESETS.length, 12);

  for (const theme of AVATAR_THEMES) {
    for (const preset of PRESETS) {
      const state = {
        ...base,
        theme: theme.id,
        bg: preset.bg,
        bg2: preset.bg2 ?? preset.bg,
        grad: Boolean(preset.grad),
        ring: preset.ring,
        text: preset.text,
        accent: preset.accent,
      };
      const resolved = resolveThemedColors(state);
      const bgs = resolved.grad ? [resolved.bg, resolved.bg2] : [resolved.bg];
      const minText = Math.min(...bgs.map((b) => contrastRatio(resolved.text, b)));
      const minAccent = Math.min(...bgs.map((b) => contrastRatio(resolved.accent, b)));
      const minRing = Math.min(...bgs.map((b) => contrastRatio(resolved.ring, b)));

      assert.ok(minText >= 4.5, `${theme.id} + ${preset.n} text ${minText.toFixed(2)} < 4.5`);
      assert.ok(minAccent >= 4.5, `${theme.id} + ${preset.n} accent ${minAccent.toFixed(2)} < 4.5`);
      assert.ok(minRing >= 4.5, `${theme.id} + ${preset.n} ring ${minRing.toFixed(2)} < 4.5`);

      const svg = buildSVG(state, { pre: 'stk' });
      assert.ok(!svg.includes('NaN') && !svg.includes('undefined'));
    }
  }
});

test('orthogonal stacking preserves underlying palette colors when switching themes', () => {
  const base = createDefaultState();
  const neon = resolveThemedColors({ ...base, theme: 'neon', bg: '#7F1D1D', accent: '#FCD34D' });
  const pastel = resolveThemedColors({ ...base, theme: 'pastel', bg: '#7F1D1D', accent: '#FCD34D' });
  const classic = resolveThemedColors({ ...base, theme: 'classic', bg: '#7F1D1D', accent: '#FCD34D' });

  assert.equal(neon.glow, true);
  assert.equal(neon.bg, '#070B14');
  assert.equal(pastel.glow, false);
  assert.notEqual(pastel.bg, neon.bg);
  assert.equal(classic.bg, '#7F1D1D');
  assert.equal(classic.accent, '#FCD34D');
});

test('Google Fonts logo pairings render distinct title/sub fonts and normalize legacy IDs', () => {
  assert.equal(normalizeFontId('wide'), 'geometric-startup');
  assert.equal(normalizeFontId('cond'), 'bold-impact');
  assert.equal(normalizeFontId('sans'), 'modern-tech');
  assert.equal(normalizeFontId('serif'), 'luxury-editorial');
  assert.equal(normalizeFontId('round'), 'friendly-round');
  assert.equal(normalizeThemeId('classic-corporate'), 'classic');

  const base = createDefaultState();
  const svg = buildSVG({ ...base, font: 'luxury-editorial' }, { pre: 'gf' });
  assert.ok(svg.includes('Playfair Display'));
  assert.ok(svg.includes('Be Vietnam Pro'));
  assert.ok(Object.keys(FONTS).length === 6);
});

test('formatAppVersion formats v[yyyymmdd]_[HHmm] in GMT+7 timezone', () => {
  const utcMs = Date.UTC(2026, 10, 17, 6, 5);
  assert.equal(formatAppVersion(utcMs), 'v20261117_1305');
});

test('all AVATAR_PATTERNS render valid SVG pattern layers without NaN or undefined', () => {
  const base = createDefaultState();
  assert.equal(AVATAR_PATTERNS.length, 6);
  assert.equal(normalizePatternId('unknown'), 'none');
  assert.equal(normalizePatternId('dots'), 'dots');

  const noneSvg = buildSVG({ ...base, pattern: 'none' }, { pre: 'pn' });
  assert.ok(!noneSvg.includes('<pattern'));

  for (const pat of AVATAR_PATTERNS.filter((p) => p.id !== 'none')) {
    const svg = buildSVG({ ...base, pattern: pat.id, patternOpacity: 0.14 }, { pre: `p_${pat.id}` });
    assert.ok(!svg.includes('NaN') && !svg.includes('undefined'));
    if (pat.id === 'rings') {
      assert.ok(svg.includes('r="165"'), 'rings pattern should render concentric circles');
    } else {
      assert.ok(svg.includes(`<pattern id="p_${pat.id}pat"`), `${pat.id} should render <pattern>`);
    }
  }
});

test('createRandomizedState randomizes style/palette/pattern/icon/font while preserving user text', () => {
  const base = { ...createDefaultState(), title: 'TEAM AI', sub: '2026' };
  let seed = 0.13;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const next = createRandomizedState(base, rng);
  assert.equal(next.title, 'TEAM AI');
  assert.equal(next.sub, '2026');
  assert.notEqual(next.bg, base.bg);
  assert.notEqual(next.font, base.font);
  assert.notEqual(next.icon, base.icon);

  const resolved = resolveThemedColors(next);
  const bgs = resolved.grad ? [resolved.bg, resolved.bg2] : [resolved.bg];
  const minText = Math.min(...bgs.map((b) => contrastRatio(resolved.text, b)));
  assert.ok(minText >= 4.5, `Randomized state text contrast ${minText.toFixed(2)} < 4.5`);

  const svg = buildSVG(next, { pre: 'rnd' });
  assert.ok(!svg.includes('NaN') && !svg.includes('undefined'));
});

test('MOBILE_QUICK_NAV_ITEMS covers preview + 7 sections and pickActiveNavSection resolves scroll position', () => {
  assert.equal(MOBILE_QUICK_NAV_ITEMS.length, 8);
  const ids = new Set(MOBILE_QUICK_NAV_ITEMS.map((item) => item.id));
  assert.equal(ids.size, 8);
  assert.ok(ids.has('section-preview'));
  assert.ok(ids.has('section-layout'));

  const measurements = [
    { id: 'section-preview' as const, top: -420, height: 600 },
    { id: 'section-template' as const, top: -120, height: 220 },
    { id: 'section-theme' as const, top: 110, height: 260 },
    { id: 'section-color' as const, top: 380, height: 420 },
    { id: 'section-patterns' as const, top: 820, height: 280 },
    { id: 'section-content' as const, top: 1120, height: 340 },
    { id: 'section-icon' as const, top: 1480, height: 460 },
    { id: 'section-layout' as const, top: 1960, height: 280 },
  ];

  assert.equal(pickActiveNavSection(measurements, { anchorY: 130 }), 'section-theme');
  assert.equal(
    pickActiveNavSection(measurements, { anchorY: 130, atBottom: true }),
    'section-layout'
  );
  assert.equal(
    pickActiveNavSection(
      measurements.map((m, idx) => ({ ...m, top: 200 + idx * 300 })),
      { anchorY: 130 }
    ),
    'section-preview'
  );
});
