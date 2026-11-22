import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'default' | 'lg' | 'sm';
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconAfter?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  block = false,
  loading = false,
  icon,
  iconAfter,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'default' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      {children}
      {!loading && iconAfter}
    </button>
  );
}
