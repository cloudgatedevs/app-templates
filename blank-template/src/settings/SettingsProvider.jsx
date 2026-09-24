import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsApi } from '@/services/settings';
import { DEFAULT_SETTINGS, normalizeSettings, rgb, foreground, accentText } from './model';
import cloudgateIcon from '@/assets/cloudgate-icon.svg';

const SettingsContext = createContext(null);
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [savedRevision, setSavedRevision] = useState(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    settingsApi
      .get()
      .then((value) => {
        if (active) {
          setSettings(value.values);
          setSavedRevision(value.revision);
        }
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      root.dataset.theme =
        settings.theme_mode === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme_mode;
      root.dataset.density = settings.theme_density;
      root.style.setProperty('--accent', rgb(settings.theme_primary));
      root.style.setProperty('--accent-fg', foreground(settings.theme_primary));
      root.style.setProperty(
        '--accent-text',
        accentText(settings.theme_primary, root.dataset.theme === 'dark'),
      );
      root.style.setProperty('--secondary', rgb(settings.theme_secondary));
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', root.dataset.theme === 'dark' ? '#0c111c' : '#f5f6f8');
    };
    apply();
    media.addEventListener('change', apply);
    document.title = `${settings.app_name} · ${settings.app_tagline || 'Back office'}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', settings.app_description || 'Cloudgate administration');
    let icon = document.querySelector('link[rel="icon"][data-app-brand]');
    const href = settings.app_icon_url || settings.app_logo_url || cloudgateIcon;
    if (href) {
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        icon.dataset.appBrand = 'true';
        document.head.appendChild(icon);
      }
      icon.href = href;
    } else icon?.remove();
    return () => media.removeEventListener('change', apply);
  }, [settings]);
  const save = useCallback(async (values) => {
    const value = await settingsApi.save(values, savedRevision);
    setSettings(normalizeSettings(value.values));
    setSavedRevision(value.revision);
    setError(null);
    return value.values;
  }, [savedRevision]);
  return (
    <SettingsContext.Provider
      value={{ settings, loading, error, save, reload: () => setRevision((v) => v + 1) }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
export const useSettings = () => useContext(SettingsContext);
