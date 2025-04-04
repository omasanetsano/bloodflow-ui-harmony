
import { Helmet } from 'react-helmet';
import PageUnderConstruction from '@/components/PageUnderConstruction';

export default function Inventory() {
  return (
    <>
      <Helmet>
        <title>Inventory | Blood Bank Management System</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blood Inventory</h1>
          <p className="text-muted-foreground">
            Manage blood stock levels and track blood unit status
          </p>
        </div>
        <PageUnderConstruction 
          title="Blood Inventory Module"
          description="This module will provide detailed inventory management, expiry tracking, and stock level monitoring for all blood types."
        />
      </div>
    </>
  );
}
