import { PanelsTopLeft } from 'lucide-react';
import { useSettings } from '@/settings/SettingsProvider';

export function Brand() {
  const { settings } = useSettings();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="brand-mark grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent-grad text-accent-fg">
        {settings.app_logo_url ? (
          <img src={settings.app_logo_url} alt="" className="h-full w-full object-contain" />
        ) : (
          <PanelsTopLeft size={21} />
        )}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{settings.app_name}</p>
        <p className="mt-1 truncate text-[11px] text-mist-dim">{settings.app_tagline || 'Back office'}</p>
      </div>
    </div>
  );
}
