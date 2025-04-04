
import { Helmet } from 'react-helmet';
import PageUnderConstruction from '@/components/PageUnderConstruction';

export default function Settings() {
  return (
    <>
      <Helmet>
        <title>Settings | Blood Bank Management System</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and user preferences
          </p>
        </div>
        <PageUnderConstruction 
          title="Settings Module"
          description="This module will allow customizing the blood bank management system, including user management, permissions, and application preferences."
        />
      </div>
    </>
  );
}
