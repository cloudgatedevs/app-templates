import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isTokenValid } from '@cloudgatedevs/cloudgate-client';
import { auth } from '@/services/auth';
import { idpAdmin } from '@/services/idpAdmin';
import { resolveAppIdentity } from '@/services/appIdentity';
import { connectNotificationSocket, createNotificationsClient } from '@/services/notificationsClient';

export const notificationsApi = createNotificationsClient({ request: idpAdmin, resolveAppIdentity });
const Context = createContext(null);
export const useNotifications = () => useContext(Context);
export function NotificationsProvider({ children }) {
  const [unread, setUnread] = useState(0);
  const [revision, setRevision] = useState(0);
  const [connection, setConnection] = useState('connecting');
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    setRevision(value => value + 1);
    try {
      const result = await notificationsApi.unreadCount();
      if (request === sequence.current) setUnread(Number(result.unreadCount) || 0);
    } catch { /* Inbox shows API errors; an unavailable backend must not break navigation. */ }
  }, []);
  useEffect(() => {
    let stopped = false, disconnect;
    refresh();
    (async () => {
      const { environment } = await resolveAppIdentity();
      if (stopped) return;
      if (!/^(sbx|sandbox|prod|production)$/.test(environment)) throw new Error('Choose a valid notification environment.');
      disconnect = connectNotificationSocket({
        apiUrl: import.meta.env.VITE_IDP_API_URL || import.meta.env.VITE_IDP_BASE_URL,
        environment: /^prod/.test(environment) ? 'prod' : 'sbx',
        getAccessToken: async () => {
          if (!isTokenValid(auth.getAccessToken(), 30)) await auth.refresh();
          return auth.getAccessToken();
        }, onChange: refresh, onStatus: setConnection,
      });
    })().catch(() => { if (!stopped) setConnection('disconnected'); });
    // Recover missed Pub/Sub events, sleep/wake and offline periods from the persisted inbox.
    const timer = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { stopped = true; sequence.current++; disconnect?.(); clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refresh]);
  return <Context.Provider value={{ unread, revision, connection, refresh }}>{children}</Context.Provider>;
}
