'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { PlatformLanguage } from '@/lib/settings/types';
import {
  getPlatformSettings,
  savePlatformSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import { TRANSLATIONS, TranslationDictionary } from './translations';

function getLanguageSnapshot(): PlatformLanguage {
  if (typeof window === 'undefined') return 'english';
  return getPlatformSettings().language || 'english';
}

function subscribe(callback: () => void) {
  return subscribeToSettings((scope) => {
    if (scope === 'platform') {
      callback();
    }
  });
}

export function useTranslation(): {
  language: PlatformLanguage;
  t: TranslationDictionary;
  setLanguage: (lang: PlatformLanguage) => void;
} {
  const language = useSyncExternalStore(
    subscribe,
    getLanguageSnapshot,
    () => 'english' as PlatformLanguage
  );

  const setLanguage = (newLang: PlatformLanguage) => {
    savePlatformSettings({ language: newLang });
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.english;

  return { language, t, setLanguage };
}
