import { SmtpSettings } from '@/integrations/CloudgateSmtpSettings';
import { useAuthContext } from '@/auth';
import { PageHead } from '@/components/ui';

export function Smtp() {
  const { currentUser } = useAuthContext();
  return (
    <div className="space-y-5">
      <PageHead title="SMTP settings" subtitle="Manage outgoing email delivery for your Cloudgate tenant." />
      <SmtpSettings defaultTestTo={currentUser?.user?.emailAddress || ''} />
    </div>
  );
}
