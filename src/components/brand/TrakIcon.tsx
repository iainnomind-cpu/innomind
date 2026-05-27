import React from 'react';
import { BrandVariant, BrandSize } from './CoreIcon';

export function TrakIcon({ variant = 'dark', size = 'md', glow = false, className = '' }: { variant?: BrandVariant, size?: BrandSize, glow?: boolean, className?: string }) {
  const sizeMap = {
    xs: 24,
    sm: 28,
    md: 44,
    lg: 52,
    xl: 72,
  };
  
  const pxSize = sizeMap[size];

  // Variants
  const isLight = variant === 'light';
  const isMono = variant === 'mono';
  const isBlue = variant === 'blue';

  const gradientId = `trak-grad-${variant}-${size}`;

  // Purple palette for Trak
  let ringColor1 = '#9333EA'; // trak-primary (purple-600)
  let ringColor2 = '#C084FC'; // trak-signal (purple-400)
  let centerColor1 = '#C084FC';
  let centerColor2 = '#F3E8FF';
  let innerDot = '#F5F8FF';

  if (isLight) {
    ringColor1 = '#7E22CE'; // purple-700
    ringColor2 = '#9333EA'; // purple-600
    centerColor1 = '#9333EA';
    centerColor2 = '#A855F7';
    innerDot = '#ffffff';
  } else if (isMono) {
    ringColor1 = '#F5F8FF';
    ringColor2 = '#F5F8FF';
    centerColor1 = '#F5F8FF';
    centerColor2 = '#F5F8FF';
    innerDot = '#0A0D14';
  } else if (isBlue) { // using purple instead of blue here despite variant name
    ringColor1 = '#C084FC';
    ringColor2 = '#E9D5FF';
    centerColor1 = '#C084FC';
    centerColor2 = '#E9D5FF';
    innerDot = '#170F2E';
  }

  return (
    <div className={`relative flex-shrink-0 ${glow ? 'trak-icon-glow' : ''} ${className}`} style={{ width: pxSize, height: pxSize }}>
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
        <defs>
          <linearGradient id={`${gradientId}-ring`} x1="0" y1="52" x2="52" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={ringColor1} />
            <stop offset="100%" stopColor={ringColor2} />
          </linearGradient>
          <linearGradient id={`${gradientId}-center`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={centerColor1} />
            <stop offset="100%" stopColor={centerColor2} />
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

        {/* Trak Icon: Two overlapping arcs creating a tracking/path feeling */}
        <path
          d="M 13.5 38.5 A 22 22 0 0 1 38.5 13.5"
          stroke={`url(#${gradientId}-ring)`}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          filter={variant === 'dark' ? `url(#${gradientId}-blur)` : undefined}
          style={isMono ? { opacity: 0.9 } : {}}
        />
        <path
          d="M 38.5 38.5 A 22 22 0 0 0 13.5 13.5"
          stroke={`url(#${gradientId}-ring)`}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity={isMono ? 0.4 : 0.6}
        />

        {/* Three dots representing steps/progress in Trak */}
        <circle cx="26" cy="26" r="4.5" fill={isMono ? ringColor1 : `url(#${gradientId}-center)`} filter={variant === 'dark' ? `url(#${gradientId}-blur)` : undefined} style={isMono ? { opacity: 0.9 } : {}} />
        <circle cx="26" cy="26" r="2" fill={innerDot} opacity="0.9" />
        
        <circle cx="15" cy="15" r="2.5" fill={isMono ? ringColor1 : `url(#${gradientId}-center)`} opacity="0.8" />
        <circle cx="37" cy="37" r="2.5" fill={isMono ? ringColor1 : `url(#${gradientId}-center)`} opacity="0.8" />
      </svg>
    </div>
  );
}
