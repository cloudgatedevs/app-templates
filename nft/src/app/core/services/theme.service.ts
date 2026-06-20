import { Injectable, signal } from '@angular/core';
import { Theme } from '../models/theme.model';
import { effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private static readonly STORAGE_KEY = 'theme:cloudgate-nft';
  public theme = signal<Theme>({ mode: 'light', color: 'base' });

  constructor() {
    this.loadTheme();
    effect(() => {
      this.setTheme();
    });
  }

  private loadTheme() {
    const theme = localStorage.getItem(ThemeService.STORAGE_KEY) ?? localStorage.getItem('theme');
    if (theme) {
      try {
        const parsed = JSON.parse(theme) as Theme;
        if (parsed.mode === 'light' || parsed.mode === 'dark') {
          this.theme.set(parsed);
        }
      } catch {
        // Ignore invalid persisted theme and keep defaults.
      }
    }
  }

  private setTheme() {
    localStorage.setItem(ThemeService.STORAGE_KEY, JSON.stringify(this.theme()));
    this.setThemeClass();
  }

  public get isDark(): boolean {
    return this.theme().mode == 'dark';
  }

  private setThemeClass() {
    document.querySelector('html')!.className = this.theme().mode;
    document.querySelector('html')!.setAttribute('data-theme', this.theme().color);
  }
}
