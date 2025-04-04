
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  DropletIcon, 
  UsersIcon, 
  ClipboardListIcon, 
  AlertTriangleIcon,
  RefreshCwIcon,
  BarChart3Icon 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import BloodTypeTag from '@/components/BloodTypeTag';
import StatusBadge from '@/components/StatusBadge';
import { 
  donorService, 
  bloodUnitService, 
  bloodRequestService, 
  inventoryService 
} from '@/lib/mockData';
import { InventoryStats, BloodUnit, BloodRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const [inventoryStats, setInventoryStats] = useState<InventoryStats[]>([]);
  const [latestDonations, setLatestDonations] = useState<BloodUnit[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get inventory stats
      const stats = await inventoryService.getInventoryStats();
      setInventoryStats(stats);
      
      // Get latest blood donations
      const units = await bloodUnitService.getBloodUnits();
      const sorted = [...units].sort((a, b) => 
        new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime()
      );
      setLatestDonations(sorted.slice(0, 5));
      
      // Get urgent blood requests
      const requests = await bloodRequestService.getBloodRequests();
      const urgent = requests.filter(
        req => (req.urgency === 'High' || req.urgency === 'Critical') && req.status === 'Pending'
      );
      setUrgentRequests(urgent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalDonors = 20; // Mock value, would be fetched from API
  const totalUnits = inventoryStats.reduce((sum, stat) => sum + stat.available, 0);
  const totalRequests = 15; // Mock value, would be fetched from API
  const criticalTypes = inventoryStats
    .filter(stat => stat.available <= 2)
    .map(stat => stat.bloodType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleRefresh = () => {
    toast.success('Dashboard refreshed');
    fetchDashboardData();
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Blood Bank Management System</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Blood Bank Management System overview
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Overview Stats */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Donors"
            value={totalDonors}
            icon={<UsersIcon className="text-bloodRed-500 h-5 w-5" />}
            trend="up"
            trendValue="5% this month"
          />
          <StatCard
            title="Available Blood Units"
            value={totalUnits}
            icon={<DropletIcon className="text-bloodRed-500 h-5 w-5" />}
            description="Total units across all blood types"
          />
          <StatCard
            title="Active Requests"
            value={totalRequests}
            icon={<ClipboardListIcon className="text-bloodRed-500 h-5 w-5" />}
            trend="down"
            trendValue="2% this week"
          />
        </section>

        {/* Blood Inventory */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Blood Inventory</CardTitle>
              <CardDescription>Current blood inventory levels by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {inventoryStats.map(stat => (
                  <div key={stat.bloodType} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <BloodTypeTag type={stat.bloodType} />
                      {stat.available <= 2 && (
                        <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-2xl font-semibold">{stat.available}</p>
                    <p className="text-xs text-muted-foreground">
                      Available Units ({stat.reserved} reserved)
                    </p>
                  </div>
                ))}
              </div>
              
              {criticalTypes.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      Critical Inventory Alert: Low stock for {criticalTypes.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Two Column Layout for Donations and Requests */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Latest Donations */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Blood Donations</CardTitle>
                <CardDescription>Last 5 blood units collected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestDonations.map(unit => (
                    <div key={unit.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{unit.donorName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BloodTypeTag type={unit.bloodType} />
                          <span className="text-sm text-gray-500">
                            {unit.quantity} ml
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={unit.status} />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(unit.collectionDate)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {latestDonations.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No recent donations found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Urgent Requests */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Urgent Blood Requests</CardTitle>
                <CardDescription>High priority requests that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgentRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{request.patientName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BloodTypeTag type={request.bloodType} />
                          <span className="text-sm text-gray-500">
                            {request.quantity} ml
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.hospital}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={request.urgency} />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(request.requestDate)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {urgentRequests.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No urgent requests at this time
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Analytics Preview */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Blood Donation Trends</CardTitle>
              <CardDescription>Monthly donation statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Analytics Module</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Detailed analytics and visualizations for blood donation trends 
                  and inventory forecasting would be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
