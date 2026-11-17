import {
  FONTS,
  createDefaultState,
  normalizeFontId,
  normalizePatternId,
  normalizeThemeId,
} from '../data/avatarConstants';
import { normalizeIconId, resolveLucideIcon } from '../data/lucideIcons';
import type { AvatarState, ResolvedThemeColors } from '../types/avatar';
import { relativeLuminance } from './colorContrast';
import { resolveThemedColors } from './themeEngine';

const round2 = (n: number): number => Math.round(n * 100) / 100;
const round4 = (n: number): number => Math.round(n * 10000) / 10000;

export function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let cachedCtx: CanvasRenderingContext2D | null = null;
function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!cachedCtx) {
    const canvas = document.createElement('canvas');
    cachedCtx = canvas.getContext('2d');
  }
  return cachedCtx;
}

export interface TextMetrics {
  w: number;
  asc: number;
  desc: number;
}

export interface FontSpec {
  fam: string;
  w: number;
}

export function measureTextMetrics(
  text: string,
  font: FontSpec,
  size: number,
  trackEm: number
): TextMetrics {
  if (!text) return { w: 0, asc: 0, desc: 0 };
  const ctx = getCanvasContext();
  if (ctx) {
    ctx.font = `${font.w} ${size}px ${font.fam}`;
    const metrics = ctx.measureText(text);
    const asc = metrics.actualBoundingBoxAscent > 0 ? metrics.actualBoundingBoxAscent : size * 0.72;
    const desc = Math.max(0, metrics.actualBoundingBoxDescent || 0);
    return {
      w: metrics.width + trackEm * size * text.length,
      asc,
      desc,
    };
  }
  const charWidthFactor = font.w >= 800 ? 0.68 : 0.62;
  return {
    w: text.length * size * charWidthFactor + trackEm * size * text.length,
    asc: size * 0.72,
    desc: size * 0.16,
  };
}

export function fitTextSize(
  text: string,
  font: FontSpec,
  targetSize: number,
  trackEm: number,
  maxWidth: number,
  autoFit: boolean
): number {
  let size = targetSize;
  if (!autoFit || !text) return size;
  for (let i = 0; i < 3; i++) {
    const measured = measureTextMetrics(text, font, size, trackEm);
    if (measured.w <= maxWidth || measured.w <= 0) break;
    size = ((size * maxWidth) / measured.w) * 0.995;
  }
  return size;
}

function renderTextElement(
  txt: string,
  font: FontSpec,
  size: number,
  trackEm: number,
  x: number,
  y: number,
  fill: string
): string {
  if (!txt) return '';
  const tracking = trackEm * size;
  return `<text x="${round2(x + tracking / 2)}" y="${round2(y)}" text-anchor="middle" font-family="${escapeXml(
    font.fam
  )}" font-weight="${font.w}" font-size="${round2(size)}" letter-spacing="${round2(
    tracking
  )}" fill="${escapeXml(fill)}">${escapeXml(txt)}</text>`;
}

export function getIconDimensions(state: AvatarState): { w: number; h: number } | null {
  if (state.icon === 'none') return null;
  if (state.icon === 'upload') {
    if (!state.img) return null;
    const aspect = state.imgAspect || 1;
    const size = state.iconSize;
    return aspect <= 1 ? { w: size, h: size * aspect } : { w: size / aspect, h: size };
  }
  const entry = resolveLucideIcon(state.icon);
  if (!entry) return null;
  return { w: state.iconSize, h: state.iconSize };
}

export function renderIconSvg(
  state: Pick<
    AvatarState,
    'icon' | 'iconSize' | 'iconStroke' | 'img' | 'imgAspect' | 'imgCircle'
  >,
  prefix: string,
  cx: number,
  cy: number,
  color: string,
  opacity: number,
  filterAttr: string = ''
): string {
  const dims = getIconDimensions(state as AvatarState);
  if (!dims) return '';
  const opAttr = opacity < 1 ? ` opacity="${round2(opacity)}"` : '';

  if (state.icon === 'upload' && state.img) {
    const clipId = `${prefix}ic`;
    const clip = state.imgCircle
      ? `<clipPath id="${clipId}"><circle cx="${round2(cx)}" cy="${round2(cy)}" r="${round2(
          Math.min(dims.w, dims.h) / 2
        )}"/></clipPath>`
      : '';
    return `${clip}<image href="${escapeXml(state.img)}" xlink:href="${escapeXml(
      state.img
    )}" x="${round2(cx - dims.w / 2)}" y="${round2(cy - dims.h / 2)}" width="${round2(
      dims.w
    )}" height="${round2(dims.h)}" preserveAspectRatio="xMidYMid ${
      state.imgCircle ? 'slice' : 'meet'
    }"${state.imgCircle ? ` clip-path="url(#${clipId})"` : ''}${opAttr}/>`;
  }

  const entry = resolveLucideIcon(state.icon);
  if (!entry) return '';

  // Lucide icons use a standard 24x24 viewBox
  const scale = state.iconSize / 24;
  const tx = cx - (24 * scale) / 2;
  const ty = cy - (24 * scale) / 2;

  const innerGroup = `<g transform="translate(${round2(tx)} ${round2(ty)}) scale(${round4(
    scale
  )})" fill="none" stroke="${escapeXml(color)}" stroke-width="${round2(
    state.iconStroke
  )}" stroke-linecap="round" stroke-linejoin="round"${opAttr}>${entry.svgInner}</g>`;

  return filterAttr ? `<g${filterAttr}>${innerGroup}</g>` : innerGroup;
}

interface StackItem {
  k: 'i' | 't' | 's' | 'b';
  h?: number;
  asc?: number;
  desc?: number;
  top?: number;
  base?: number;
}

function stackLayout(items: StackItem[], gapFn: (prev: StackItem, next: StackItem) => number): number {
  let cursor = 0;
  let prev: StackItem | null = null;
  for (const item of items) {
    if (prev) cursor += gapFn(prev, item);
    item.top = cursor;
    if (item.h != null) {
      cursor += item.h;
    } else {
      item.base = cursor + (item.asc ?? 0);
      cursor = item.base + (item.desc ?? 0);
    }
    prev = item;
  }
  return cursor;
}

interface PairedFontSpecs {
  titleFont: FontSpec;
  subFont: FontSpec;
}

function layoutA(
  state: AvatarState,
  resolved: ResolvedThemeColors,
  pre: string,
  fonts: PairedFontSpecs,
  title: string,
  sub: string,
  _defs: string[],
  body: string[],
  glowAttr: string
): void {
  const tr = state.track / 100;
  const g = state.gap;
  const ts = fitTextSize(title, fonts.titleFont, state.titleSize, tr, 720, state.fit);
  const ss = fitTextSize(sub, fonts.subFont, state.subSize, tr, 560, state.fit);
  const mt = measureTextMetrics(title, fonts.titleFont, ts, tr);
  const ms = measureTextMetrics(sub, fonts.subFont, ss, tr);
  const dim = getIconDimensions(state);

  const items: StackItem[] = [];
  if (dim) items.push({ k: 'i', h: dim.h });
  if (title) items.push({ k: 't', asc: mt.asc, desc: mt.desc });
  if (sub) items.push({ k: 's', asc: ms.asc, desc: ms.desc });

  const totalHeight = stackLayout(items, (prev, next) => {
    if (prev.k === 'i') return (next.k === 't' ? 0.22 * ts : 0.32 * ss) * g;
    return 0.38 * ss * g;
  });

  const y0 = 512 + state.dy - totalHeight / 2;
  for (const item of items) {
    if (item.k === 'i') {
      body.push(
        renderIconSvg(
          state,
          pre,
          512,
          y0 + (item.top ?? 0) + (item.h ?? 0) / 2 + state.iconDy,
          resolved.accent,
          state.iconOpacity,
          glowAttr
        )
      );
    } else if (item.k === 't') {
      body.push(
        renderTextElement(title, fonts.titleFont, ts, tr, 512, y0 + (item.base ?? 0), resolved.text)
      );
    } else {
      body.push(
        renderTextElement(sub, fonts.subFont, ss, tr, 512, y0 + (item.base ?? 0), resolved.accent)
      );
    }
  }
}

function layoutB(
  state: AvatarState,
  resolved: ResolvedThemeColors,
  pre: string,
  fonts: PairedFontSpecs,
  title: string,
  sub: string,
  _defs: string[],
  body: string[],
  glowAttr: string
): void {
  const tr = state.track / 100;
  const g = state.gap;
  const ts = fitTextSize(title, fonts.titleFont, state.titleSize, tr, 720, state.fit);
  const ss = fitTextSize(sub, fonts.subFont, state.subSize, tr, 560, state.fit);
  const mt = measureTextMetrics(title, fonts.titleFont, ts, tr);
  const ms = measureTextMetrics(sub, fonts.subFont, ss, tr);

  body.push(
    renderIconSvg(
      state,
      pre,
      512,
      512 + state.iconDy,
      resolved.accent,
      state.iconOpacity,
      state.iconOpacity >= 0.4 ? glowAttr : ''
    )
  );

  const items: StackItem[] = [];
  if (title) items.push({ k: 't', asc: mt.asc, desc: mt.desc });
  if (title && sub) items.push({ k: 'b', h: Math.max(10, ts * 0.045) });
  if (sub) items.push({ k: 's', asc: ms.asc, desc: ms.desc });

  const totalHeight = stackLayout(items, (prev) =>
    prev.k === 't' ? 0.22 * ts * g : 0.28 * ss * g
  );

  const y0 = 512 + state.dy - totalHeight / 2;
  for (const item of items) {
    if (item.k === 't') {
      body.push(
        renderTextElement(title, fonts.titleFont, ts, tr, 512, y0 + (item.base ?? 0), resolved.text)
      );
    } else if (item.k === 's') {
      body.push(
        renderTextElement(sub, fonts.subFont, ss, tr, 512, y0 + (item.base ?? 0), resolved.accent)
      );
    } else {
      const barWidth = Math.min(mt.w * 0.45, 260);
      const h = item.h ?? 10;
      body.push(
        `<rect x="${round2(512 - barWidth / 2)}" y="${round2(y0 + (item.top ?? 0))}" width="${round2(
          barWidth
        )}" height="${round2(h)}" rx="${round2(h / 2)}" fill="${escapeXml(resolved.accent)}"${glowAttr}/>`
      );
    }
  }
}

function layoutC(
  state: AvatarState,
  resolved: ResolvedThemeColors,
  pre: string,
  fonts: PairedFontSpecs,
  title: string,
  sub: string,
  defs: string[],
  body: string[],
  glowAttr: string
): void {
  const tr = state.track / 100;
  const RO = 432;
  const PAD = 34;
  const rmGuess = RO - (Math.max(state.titleSize, state.subSize) * 0.72 + PAD * 2) / 2;
  const ts = fitTextSize(title, fonts.titleFont, state.titleSize, tr, 2.4 * rmGuess, state.fit);
  const ss = fitTextSize(sub, fonts.subFont, state.subSize, tr, 2.4 * rmGuess, state.fit);
  const mt = measureTextMetrics(title, fonts.titleFont, ts, tr);
  const ms = measureTextMetrics(sub, fonts.subFont, ss, tr);

  const ascMax = Math.max(title ? mt.asc : 0, sub ? ms.asc : 0);
  const descMax = Math.max(title ? mt.desc : 0, sub ? ms.desc : 0);
  const band = Math.max(60, ascMax + descMax + PAD * 2);
  const RI = RO - band;

  const ringPath = (rad: number) =>
    `M512 ${round2(512 - rad)}a${round2(rad)} ${round2(rad)} 0 1 0 0 ${round2(
      2 * rad
    )}a${round2(rad)} ${round2(rad)} 0 1 0 0 ${round2(-2 * rad)}z`;

  const isLightBg = relativeLuminance(resolved.bg) > 0.5;
  const bandOpacity = isLightBg ? '.07' : '.2';
  body.push(
    `<path d="${ringPath(RO)} ${ringPath(RI)}" fill="#000" fill-opacity="${bandOpacity}" fill-rule="evenodd"/>`
  );
  body.push(
    `<circle cx="512" cy="512" r="${round2(RI)}" fill="none" stroke="${escapeXml(
      resolved.accent
    )}" stroke-width="6" stroke-opacity=".9"${glowAttr}/>`
  );

  const rmid = (RI + RO) / 2;
  body.push(
    `<circle cx="${round2(512 - rmid)}" cy="512" r="11" fill="${escapeXml(
      resolved.accent
    )}"/><circle cx="${round2(512 + rmid)}" cy="512" r="11" fill="${escapeXml(resolved.accent)}"/>`
  );

  const addArcText = (
    txt: string,
    fontSpec: FontSpec,
    size: number,
    rb: number,
    top: boolean,
    fill: string,
    id: string
  ) => {
    if (!txt) return;
    const pathD = top
      ? `M${round2(512 - rb)} 512A${round2(rb)} ${round2(rb)} 0 0 1 ${round2(512 + rb)} 512`
      : `M${round2(512 - rb)} 512A${round2(rb)} ${round2(rb)} 0 0 0 ${round2(512 + rb)} 512`;
    defs.push(`<path id="${id}" d="${pathD}"/>`);
    const tracking = tr * size;
    const startOffset = (Math.PI * rb) / 2 + tracking / 2;
    body.push(
      `<text font-family="${escapeXml(fontSpec.fam)}" font-weight="${fontSpec.w}" font-size="${round2(
        size
      )}" letter-spacing="${round2(tracking)}" fill="${escapeXml(fill)}"><textPath href="#${id}" xlink:href="#${id}" startOffset="${round2(
        startOffset
      )}" text-anchor="middle">${escapeXml(txt)}</textPath></text>`
    );
  };

  addArcText(title, fonts.titleFont, ts, RI + PAD + descMax, true, resolved.text, `${pre}pt`);
  addArcText(sub, fonts.subFont, ss, RO - PAD - descMax, false, resolved.accent, `${pre}pb`);

  const fittedState: AvatarState = {
    ...state,
    iconSize: state.fit ? Math.min(state.iconSize, RI * 1.5) : state.iconSize,
  };
  body.push(
    renderIconSvg(
      fittedState,
      pre,
      512,
      512 + state.iconDy,
      resolved.accent,
      state.iconOpacity,
      glowAttr
    )
  );
}

export interface BuildSvgOptions {
  pre?: string;
  size?: number;
  meta?: boolean;
}

export function buildSVG(state: AvatarState, options: BuildSvgOptions = {}): string {
  const pre = options.pre ?? 'a';
  const fontId = normalizeFontId(state.font);
  const fontEntry = FONTS[fontId];
  const fonts: PairedFontSpecs = {
    titleFont: { fam: fontEntry.titleFam, w: fontEntry.titleWeight },
    subFont: { fam: fontEntry.subFam, w: fontEntry.subWeight },
  };
  const resolved = resolveThemedColors(state);
  const title = state.upper ? state.title.toUpperCase() : state.title;
  const sub = state.upper ? state.sub.toUpperCase() : state.sub;

  const defs: string[] = [];
  const body: string[] = [];
  let fill = escapeXml(resolved.bg);

  if (resolved.grad) {
    const angleRad = (resolved.gradAngle * Math.PI) / 180;
    const x1 = 0.5 - 0.5 * Math.sin(angleRad);
    const y1 = 0.5 + 0.5 * Math.cos(angleRad);
    const x2 = 0.5 + 0.5 * Math.sin(angleRad);
    const y2 = 0.5 - 0.5 * Math.cos(angleRad);
    defs.push(
      `<linearGradient id="${pre}bg" x1="${round4(x1)}" y1="${round4(y1)}" x2="${round4(
        x2
      )}" y2="${round4(y2)}"><stop offset="0" stop-color="${escapeXml(
        resolved.bg
      )}"/><stop offset="1" stop-color="${escapeXml(resolved.bg2)}"/></linearGradient>`
    );
    fill = `url(#${pre}bg)`;
  }

  let glowAttr = '';
  if (resolved.glow) {
    defs.push(
      `<filter id="${pre}glow" filterUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    );
    glowAttr = ` filter="url(#${pre}glow)"`;
  }

  body.push(`<rect width="1024" height="1024" fill="${fill}"/>`);

  if (resolved.spotlight) {
    defs.push(
      `<radialGradient id="${pre}spot" cx="32%" cy="24%" r="65%"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/><stop offset="0.6" stop-color="#FFFFFF" stop-opacity="0.05"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`
    );
    body.push(`<rect width="1024" height="1024" fill="url(#${pre}spot)"/>`);
  }

  const patternId = normalizePatternId(state.pattern);
  if (patternId !== 'none') {
    const patOp = round2(Math.max(0.02, Math.min(0.4, state.patternOpacity ?? 0.12)));
    const isLight = relativeLuminance(resolved.bg) > 0.5;
    const patColor = isLight ? '#0F172A' : resolved.glow ? resolved.accent : '#FFFFFF';
    const patId = `${pre}pat`;

    if (patternId === 'dots') {
      defs.push(
        `<pattern id="${patId}" width="48" height="48" patternUnits="userSpaceOnUse"><circle cx="24" cy="24" r="3.5" fill="${escapeXml(
          patColor
        )}" fill-opacity="${patOp}"/></pattern>`
      );
      body.push(`<rect width="1024" height="1024" fill="url(#${patId})"/>`);
    } else if (patternId === 'grid') {
      defs.push(
        `<pattern id="${patId}" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M 64 0 L 0 0 0 64" fill="none" stroke="${escapeXml(
          patColor
        )}" stroke-width="2" stroke-opacity="${patOp}"/></pattern>`
      );
      body.push(`<rect width="1024" height="1024" fill="url(#${patId})"/>`);
    } else if (patternId === 'stripes') {
      defs.push(
        `<pattern id="${patId}" width="36" height="36" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="36" stroke="${escapeXml(
          patColor
        )}" stroke-width="6" stroke-opacity="${patOp}"/></pattern>`
      );
      body.push(`<rect width="1024" height="1024" fill="url(#${patId})"/>`);
    } else if (patternId === 'cross') {
      defs.push(
        `<pattern id="${patId}" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M32 25v14M25 32h14" fill="none" stroke="${escapeXml(
          patColor
        )}" stroke-width="2.5" stroke-linecap="round" stroke-opacity="${patOp}"/></pattern>`
      );
      body.push(`<rect width="1024" height="1024" fill="url(#${patId})"/>`);
    } else if (patternId === 'rings') {
      for (const r of [165, 265, 365]) {
        body.push(
          `<circle cx="512" cy="512" r="${r}" fill="none" stroke="${escapeXml(
            patColor
          )}" stroke-width="2.5" stroke-opacity="${patOp}"/>`
        );
      }
    }
  }

  if (state.ringOn && state.ringW > 0) {
    body.push(
      `<circle cx="512" cy="512" r="470" fill="none" stroke="${escapeXml(
        resolved.ring
      )}" stroke-width="${round2(state.ringW)}"${glowAttr}/>`
    );
    if (resolved.doubleRing) {
      const innerR = Math.max(360, 470 - state.ringW / 2 - 18);
      body.push(
        `<circle cx="512" cy="512" r="${round2(innerR)}" fill="none" stroke="${escapeXml(
          resolved.accent
        )}" stroke-width="4" stroke-opacity="0.4"/>`
      );
    }
  }

  if (state.tpl === 'B') {
    layoutB(state, resolved, pre, fonts, title, sub, defs, body, glowAttr);
  } else if (state.tpl === 'C') {
    layoutC(state, resolved, pre, fonts, title, sub, defs, body, glowAttr);
  } else {
    layoutA(state, resolved, pre, fonts, title, sub, defs, body, glowAttr);
  }

  let meta = '';
  if (options.meta) {
    const cfg: Record<string, unknown> = {
      ...state,
      font: fontId,
      theme: normalizeThemeId(state.theme),
      pattern: patternId,
      icon: normalizeIconId(state.icon),
    };
    delete cfg.img;
    cfg.hasImg = Boolean(state.img);
    meta = `<title>${escapeXml(state.title || 'Avatar')}</title><metadata id="avatar-maker-config">${escapeXml(
      JSON.stringify(cfg)
    )}</metadata>`;
  }

  const sizeAttr = options.size ? ` width="${options.size}" height="${options.size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"${sizeAttr}>${meta}<defs>${defs.join(
    ''
  )}</defs>${body.join('')}</svg>`;
}

export function buildSvgDataUrl(state: AvatarState, size: number = 1024): string {
  const svg = buildSVG(state, { pre: 'e', meta: true, size });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function slugifyTitle(title: string): string {
  return (
    (title || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'avatar'
  );
}

export function formatVietnamTimestamp(nowMs: number = Date.now()): string {
  const date = new Date(nowMs + 7 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate()
  )}_${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
}

export function formatAppVersion(nowMs: number = Date.now()): string {
  return `v${formatVietnamTimestamp(nowMs)}`;
}

export function buildExportBaseName(title: string, nowMs?: number): string {
  return `avatar_${slugifyTitle(title)}_${formatVietnamTimestamp(nowMs)}`;
}

export function parseImportedSVG(svgText: string): {
  ok: true;
  state: AvatarState;
} | {
  ok: false;
  error: string;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const meta = doc.getElementById('avatar-maker-config') ?? doc.querySelector('metadata');
    if (!meta || !meta.textContent) {
      return {
        ok: false,
        error: 'File SVG này không do Avatar Maker tạo ra nên không đọc được cấu hình.',
      };
    }
    const cfg = JSON.parse(meta.textContent) as Partial<AvatarState> & { hasImg?: boolean };
    const imageEl = doc.querySelector('image');
    const href = imageEl
      ? imageEl.getAttribute('href') ||
        imageEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      : null;
    const hasImg = Boolean(cfg.hasImg);
    delete cfg.hasImg;

    const merged: AvatarState = {
      ...createDefaultState(),
      ...cfg,
      font: normalizeFontId(cfg.font),
      theme: normalizeThemeId(cfg.theme),
      pattern: normalizePatternId(cfg.pattern),
      icon: normalizeIconId(cfg.icon ?? 'messages-square'),
      img: hasImg && href ? href : null,
    };
    return { ok: true, state: merged };
  } catch {
    return { ok: false, error: 'Không đọc được file SVG này.' };
  }
}
