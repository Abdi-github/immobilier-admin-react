// i18n helpers for multilingual content

import type { Language } from '@/shared/types/api.types';

export interface MultilingualText {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
}

/**
 * Get localized name from a multilingual object
 *
 * @param obj - Object with multilingual name field or the name field itself
 * @param language - Current language code
 * @param fallback - Fallback text if no translation found
 * @returns Localized string
 */
export function getLocalizedName(
  obj: MultilingualText | undefined | null,
  language: string,
  fallback: string = ''
): string {
  if (!obj) return fallback;

  const lang = language as Language;

  // Try current language first
  if (obj[lang]) {
    return obj[lang]!;
  }

  // Fallback to English
  if (obj.en) {
    return obj.en;
  }

  // Try any available language
  const availableLangs: Language[] = ['en', 'fr', 'de', 'it'];
  for (const l of availableLangs) {
    if (obj[l]) {
      return obj[l]!;
    }
  }

  return fallback;
}

/**
 * Check if multilingual object has content for a specific language
 */
export function hasTranslation(
  obj: MultilingualText | undefined | null,
  language: Language
): boolean {
  return !!obj && !!obj[language];
}

/**
 * Get all available languages in a multilingual object
 */
export function getAvailableLanguages(
  obj: MultilingualText | undefined | null
): Language[] {
  if (!obj) return [];

  const languages: Language[] = [];
  const allLangs: Language[] = ['en', 'fr', 'de', 'it'];

  for (const lang of allLangs) {
    if (obj[lang]) {
      languages.push(lang);
    }
  }

  return languages;
}
