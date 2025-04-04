
import { Helmet } from 'react-helmet';
import PageUnderConstruction from '@/components/PageUnderConstruction';

export default function BloodCollection() {
  return (
    <>
      <Helmet>
        <title>Blood Collection | Blood Bank Management System</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blood Collection</h1>
          <p className="text-muted-foreground">
            Record and manage blood donation records
          </p>
        </div>
        <PageUnderConstruction 
          title="Blood Collection Module"
          description="This module will allow recording new blood donations, tracking collection status, and managing blood unit processing."
        />
      </div>
    </>
  );
}
