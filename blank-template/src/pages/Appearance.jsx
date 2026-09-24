import { useEffect, useRef, useState } from 'react';
import { Save, RotateCcw, Upload } from 'lucide-react';
import { useSettings } from '@/settings/SettingsProvider';
import { THEME_PRESETS, isHex, foreground, validateSettings } from '@/settings/model';
import { uploadImage, MEDIA_FOLDERS } from '@/services/files';
import { PageHead, ErrorNote, Spinner } from '@/components/ui';
import { Field, Notice } from '@/components/forms';

const appearanceKeys = [
  'app_name',
  'app_tagline',
  'app_description',
  'app_logo_url',
  'app_icon_url',
  'app_url',
  'support_email',
  'footer_note',
];
const themeKeys = ['theme_mode', 'theme_density', 'theme_primary', 'theme_secondary'];
export function Appearance({ theme = false }) {
  const { settings, loading, error, save, reload } = useSettings();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    setForm(settings);
  }, [settings]);
  const keys = theme ? themeKeys : appearanceKeys;
  const dirty = keys.some((key) => form[key] !== settings[key]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const set = (key, value) => {
    setNotice('');
    setForm((old) => ({ ...old, [key]: value }));
  };
  const upload = async (key, file) => {
    if (!file || lock.current) return;
    lock.current = true;
    setBusy(true);
    setFailure(null);
    try {
      const result = await uploadImage(file, MEDIA_FOLDERS[1]);
      if (!result?.url) throw new Error('The image service did not return an image URL.');
      set(key, result.url);
    } catch (err) {
      setFailure(err);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    const problem = validateSettings(form);
    if (problem) {
      setFailure(new Error(problem));
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setFailure(null);
    try {
      await save(Object.fromEntries(keys.map((key) => [key, form[key].trim()])));
      setNotice(theme ? 'Theme saved.' : 'Appearance saved.');
    } catch (err) {
      setFailure(err);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  if (loading) return <Spinner />;
  return (
    <div className="space-y-6">
      <PageHead
        title={theme ? 'Theme styling' : 'Appearance'}
        subtitle={
          theme
            ? 'Set the colours, display mode and spacing for this back office.'
            : 'Make the application your own with a name, logo and contact details.'
        }
      />
      <ErrorNote error={error || failure} />
      {error && (
        <button className="btn-ghost" onClick={reload}>
          Retry loading settings
        </button>
      )}
      <Notice>{notice}</Notice>
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <fieldset disabled={busy || !!error} className="card min-w-0 space-y-5 p-5 sm:p-6">
          {theme ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display mode" id="theme-mode">
                  <select
                    id="theme-mode"
                    className="input"
                    value={form.theme_mode}
                    onChange={(e) => set('theme_mode', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">Use system setting</option>
                  </select>
                </Field>
                <Field label="Density" id="theme-density">
                  <select
                    id="theme-density"
                    className="input"
                    value={form.theme_density}
                    onChange={(e) => set('theme_density', e.target.value)}
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </Field>
              </div>
              <div>
                <p className="label mb-3">Colour presets</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {THEME_PRESETS.map(([name, primary, secondary]) => (
                    <button
                      type="button"
                      key={name}
                      className={`btn-ghost justify-start ${form.theme_primary === primary && form.theme_secondary === secondary ? 'ring-2 ring-accent' : ''}`}
                      onClick={() => {
                        set('theme_primary', primary);
                        set('theme_secondary', secondary);
                      }}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ background: primary }} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              {[
                ['Primary colour', 'theme_primary'],
                ['Secondary colour', 'theme_secondary'],
              ].map(([label, key]) => (
                <Field key={key} id={key} label={label}>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-10 w-12 cursor-pointer rounded border border-ink-600"
                      aria-label={`${label} picker`}
                      value={isHex(form[key]) ? form[key] : '#000000'}
                      onChange={(e) => set(key, e.target.value)}
                    />
                    <input
                      id={key}
                      className="input font-mono"
                      maxLength={7}
                      pattern="#[0-9a-fA-F]{6}"
                      required
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  </div>
                </Field>
              ))}
            </>
          ) : (
            <>
              <Field label="Application name" id="app_name">
                <input
                  className="input"
                  id="app_name"
                  required
                  maxLength={120}
                  value={form.app_name}
                  onChange={(e) => set('app_name', e.target.value)}
                />
              </Field>
              <Field label="Tagline" id="app_tagline">
                <input
                  className="input"
                  id="app_tagline"
                  maxLength={120}
                  value={form.app_tagline}
                  onChange={(e) => set('app_tagline', e.target.value)}
                />
              </Field>
              <Field label="Description" id="app_description">
                <textarea
                  className="input min-h-24"
                  id="app_description"
                  maxLength={500}
                  value={form.app_description}
                  onChange={(e) => set('app_description', e.target.value)}
                />
              </Field>
              {[
                ['Logo', 'app_logo_url'],
                ['Browser icon', 'app_icon_url'],
              ].map(([label, key]) => (
                <Field
                  label={label}
                  id={key}
                  key={key}
                  hint="Upload an image up to 10 MB or paste its public URL."
                >
                  <div className="flex items-center gap-3">
                    {form[key] && /^https?:\/\//i.test(form[key]) && (
                      <img
                        src={form[key]}
                        alt={`${label} preview`}
                        className="h-12 w-12 rounded-lg border border-ink-700 object-contain"
                      />
                    )}
                    <input
                      id={key}
                      type="url"
                      className="input min-w-0 flex-1"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="btn-ghost w-fit cursor-pointer">
                      <Upload size={15} />
                      Upload
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        aria-label={`Upload ${label.toLowerCase()}`}
                        onChange={(e) => {
                          upload(key, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {form[key] && (
                      <button type="button" className="btn-ghost" onClick={() => set(key, '')}>
                        Remove {label.toLowerCase()}
                      </button>
                    )}
                  </div>
                </Field>
              ))}
              <Field label="Application URL" id="app_url">
                <input
                  className="input"
                  id="app_url"
                  type="url"
                  value={form.app_url}
                  onChange={(e) => set('app_url', e.target.value)}
                  placeholder="https://your-app.example.com"
                />
              </Field>
              <Field label="Support email" id="support_email">
                <input
                  className="input"
                  id="support_email"
                  type="email"
                  value={form.support_email}
                  onChange={(e) => set('support_email', e.target.value)}
                />
              </Field>
              <Field label="Footer note" id="footer_note">
                <input
                  className="input"
                  id="footer_note"
                  maxLength={300}
                  value={form.footer_note}
                  onChange={(e) => set('footer_note', e.target.value)}
                />
              </Field>
            </>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-ink-700 pt-5">
            <button className="btn-primary" disabled={!dirty || busy}>
              <Save size={16} />
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button
              className="btn-ghost"
              type="button"
              disabled={!dirty || busy}
              onClick={() => {
                setForm(settings);
                setFailure(null);
              }}
            >
              <RotateCcw size={15} />
              Reset changes
            </button>
            {dirty && <span className="text-xs text-mist-dim">Unsaved changes</span>}
          </div>
        </fieldset>
        <aside className="space-y-3">
          <p className="label">Preview</p>
          <ThemePreview settings={form} />
          <p className="text-xs leading-relaxed text-mist-dim">
            Saved settings apply to everyone using this installation.
          </p>
        </aside>
      </form>
    </div>
  );
}
function ThemePreview({ settings }) {
  const dark = settings.theme_mode === 'dark';
  const primary = isHex(settings.theme_primary) ? settings.theme_primary : '#4f46e5';
  return (
    <div
      className="theme-preview overflow-hidden rounded-[18px] border border-ink-700 shadow-panel"
      style={{ background: dark ? '#111827' : '#fff', color: dark ? '#e8edf7' : '#0f172a', '--preview-line': dark ? 'rgb(232 237 247 / .1)' : 'rgb(15 23 42 / .1)' }}
    >
      <div className="flex items-center gap-3 border-b border-[var(--preview-line)] p-5">
        {settings.app_logo_url && /^https?:\/\//.test(settings.app_logo_url) ? (
          <img src={settings.app_logo_url} alt="" className="h-9 w-9 rounded object-contain" />
        ) : (
          <span
            className="grid h-9 w-9 place-items-center rounded-lg font-bold"
            style={{ background: primary, color: `rgb(${foreground(primary)})` }}
          >
            {(settings.app_name || 'A')[0]}
          </span>
        )}
        <div>
          <strong className="block">{settings.app_name || 'Application'}</strong>
          <small className="opacity-60">{settings.app_tagline || 'Back office'}</small>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-50">Dashboard</p>
        <div className="grid grid-cols-2 gap-3">
          {['Users', 'Activity'].map((label) => (
            <div key={label} className="rounded-xl border border-[var(--preview-line)] p-3">
              <small className="opacity-60">{label}</small>
              <p className="mt-1 text-xl font-semibold">128</p>
            </div>
          ))}
        </div>
        <span
          className="inline-block rounded-lg px-4 py-2 text-xs font-semibold"
          style={{ background: primary, color: `rgb(${foreground(primary)})` }}
        >
          Primary action
        </span>
        <div
          className="h-1.5 rounded-full"
          style={{ background: isHex(settings.theme_secondary) ? settings.theme_secondary : '#7c3aed' }}
        />
        <p className="text-xs opacity-60">{settings.footer_note || 'Your workspace, your brand.'}</p>
      </div>
    </div>
  );
}
