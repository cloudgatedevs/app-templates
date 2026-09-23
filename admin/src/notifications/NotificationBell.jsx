import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Bell, RefreshCw, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { fmtDate, Spinner } from '@/components/ui';
import { notificationsApi, useNotifications } from './NotificationsProvider';
import { notificationAppearance } from './notificationAppearance';
import { NotificationStyleBadge } from './NotificationStyleBadge';

export function NotificationBell() {
  const { unread, revision } = useNotifications();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const trigger = useRef(null);
  const navigating = useRef(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.key]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      // Close when switching between the desktop and mobile header.
      if (!trigger.current?.getClientRects().length) { setOpen(false); return; }
      const rect = trigger.current.getBoundingClientRect();
      const width = Math.min(384, window.innerWidth - 24);
      setPosition({ top: rect.bottom + 10, left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    setLoading(true); setError(null);
    notificationsApi.list({ take: 5 }).then(value => {
      if (!Array.isArray(value?.items)) throw new Error('Cloudgate returned an invalid inbox.');
      if (!stopped) setItems(value.items);
    }).catch(err => { if (!stopped) setError(err); }).finally(() => { if (!stopped) setLoading(false); });
    return () => { stopped = true; };
  }, [open, revision, retry]);

  return <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
    <Dialog.Trigger asChild>
      <button ref={trigger} type="button" className="btn-ghost relative p-2" aria-label={`Notifications, ${unread} unread`}>
        <Bell size={19} aria-hidden="true" />
        {unread > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-fg">{unread > 99 ? '99+' : unread}</span>}
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Content className="fixed z-50 flex w-96 max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 text-mist shadow-xl outline-none"
        style={{ ...position, width: 'min(384px, calc(100vw - 24px))', maxHeight: `calc(100dvh - ${position.top + 12}px)` }}
        onCloseAutoFocus={event => {
          if (navigating.current) {
            event.preventDefault(); navigating.current = false;
            document.querySelector('main')?.focus({ preventScroll: true });
          }
        }}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-700 p-4">
          <div>
            <Dialog.Title className="font-semibold">Notifications</Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-mist-muted">Your latest updates · {unread} unread</Dialog.Description>
          </div>
          <Dialog.Close asChild><button type="button" className="btn-ghost p-2" aria-label="Close notifications"><X size={16} /></button></Dialog.Close>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain" aria-busy={loading}>
          {loading ? <Spinner /> : error ? <div className="space-y-3 p-5">
            <p role="alert" className="text-sm text-mist-muted">{error.message || 'Could not load notifications.'}</p>
            <button type="button" className="btn-ghost text-xs" onClick={() => setRetry(value => value + 1)}><RefreshCw size={14} /> Try again</button>
          </div> : items.length === 0 ? <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-mist-muted">
            <Bell size={24} aria-hidden="true" /><p className="text-sm">No notifications yet.</p><p className="text-xs text-mist-dim">New updates will appear here.</p>
          </div> : <ul className="divide-y divide-ink-700">{items.map(item => <li key={item.id} data-notification-style={notificationAppearance(item.style).value} className={`flex gap-3 border-l-4 p-4 ${notificationAppearance(item.style).panel}`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? 'bg-ink-600' : 'bg-accent'}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5"><NotificationStyleBadge style={item.style} /></div>
              <div className="flex items-start justify-between gap-3"><p className="break-words text-sm font-semibold">{item.title}</p><span className="shrink-0 text-[10px] text-mist-dim">{item.isRead ? 'Read' : 'Unread'}</span></div>
              <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-mist-muted">{item.body}</p>
              <time className="mt-2 block text-[10px] text-mist-dim" dateTime={item.creationTime}>{fmtDate(item.creationTime)}</time>
            </div>
          </li>)}</ul>}
        </div>
        <div className="shrink-0 border-t border-ink-700 p-3">
          <Link to="/notifications" className="btn-primary w-full" onClick={event => {
            if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
              navigating.current = true; setOpen(false);
            }
          }}>View all notifications <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
