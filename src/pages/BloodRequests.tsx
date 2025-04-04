
import { Helmet } from 'react-helmet';
import PageUnderConstruction from '@/components/PageUnderConstruction';

export default function BloodRequests() {
  return (
    <>
      <Helmet>
        <title>Blood Requests | Blood Bank Management System</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blood Requests</h1>
          <p className="text-muted-foreground">
            Manage incoming blood requests and patient needs
          </p>
        </div>
        <PageUnderConstruction 
          title="Blood Requests Module"
          description="This module will allow managing patient blood requests, tracking urgent needs, and fulfilling blood supply requirements."
        />
      </div>
    </>
  );
}
