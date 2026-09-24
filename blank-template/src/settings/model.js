export const DEFAULT_SETTINGS = Object.freeze({
  app_name: 'Admin',
  app_tagline: 'Back office',
  app_description: '',
  app_logo_url: '',
  app_icon_url: '',
  app_url: '',
  support_email: '',
  footer_note: '',
  theme_mode: 'light',
  theme_primary: '#4f46e5',
  theme_secondary: '#7c3aed',
  theme_density: 'comfortable',
});
export const THEME_PRESETS = [
  ['Indigo', '#4f46e5', '#7c3aed'],
  ['Ocean', '#0369a1', '#0d9488'],
  ['Forest', '#047857', '#b45309'],
  ['Berry', '#a21caf', '#be123c'],
  ['Slate', '#334155', '#4f46e5'],
  ['Terracotta', '#c2410c', '#9f1239'],
];
export const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value || ''));
export const safeUrl = (value) => !value || /^https?:\/\//i.test(value);
export function normalizeSettings(values = {}) {
  const result = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(result)) if (typeof values[key] === 'string') result[key] = values[key];
  if (!['light', 'dark', 'system'].includes(result.theme_mode)) result.theme_mode = 'light';
  if (!['comfortable', 'compact'].includes(result.theme_density)) result.theme_density = 'comfortable';
  for (const key of ['theme_primary', 'theme_secondary'])
    if (!isHex(result[key])) result[key] = DEFAULT_SETTINGS[key];
  for (const key of ['app_logo_url', 'app_icon_url', 'app_url']) if (!safeUrl(result[key])) result[key] = '';
  return result;
}
export function validateSettings(values) {
  if (!values.app_name.trim()) return 'Give the application a name.';
  if (['theme_primary', 'theme_secondary'].some((key) => !isHex(values[key])))
    return 'Use six-digit hex colours, for example #4f46e5.';
  if (['app_logo_url', 'app_icon_url', 'app_url'].some((key) => !safeUrl(values[key])))
    return 'Image and application URLs must start with https:// or http://.';
  if (values.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.support_email))
    return 'Enter a valid support email address.';
  return null;
}
export const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
export const foreground = (hex) => {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179
    ? '15 23 42'
    : '255 255 255';
};

/** Keep accent text readable on both workspace palettes, even with a pale brand colour. */
export function accentText(hex, dark) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const luminance = (rgb) =>
    rgb
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
  const background = luminance(dark ? [17, 24, 39] : [255, 255, 255]);
  const target = dark ? 255 : 0;
  for (let step = 0; step <= 20; step++) {
    const adjusted = channels.map((v) => Math.round(v + ((target - v) * step) / 20));
    const light = luminance(adjusted);
    if ((Math.max(light, background) + 0.05) / (Math.min(light, background) + 0.05) >= 4.5)
      return adjusted.join(' ');
  }
  return dark ? '255 255 255' : '0 0 0';
}
