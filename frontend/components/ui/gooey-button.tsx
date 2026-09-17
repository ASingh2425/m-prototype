// gooey-button.tsx
import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface GooeyButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export function GooeyButton({
  label = 'Check it out',
  onClick,
  className = '',
  id = 'fable-cta-button',
}: GooeyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Hidden SVG Filter Definition for the Liquid / Goo Merge Effect */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="gooey-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 0.38 0 0 0
                0 0 0.25 0 0
                0 0 0 19 -8
              "
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <button
        id={id}
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="group relative flex items-center justify-center px-8 py-3.5 rounded-full overflow-hidden transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#C6613F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060608] cursor-pointer"
        style={{
          border: '1.5px solid rgba(198, 97, 63, 0.65)',
          boxShadow: isHovered
            ? '0 0 28px -2px rgba(198, 97, 63, 0.45), inset 0 0 14px rgba(198, 97, 63, 0.25)'
            : '0 0 12px -4px rgba(198, 97, 63, 0.15)',
        }}
      >
        {/* Gooey Liquid Container */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-full"
          style={{ filter: 'url(#gooey-filter)' }}
        >
          {/* Base pill background */}
          <div
            className="absolute inset-0 w-full h-full transition-colors duration-300"
            style={{
              backgroundColor: isHovered ? '#C6613F' : 'transparent',
            }}
          />

          {/* Liquid Blob 1 (expands from right/center with liquid spring ease) */}
          <div
            className="absolute rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              width: '180px',
              height: '180px',
              top: '-60px',
              right: '-40px',
              background: 'linear-gradient(135deg, #C6613F 0%, #9E4324 100%)',
              transform: isHovered ? 'scale(1.9)' : 'scale(0)',
              transformOrigin: 'center center',
            }}
          />

          {/* Secondary Liquid Blob 2 for organic gooey fluid feel */}
          <div
            className="absolute rounded-full transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-75"
            style={{
              width: '120px',
              height: '120px',
              bottom: '-40px',
              left: '-20px',
              background: 'linear-gradient(135deg, #E07B57 0%, #C6613F 100%)',
              transform: isHovered ? 'scale(2.1)' : 'scale(0)',
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Subtle inner highlight sweep */}
        <div
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-300 pointer-events-none"
          style={{ opacity: isHovered ? 1 : 0.2 }}
        />

        {/* Button Content: Inverts to near-black (#08080a) on hover as liquid fills */}
        <span
          className="relative z-10 flex items-center gap-2.5 text-sm font-semibold tracking-wide transition-colors duration-300 select-none"
          style={{
            color: isHovered ? '#09090b' : '#C6613F',
          }}
        >
          <span>{label}</span>
          <ArrowRight
            className={`w-4 h-4 transition-transform duration-300 ease-out ${
              isHovered ? 'translate-x-1' : ''
            }`}
            style={{
              color: isHovered ? '#09090b' : '#C6613F',
            }}
          />
        </span>
      </button>
    </div>
  );
}
