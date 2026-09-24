import { LayoutDashboard } from 'lucide-react';
import { PlaceholderPage } from '@cloudgatedevs/cloudgate-client/react';

export const Dashboard = () => (
  <PlaceholderPage
    title="Dashboard"
    subtitle="An overview of your application."
    icon={LayoutDashboard}
    heading="Your overview starts here"
    description="This space is ready for your application's metrics and recent activity. Your dashboard hasn't been configured yet."
  />
);
