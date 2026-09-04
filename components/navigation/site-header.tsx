'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { SITE_CONFIG } from '@/lib/site-config';
import { GanakaLogo } from '@/components/logo/ganaka-logo';
import { HamburgerIcon, CloseIcon, ArrowRightIcon } from '@/components/ui/icons';
import { Settings, Globe } from 'lucide-react';
import { PlatformSettingsDialog } from '@/components/settings/PlatformSettingsDialog';
import { useTranslation } from '@/lib/i18n/use-translation';

export function SiteHeader() {
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Dynamic translated nav items
  const navItems = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.panchanga, href: '/panchanga' },
    { label: t.nav.about, href: '/about' },
    { label: t.nav.research, href: '/research' },
    { label: t.nav.documentation, href: '/documentation' },
  ];

  const languageLabels: Record<string, string> = {
    english: 'EN',
    hindi: 'हिन्दी',
    sanskrit: 'संस्कृतम्',
    assamese: 'অসমীয়া',
  };

  return (
    <header
      id="main-navigation-header"
      className="sticky top-0 z-40 w-full bg-[#F4F0E7] border-b border-[#DCD5C6] transition-colors"
    >
      <div
        className={`w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between ${
          pathname === '/workspace' || pathname === '/panchanga' ? 'max-w-none' : 'max-w-7xl'
        }`}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <GanakaLogo size="md" />
        </div>

        {/* Center / Right: Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center space-x-1 lg:space-x-6"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                id={`nav-link-${item.href.replace('/', '') || 'home'}`}
                className={`relative px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors duration-150 rounded-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B2F0B] active:scale-[0.97] ${
                  isActive
                    ? 'text-[#171614] font-bold'
                    : 'text-[#5C5850] hover:text-[#171614]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#8B2F0B]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Workspace CTA, Language Indicator, Settings & Mobile Trigger */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Language / Settings pill */}
          <button
            type="button"
            id="desktop-header-settings-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label={t.header.settingsTitle}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono tracking-wider uppercase text-[#5C5850] hover:text-[#171614] hover:bg-[#ECE7DC] rounded-xs border border-[#DCD5C6] transition-all cursor-pointer select-none active:scale-[0.96]"
            title={t.header.settingsTitle}
          >
            <Globe className="w-3.5 h-3.5 text-[#8B2F0B]" />
            <span className="text-[11px] font-bold text-slate-800">
              {languageLabels[language] || 'EN'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-400 mx-0.5" />
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">{t.nav.settings}</span>
          </button>

          <Link
            href="/workspace"
            id="desktop-header-workspace-cta"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide uppercase font-mono text-[#FCFAF6] bg-[#171614] hover:bg-[#8B2F0B] active:bg-[#722608] active:scale-[0.97] transition-all duration-150 rounded-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B2F0B] select-none"
          >
            <span>{t.nav.enterWorkspace}</span>
            <ArrowRightIcon size={12} className="opacity-80" />
          </Link>

          {/* Mobile Menu Trigger using Radix Dialog */}
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                id="mobile-navigation-toggle"
                aria-label="Open Navigation Menu"
                className="md:hidden inline-flex items-center justify-center p-2 text-[#171614] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] active:scale-[0.96] rounded-xs border border-[#DCD5C6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B2F0B]"
              >
                <HamburgerIcon size={20} />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-[#171614]/50 transition-opacity animate-in fade-in" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#F4F0E7] p-6 shadow-xl border-l border-[#DCD5C6] flex flex-col justify-between focus:outline-none animate-in slide-in-from-right duration-200">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#DCD5C6]">
                    <Dialog.Title className="sr-only">
                      Navigation Menu
                    </Dialog.Title>
                    <GanakaLogo size="sm" isLink={false} />
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        id="mobile-navigation-close"
                        aria-label="Close Navigation Menu"
                        className="p-1.5 text-[#5C5850] hover:text-[#171614] hover:bg-[#ECE7DC] rounded-xs border border-[#DCD5C6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B2F0B] active:scale-[0.96]"
                      >
                        <CloseIcon size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav
                    aria-label="Mobile Navigation Links"
                    className="mt-6 flex flex-col space-y-1"
                  >
                    {navItems.map((item) => {
                      const isActive =
                        item.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xs transition-all active:scale-[0.98] ${
                            isActive
                              ? 'bg-[#ECE7DC] text-[#171614] font-semibold border-l-2 border-[#8B2F0B]'
                              : 'text-[#5C5850] hover:bg-[#ECE7DC] hover:text-[#171614]'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B2F0B]" />
                          )}
                        </Link>
                      );
                    })}

                    {/* Platform Settings Button in Mobile Navigation */}
                    <button
                      type="button"
                      id="mobile-nav-settings-btn"
                      onClick={() => {
                        setMobileOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xs text-[#171614] hover:bg-[#ECE7DC] transition-all cursor-pointer border border-[#DCD5C6]/60 mt-2 bg-white/50 active:scale-[0.97]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Settings className="w-4 h-4 text-[#8B2F0B]" />
                        <span className="font-semibold">{t.nav.settings}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8B2F0B] bg-amber-100/70 px-2 py-0.5 rounded font-bold">
                        {languageLabels[language] || 'EN'}
                      </span>
                    </button>

                    <div className="pt-4 mt-4 border-t border-[#DCD5C6] space-y-2.5">
                      <Link
                        href="/panchanga"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between w-full px-5 py-3.5 text-xs font-bold uppercase tracking-wider font-mono text-white bg-[#8B2F0B] hover:bg-[#722608] active:scale-[0.98] rounded-xs transition-all shadow-xs"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-serif font-bold text-white tracking-wide flex items-center gap-1.5">
                            <span>{t.nav.panchanga}</span>
                            <span className="text-[10px] font-mono font-normal opacity-80">(पञ्चाङ्ग)</span>
                          </span>
                          <span className="text-[10px] font-mono text-amber-100/90 font-normal">
                            Daily Vedic Almanac &amp; Muhūrta
                          </span>
                        </div>
                        <ArrowRightIcon size={16} className="text-white shrink-0" />
                      </Link>

                      <Link
                        href="/workspace"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between w-full px-5 py-3 text-xs font-semibold uppercase tracking-wide font-mono text-[#FCFAF6] bg-[#171614] hover:bg-[#8B2F0B] active:scale-[0.98] rounded-xs transition-all"
                      >
                        <span>{t.nav.enterWorkspace}</span>
                        <ArrowRightIcon size={14} />
                      </Link>
                    </div>
                  </nav>
                </div>

                <div className="pt-6 border-t border-[#DCD5C6] text-xs text-[#5C5850]">
                  <p className="font-medium text-[#171614]">
                    Gaṇaka — {t.header.descriptor}
                  </p>
                  <p className="mt-1 text-[#5C5850]">
                    Deterministic computation &amp; classical source traceability.
                  </p>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Global Platform Settings Dialog */}
      <PlatformSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </header>
  );
}
