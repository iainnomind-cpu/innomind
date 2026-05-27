import React from 'react';

export type BrandVariant = 'dark' | 'light' | 'mono' | 'blue';
export type BrandSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BrandIconProps {
  variant?: BrandVariant;
  size?: BrandSize;
  glow?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 24,
  sm: 28,
  md: 44,
  lg: 52,
  xl: 72,
};

export function CoreIcon({ variant = 'dark', size = 'md', glow = false, className = '' }: BrandIconProps) {
  const pxSize = sizeMap[size];

  // Variants
  const isLight = variant === 'light';
  const isMono = variant === 'mono';
  const isBlue = variant === 'blue';

  const gradientId = `core-grad-${variant}-${size}`;

  // Color logic based on variant
  let ringColor1 = '#2563EB'; // core-blue
  let ringColor2 = '#38AAFF'; // core-signal
  let dotColor1 = '#38AAFF';
  let dotColor2 = '#72C8FF';
  let innerDot = '#F5F8FF';

  if (isLight) {
    ringColor1 = '#1D4ED8';
    ringColor2 = '#2563EB';
    dotColor1 = '#1D4ED8';
    dotColor2 = '#2563EB';
    innerDot = '#ffffff';
  } else if (isMono) {
    ringColor1 = '#F5F8FF';
    ringColor2 = '#F5F8FF';
    dotColor1 = '#F5F8FF';
    dotColor2 = '#F5F8FF';
    innerDot = '#0A0D14';
  } else if (isBlue) {
    ringColor1 = '#38AAFF';
    ringColor2 = '#72C8FF';
    dotColor1 = '#38AAFF';
    dotColor2 = '#72C8FF';
    innerDot = '#071230';
  }

  return (
    <div className={`relative flex-shrink-0 ${glow ? 'core-icon-glow' : ''} ${className}`} style={{ width: pxSize, height: pxSize }}>
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
        <defs>
          <linearGradient id={`${gradientId}-ring`} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={ringColor1} />
            <stop offset="100%" stopColor={ringColor2} />
          </linearGradient>
          <linearGradient id={`${gradientId}-dot`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={dotColor1} />
            <stop offset="100%" stopColor={dotColor2} />
          </linearGradient>
          {variant === 'dark' && (
            <filter id={`${gradientId}-blur`}>
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        <path
          d="M 41.5 13.5 A 22 22 0 1 0 41.5 38.5"
          stroke={`url(#${gradientId}-ring)`}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          filter={variant === 'dark' ? `url(#${gradientId}-blur)` : undefined}
          style={isMono ? { opacity: 0.9 } : {}}
        />

        <line x1="41.5" y1="13.5" x2="47" y2="13.5" stroke={`url(#${gradientId}-ring)`} strokeWidth="1.5" strokeLinecap="round" opacity={isMono ? 0.4 : 0.5} />
        <line x1="41.5" y1="38.5" x2="47" y2="38.5" stroke={`url(#${gradientId}-ring)`} strokeWidth="1.5" strokeLinecap="round" opacity={isMono ? 0.4 : 0.5} />

        <circle
          cx="26" cy="26" r="4.5"
          fill={isMono ? ringColor1 : `url(#${gradientId}-dot)`}
          filter={variant === 'dark' ? `url(#${gradientId}-blur)` : undefined}
          style={isMono ? { opacity: 0.9 } : {}}
        />
        <circle cx="26" cy="26" r="2" fill={innerDot} opacity="0.9" />
      </svg>
    </div>
  );
}
