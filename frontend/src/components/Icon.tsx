import type { CSSProperties } from 'react';

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
}

/** Thin wrapper around the Material Symbols Outlined webfont used throughout the Stitch design. */
export function Icon({ name, className, filled, style }: IconProps) {
  return (
    <span
      className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
      style={{ ...(filled ? { fontVariationSettings: '"FILL" 1' } : undefined), ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
