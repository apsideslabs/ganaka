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
  const [asyncLoading, setAsyncLoading] = useState(false);

  const isActuallyLoading = loading || asyncLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled || isActuallyLoading) return;

    // Trigger smooth rotating logo micro-animation
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 750);

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
        return 'bg-[#8B2500] hover:bg-[#701E00] active:bg-[#591800] text-white border border-[#8B2500] shadow-xs';
      case 'dark':
        return 'bg-[#1A1A1A] hover:bg-[#8B2500] active:bg-[#111111] text-white border border-[#1A1A1A] shadow-xs';
      case 'secondary':
        return 'bg-[#FAF8F5] hover:bg-[#F2ECE0] active:bg-[#EAE0D0] text-[#2A241A] border border-[#DCD3C4] shadow-2xs';
      case 'outline':
        return 'bg-white hover:bg-[#FAF8F5] active:bg-[#F2ECE0] text-[#2A241A] border border-[#DCD3C4] hover:border-[#8B2500] hover:text-[#8B2500]';
      case 'preset':
        return 'bg-[#FAF8F5] hover:bg-[#F5EBE1] active:bg-[#ECD9CE] text-[#4A3E2C] hover:text-[#8B2500] border border-[#E5DEC8] hover:border-[#8B2500]';
      case 'ghost':
        return 'bg-transparent hover:bg-[#FAF8F5] active:bg-[#F0ECE1] text-[#4A3E2C] hover:text-[#1A1A1A] border border-transparent';
      default:
        return 'bg-[#8B2500] text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5';
      case 'lg':
        return 'px-6 py-3.5 text-sm sm:text-base rounded-xl gap-2.5 font-bold';
      case 'md':
      default:
        return 'px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2 font-semibold';
    }
  };

  const symbolSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  const content = (
    <>
      {/* Rotating Logo on Click / Loading */}
      <span
        className={`inline-flex items-center justify-center shrink-0 transition-transform duration-500 ease-out ${
          isActuallyLoading ? 'animate-spin' : isRotating ? 'rotate-360 scale-110' : 'rotate-0 scale-100'
        }`}
      >
        <GanakaSymbol
          size={symbolSize}
          className={
            variant === 'primary' || variant === 'dark'
              ? 'text-white'
              : 'text-[#8B2500]'
          }
        />
      </span>

      {iconPosition === 'left' && icon && !isRotating && !isActuallyLoading && (
        <span className="shrink-0">{icon}</span>
      )}

      {children && <span className="truncate">{children}</span>}

      {iconPosition === 'right' && icon && (
        <span className="shrink-0">{icon}</span>
      )}
    </>
  );

  const baseClasses = `group inline-flex items-center justify-center font-serif tracking-wide transition-all active:scale-[0.97] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2500] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`;

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
