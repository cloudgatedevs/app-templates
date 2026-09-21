import { CloudgateAppAnalytics } from '@/integrations/CloudgateAppAnalytics';
import { PageHead } from '@/components/ui';


export function Analytics() {
  return <div className="space-y-5">
    <PageHead title="Analytics" subtitle="Understand your website traffic." />
    <CloudgateAppAnalytics />
  </div>;
}
