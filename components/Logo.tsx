'use client';

import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10 md:h-12',
    lg: 'h-16 md:h-20',
  }[size];

  if (imageError) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-xl text-white tracking-widest shadow-inner">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4l8 16 8-16" />
            <path d="M12 10l-4-4" />
            <path d="M12 10l4-4" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-black tracking-widest text-white leading-none">
            VISIONARY
          </span>
          <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase mt-0.5">
            BARBER SHOP
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpg"
        alt="VISIONARY BARBER SHOP"
        className={`${sizeClasses} w-auto object-contain brightness-105 contrast-125 filter rounded`}
        onError={() => setImageError(true)}
      />
      <div className="hidden sm:flex flex-col">
        <span className="text-base font-black tracking-widest text-white leading-tight">
          VISIONARY
        </span>
        <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
          BARBER SHOP
        </span>
      </div>
    </div>
  );
}

