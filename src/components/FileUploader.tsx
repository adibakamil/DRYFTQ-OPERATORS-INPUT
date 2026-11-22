import { AudioLines, FileImage, Film, ImagePlus, LoaderCircle, Play, X } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  EVIDENCE_ACCEPT,
  formatBytes,
  MAX_FILE_SIZE,
  MAX_FILES,
} from '../data/reference';
import { kindOf, makeThumbnail, readDuration } from '../services/media';
import { uid } from '../services/storage';
import type { EvidenceItem } from '../types';

interface FileUploaderProps {
  value: EvidenceItem[];
  onChange: (items: EvidenceItem[]) => void;
  onNotify: (tone: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export function FileUploader({ value, onChange, onNotify }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const addFiles = async (files: File[]) => {
    if (!files.length) return;
    if (value.length + files.length > MAX_FILES) {
      onNotify('warning', 'File limit reached', `You can attach up to ${MAX_FILES} files per submission.`);
    }

    const available = MAX_FILES - value.length;
    if (available <= 0) return;

    const accepted: { file: File; kind: NonNullable<ReturnType<typeof kindOf>> }[] = [];
    const rejected: string[] = [];

    files.slice(0, available).forEach((file) => {
      const kind = kindOf(file.type);
      if (!kind) rejected.push(`${file.name} — unsupported format`);
      else if (file.size > MAX_FILE_SIZE) rejected.push(`${file.name} — exceeds 10 MB`);
      else if (file.size === 0) rejected.push(`${file.name} — file is empty`);
      else accepted.push({ file, kind });
    });

    if (rejected.length) {
      onNotify('error', `${rejected.length} file${rejected.length > 1 ? 's' : ''} rejected`, rejected.join(' • '));
    }
    if (!accepted.length) return;

    setProcessing(true);
    try {
      const created: EvidenceItem[] = await Promise.all(
        accepted.map(async ({ file, kind }) => ({
          id: uid('ev'),
          name: file.name,
          mime: file.type,
          size: file.size,
          kind,
          thumbnail: await makeThumbnail(file, kind),
          durationLabel: await readDuration(file, kind),
        })),
      );
      onChange([...value, ...created]);
      onNotify(
        'success',
        `${created.length} evidence file${created.length > 1 ? 's' : ''} attached`,
        'Previews are stored locally with this draft.',
      );
    } catch {
      onNotify('error', 'Could not process files', 'Please try again with smaller files.');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        className="sr-only"
        id="evidence-input"
        type="file"
        multiple
        accept={EVIDENCE_ACCEPT}
        onChange={(event) => void addFiles(Array.from(event.target.files ?? []))}
      />

      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload evidence files. Drag and drop or press Enter to browse."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <div className="dropzone__icon">
          {processing ? (
            <LoaderCircle className="spin" size={26} />
          ) : (
            <ImagePlus size={26} strokeWidth={1.8} />
          )}
        </div>
        <strong>{processing ? 'Processing files…' : 'Drag & drop files here'}</strong>
        <span>or click to browse from your device</span>
        <small>
          JPG • PNG • WEBP • MP4 • WEBM • MP3 • WAV • MAX 10 MB • {MAX_FILES} FILES
        </small>
      </div>

      {value.length > 0 && (
        <div className="evidence-grid">
          {value.map((item) => (
            <article className="evidence-card" key={item.id}>
              {item.thumbnail ? (
                <img className="evidence-card__media" src={item.thumbnail} alt={item.name} />
              ) : (
                <div className="evidence-card__placeholder">
                  {item.kind === 'audio' ? <AudioLines size={30} /> : <Film size={30} />}
                </div>
              )}
              {item.kind === 'video' && (
                <span className="evidence-card__play">
                  <Play size={15} fill="currentColor" />
                </span>
              )}
              <button
                className="evidence-card__remove"
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => onChange(value.filter((current) => current.id !== item.id))}
              >
                <X size={14} strokeWidth={2.6} />
              </button>
              <div className="evidence-card__meta">
                <strong title={item.name}>{item.name}</strong>
                <span>
                  {item.kind === 'image' ? 'IMAGE' : item.kind === 'video' ? 'VIDEO' : 'AUDIO'} •{' '}
                  {formatBytes(item.size)}
                  {item.durationLabel ? ` • ${item.durationLabel}` : ''}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {value.length === 0 && !processing && (
        <p className="field__hint" style={{ marginTop: 12 }}>
          <FileImage size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />
          No evidence attached yet. Photos, video clips and voice notes are supported.
        </p>
      )}

      {processing && (
        <p className="sr-only" role="status">
          Processing evidence files
        </p>
      )}
    </div>
  );
}
