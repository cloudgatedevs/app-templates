import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { notificationAppearance } from './notificationAppearance';

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };

export function NotificationStyleBadge({ style }) {
  const appearance = notificationAppearance(style);
  const Icon = icons[appearance.value];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${appearance.badge}`}>
    <Icon size={12} aria-hidden="true" />{appearance.label}
  </span>;
}
