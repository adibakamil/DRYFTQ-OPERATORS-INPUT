import type { EvidenceKind } from '../types';

export const kindOf = (mime: string): EvidenceKind | null => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return null;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const drawThumbnail = (source: CanvasImageSource, width: number, height: number): string => {
  const maxSide = 360;
  const scale = Math.min(maxSide / width, maxSide / height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) return '';
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
};

/** Creates a small persistent thumbnail so previews survive a page refresh. */
export async function makeThumbnail(file: File, kind: EvidenceKind): Promise<string | undefined> {
  const url = URL.createObjectURL(file);
  try {
    if (kind === 'image') {
      const image = await loadImage(url);
      return drawThumbnail(image, image.naturalWidth, image.naturalHeight);
    }
    if (kind === 'video') {
      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'auto';
      video.src = url;
      await new Promise<void>((resolve, reject) => {
        const done = () => resolve();
        video.addEventListener('loadeddata', done, { once: true });
        video.addEventListener('error', () => reject(new Error('video decode failed')), { once: true });
        window.setTimeout(done, 2500);
      });
      if (video.videoWidth && video.videoHeight) {
        return drawThumbnail(video, video.videoWidth, video.videoHeight);
      }
    }
  } catch {
    /* thumbnail is best-effort — the evidence record is still created */
  } finally {
    URL.revokeObjectURL(url);
  }
  return undefined;
}

export async function readDuration(file: File, kind: EvidenceKind): Promise<string | undefined> {
  if (kind === 'image') return undefined;
  const url = URL.createObjectURL(file);
  const media = document.createElement(kind === 'video' ? 'video' : 'audio');
  media.preload = 'metadata';
  media.src = url;

  try {
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      media.addEventListener('loadedmetadata', done, { once: true });
      media.addEventListener('error', done, { once: true });
      window.setTimeout(done, 2000);
    });
    if (!Number.isFinite(media.duration) || media.duration <= 0) return undefined;
    const seconds = Math.round(media.duration);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  } finally {
    URL.revokeObjectURL(url);
  }
}
