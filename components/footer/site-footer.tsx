'use client';

import React from 'react';
import Link from 'next/link';
import { GanakaLogo } from '@/components/logo/ganaka-logo';
import { useTranslation } from '@/lib/i18n/use-translation';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer
      id="main-site-footer"
      className="w-full bg-[#ECE7DC] border-t border-[#DCD5C6] mt-auto transition-colors"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Brand & Descriptor */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <GanakaLogo size="md" />
              <p className="mt-4 text-sm leading-relaxed text-[#5C5850] max-w-sm font-serif">
                {t.footer.tagline}
              </p>
            </div>
            <div className="mt-6 text-xs text-[#5C5850] font-mono">
              <span className="inline-block px-2.5 py-1 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs font-serif italic text-slate-800">
                {t.footer.sanskritEpigraph}
              </span>
            </div>
          </div>

          {/* Right Columns: Disciplined Navigation Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Calculation Column */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#171614]">
                {t.footer.productHeading}
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm">
                <li>
                  <Link
                    href="/workspace"
                    className="text-[#5C5850] hover:text-[#8B2F0B] transition-colors duration-150"
                  >
                    {t.nav.workspace}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/panchanga"
                    className="text-[#5C5850] hover:text-[#8B2F0B] transition-colors duration-150"
                  >
                    {t.nav.panchanga}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Research Column */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#171614]">
                {t.footer.researchHeading}
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm">
                <li>
                  <Link
                    href="/research"
                    className="text-[#5C5850] hover:text-[#8B2F0B] transition-colors duration-150"
                  >
                    {t.nav.research}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Documentation & About Column */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#171614]">
                {t.footer.documentationHeading}
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm">
                <li>
                  <Link
                    href="/documentation"
                    className="text-[#5C5850] hover:text-[#8B2F0B] transition-colors duration-150"
                  >
                    {t.nav.documentation}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-[#5C5850] hover:text-[#8B2F0B] transition-colors duration-150"
                  >
                    {t.nav.about}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Restrained Info */}
        <div className="mt-12 pt-6 border-t border-[#DCD5C6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C5850] font-mono">
          <div>
            © {currentYear} {t.footer.copyrightText}
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6 text-[#5C5850]">
            <span>Deterministic Mechanics</span>
            <span className="text-[#BCB4A4]">•</span>
            <span>Mathematical Rigor</span>
            <span className="text-[#BCB4A4]">•</span>
            <span>Source Provenance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
