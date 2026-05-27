import React from 'react';
import { CoreIcon, BrandVariant, BrandSize } from './CoreIcon';

interface CoreLogoProps {
  variant?: BrandVariant;
  size?: BrandSize;
  showBy?: boolean;
  className?: string;
  glow?: boolean;
}

export function CoreLogo({ variant = 'dark', size = 'md', showBy = true, glow = false, className = '' }: CoreLogoProps) {
  const isLight = variant === 'light';
  const isMono = variant === 'mono';
  const isBlue = variant === 'blue';

  let nameColor = 'text-white';
  let eColor = 'text-[#38AAFF] font-light';
  let byColor = 'text-[#8A9BBF]';

  if (isLight) {
    nameColor = 'text-[#0A1628]';
    eColor = 'text-[#2563EB] font-light';
    byColor = 'text-[#8A9BBF]';
  } else if (isMono) {
    nameColor = 'text-white';
    eColor = 'text-white font-semibold';
    byColor = 'text-white/40';
  } else if (isBlue) {
    nameColor = 'text-[#38AAFF]';
    eColor = 'text-white font-light';
    byColor = 'text-[#38AAFF]/50';
  }

  // Size specific styles
  const sizeStyles = {
    xs: { gap: 'gap-2', name: 'text-xl', by: 'text-[7px] tracking-[2px]' },
    sm: { gap: 'gap-3', name: 'text-2xl', by: 'text-[8px] tracking-[3px]' },
    md: { gap: 'gap-4', name: 'text-[38px] tracking-tight leading-none', by: 'text-[9px] tracking-[4px]' },
    lg: { gap: 'gap-6', name: 'text-[52px] tracking-tighter leading-none', by: 'text-[10px] tracking-[4px]' },
    xl: { gap: 'gap-7', name: 'text-[64px] tracking-tighter leading-none', by: 'text-[11px] tracking-[5px]' },
  };

  const s = sizeStyles[size];

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <CoreIcon variant={variant} size={size} glow={glow} />
      <div className="flex flex-col gap-0.5 justify-center mt-1">
        <div className={`font-brand font-semibold ${nameColor} ${s.name}`}>
          Cor<span className={eColor}>ē</span>
        </div>
        {showBy && (
          <div className={`uppercase ${byColor} ${s.by} pl-0.5`}>
            by Innomind
          </div>
        )}
      </div>
    </div>
  );
}
