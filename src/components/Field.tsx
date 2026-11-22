import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, required, hint, error, children, className = '' }: FieldProps) {
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      {htmlFor ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      ) : (
        <span className="field__label">
          {label}
          {required && <span className="field__required">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="field__error" role="alert">
          <CircleAlert size={13} /> {error}
        </span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
