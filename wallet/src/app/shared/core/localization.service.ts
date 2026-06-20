import { Injectable } from '@angular/core';
import { getCurrentAppLanguage, localize, localizeWithArgs } from './locale.util';
import { formatString } from './format-string.util';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  get languages() {
    return [getCurrentAppLanguage()];
  }

  get currentLanguage() {
    return getCurrentAppLanguage();
  }

  localize(key: string, sourceName?: string): string {
    return localize(key, sourceName);
  }

  getSource(sourceName: string) {
    return (key: string, ...args: unknown[]) => localizeWithArgs(key, sourceName, ...args);
  }
}

export function formatLocalizedString(localizedText: string, ...args: unknown[]): string {
  if (!args.length) {
    return localizedText;
  }
  return formatString(localizedText, ...args);
}
