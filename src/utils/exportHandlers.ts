import type { AvatarState } from '../types/avatar';
import { buildExportBaseName, buildSVG } from './svgEngine';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 1500);
}

async function renderAvatarCanvas(
  state: AvatarState,
  size: number,
  round: boolean
): Promise<HTMLCanvasElement> {
  const svg = buildSVG(state, { pre: 'x', size: 1024 });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Không thể render SVG sang ảnh PNG'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ Canvas 2D');
  }

  if (round) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
}

export async function renderPngBlob(
  state: AvatarState,
  size: number,
  round: boolean
): Promise<Blob> {
  const canvas = await renderAvatarCanvas(state, size, round);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Không tạo được file PNG'));
    }, 'image/png');
  });
}

export async function buildPngDataUrl(
  state: AvatarState,
  size: number,
  round: boolean
): Promise<string> {
  const canvas = await renderAvatarCanvas(state, size, round);
  return canvas.toDataURL('image/png');
}

export async function copyAvatarPngToClipboard(
  state: AvatarState,
  size: number,
  round: boolean
): Promise<void> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.write !== 'function' ||
    typeof ClipboardItem === 'undefined'
  ) {
    throw new Error('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp vào clipboard.');
  }

  // Pass the Blob promise directly into ClipboardItem to preserve user-gesture activation
  const item = new ClipboardItem({
    'image/png': renderPngBlob(state, size, round),
  });
  await navigator.clipboard.write([item]);
}

export async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== 'function'
  ) {
    throw new Error('Trình duyệt không hỗ trợ sao chép văn bản vào clipboard.');
  }

  await navigator.clipboard.writeText(dataUrl);
}

export function exportAvatarSvg(state: AvatarState): string {
  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + buildSVG(state, { pre: 'e', meta: true, size: 1024 });
  const filename = `${buildExportBaseName(state.title)}.svg`;
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), filename);
  return filename;
}

export function readUploadedImage(
  file: File
): Promise<{ dataUrl: string; aspect: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được ảnh này.'));
    reader.onload = () => {
      const url = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('Không đọc được ảnh này.'));
      img.onload = () => {
        const naturalW = img.naturalWidth || 1;
        const naturalH = img.naturalHeight || 1;
        if (file.type === 'image/svg+xml') {
          resolve({ dataUrl: url, aspect: naturalH / naturalW });
          return;
        }
        const scale = Math.min(1, 640 / Math.max(naturalW, naturalH));
        const width = Math.max(1, Math.round(naturalW * scale));
        const height = Math.max(1, Math.round(naturalH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Không xử lý được ảnh.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve({ dataUrl: canvas.toDataURL('image/png'), aspect: height / width });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}
