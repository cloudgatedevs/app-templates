import { formatString } from './format-string.util';

export interface AppLanguageInfo {
  name: string;
  displayName: string;
  icon?: string;
  isDefault?: boolean;
  isDisabled?: boolean;
  isRightToLeft?: boolean;
}

const defaultLanguage: AppLanguageInfo = {
  name: 'en-US',
  displayName: 'English',
  icon: 'famfamfam-flags us',
  isDefault: true,
  isDisabled: false,
  isRightToLeft: false,
};

let currentLanguage: AppLanguageInfo = { ...defaultLanguage };

export function getCurrentAppLanguage(): AppLanguageInfo {
  return currentLanguage;
}

export function setCurrentAppLanguage(language: AppLanguageInfo): void {
  currentLanguage = language;
}

export function initializeDefaultLanguage(): void {
  currentLanguage = { ...defaultLanguage };
}

export function localize(key: string, _sourceName?: string): string {
  return key;
}

export function localizeWithArgs(key: string, sourceName: string | undefined, ...args: unknown[]): string {
  const localizedText = localize(key, sourceName);
  if (!args.length) {
    return localizedText;
  }
  return formatString(localizedText, ...args);
}
