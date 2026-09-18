'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GanakaSymbol } from '@/components/logo/ganaka-logo';

export interface GanakaButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void | Promise<void>;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'preset' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  title?: string;
  'aria-label'?: string;
}

/**
 * GanakaButton — Interactive button featuring an animated rotating website logo
 * micro-interaction when clicked.
 */
export const GanakaButton: React.FC<GanakaButtonProps> = ({
  children,
  onClick,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  id,
  title,
  'aria-label': ariaLabel,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [asyncLoading, setAsyncLoading] = useState(false);

  const isActuallyLoading = loading || asyncLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled || isActuallyLoading) return;

    // Trigger smooth rotating logo micro-animation and running border beam
    setIsRotating(true);
    setIsClicked(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
    setTimeout(() => {
      setIsClicked(false);
    }, 850);

    if (onClick) {
      try {
        const result = onClick(e);
        if (result && typeof (result as any).then === 'function') {
          setAsyncLoading(true);
          await result;
        }
      } finally {
        setAsyncLoading(false);
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#8C2D19] hover:bg-[#782614] active:bg-[#601D0F] text-white border border-[#8C2D19] shadow-sm shadow-[#8C2D19]/20';
      case 'dark':
        return 'bg-stone-900 hover:bg-[#8C2D19] active:bg-black text-white border border-stone-800 shadow-sm';
      case 'secondary':
        return 'bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-stone-900 border border-stone-200 shadow-2xs';
      case 'outline':
        return 'bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 border border-stone-200 hover:border-[#8C2D19]/40 hover:text-[#8C2D19]';
      case 'preset':
        return 'bg-stone-50 hover:bg-[#8C2D19]/5 active:bg-[#8C2D19]/10 text-stone-700 hover:text-[#8C2D19] border border-stone-200 hover:border-[#8C2D19]/40';
      case 'ghost':
        return 'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-stone-700 hover:text-stone-900 border border-transparent';
      default:
        return 'bg-[#8C2D19] text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-lg gap-1.5';
      case 'lg':
        return 'px-6 py-3.5 text-sm sm:text-base rounded-xl gap-2.5 font-bold';
      case 'md':
      default:
        return 'px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2 font-semibold';
    }
  };

  const symbolSize = size === 'sm' ? 15 : size === 'lg' ? 20 : 17;

  const content = (
    <>
      {/* Rotating Logo on Click / Loading */}
      <span
        className={`relative z-10 inline-flex items-center justify-center shrink-0 ${
          isActuallyLoading
            ? 'animate-spin'
            : isRotating
            ? 'animate-logo-spin'
            : 'transition-transform duration-200 group-hover:scale-105'
        }`}
      >
        <GanakaSymbol
          size={symbolSize}
          variant="monochrome"
          className={
            variant === 'primary' || variant === 'dark'
              ? 'text-white'
              : 'text-[#8C2D19]'
          }
        />
      </span>

      {iconPosition === 'left' && icon && !isActuallyLoading && (
        <span className="relative z-10 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5">{icon}</span>
      )}

      {children && <span className="relative z-10 truncate">{children}</span>}

      {iconPosition === 'right' && icon && (
        <span className="relative z-10 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">{icon}</span>
      )}
    </>
  );

  const baseClasses = `group relative overflow-hidden inline-flex items-center justify-center font-serif tracking-wide btn-press-tactile select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`;

  if (href && !disabled) {
    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          id={id}
          title={title}
          aria-label={ariaLabel}
          onClick={handleClick}
          className={baseClasses}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={href}
        id={id}
        title={title}
        aria-label={ariaLabel}
        onClick={handleClick}
        className={baseClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      id={id}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={baseClasses}
    >
      {content}
    </button>
  );
};
