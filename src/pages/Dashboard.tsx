
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  DropletIcon, 
  UsersIcon, 
  ClipboardListIcon, 
  AlertTriangleIcon,
  RefreshCwIcon,
  BarChart3Icon,
  DownloadIcon,
  FileTextIcon
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
import { InventoryStats, BloodUnit, BloodRequest, DonationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import Logo from '@/components/Logo';

// Define the hospital name
export const HOSPITAL_NAME = "LifeFlow Medical Center";

export default function Dashboard() {
  const [inventoryStats, setInventoryStats] = useState<InventoryStats[]>([]);
  const [latestDonations, setLatestDonations] = useState<BloodUnit[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<BloodRequest[]>([]);
  const [donationStats, setDonationStats] = useState<any[]>([]);
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

      // Generate donation statistics for the chart (simulated monthly data)
      const donations = await donorService.getDonationRecords();
      
      // Group donations by month and blood type
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const donationsByMonth: {[key: string]: {[key: string]: number}} = {};
      
      // Initialize data for the last 6 months
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
        donationsByMonth[monthKey] = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
      }
      
      // Fill with actual data
      donations.forEach((donation: DonationRecord) => {
        const donationDate = new Date(donation.date);
        const monthKey = `${monthNames[donationDate.getMonth()]} ${donationDate.getFullYear()}`;
        
        // Only include data from the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        if (donationDate >= sixMonthsAgo && donationsByMonth[monthKey]) {
          donationsByMonth[monthKey][donation.donorBloodType] = 
            (donationsByMonth[monthKey][donation.donorBloodType] || 0) + 1;
        }
      });
      
      // Convert to array for the chart
      const donationStatsArray = Object.keys(donationsByMonth).map(month => ({
        month,
        ...donationsByMonth[month],
        total: Object.values(donationsByMonth[month]).reduce((a, b) => a + b, 0)
      }));
      
      setDonationStats(donationStatsArray);
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
  
  // Function to export analytics data
  const exportAnalytics = () => {
    try {
      const exportData = {
        date: new Date().toISOString(),
        hospitalName: HOSPITAL_NAME,
        inventoryStats,
        donationStats,
        summary: {
          totalDonors,
          totalUnits,
          totalRequests,
          criticalTypes
        }
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `blood-bank-analytics-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Analytics data exported successfully");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export analytics data');
    }
  };
  
  // Generate PDF report
  const generateReport = () => {
    toast.success("PDF report generation initiated");
    // In a real app, this would connect to a PDF generation service
    setTimeout(() => {
      toast.success("Blood bank report has been generated and is ready for download");
    }, 2000);
  };

  const chartConfig = {
    'A+': { color: '#F87171' },
    'A-': { color: '#FB923C' },
    'B+': { color: '#FBBF24' },
    'B-': { color: '#34D399' },
    'AB+': { color: '#60A5FA' },
    'AB-': { color: '#818CF8' },
    'O+': { color: '#A78BFA' },
    'O-': { color: '#F472B6' },
    'total': { color: '#94A3B8', label: 'Total Donations' },
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | {HOSPITAL_NAME} Blood Bank</title>
      </Helmet>
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                {HOSPITAL_NAME} Blood Bank Management System
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center"
              onClick={exportAnalytics}
            >
              <DownloadIcon className="w-4 h-4" />
              Export Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center"
              onClick={generateReport}
            >
              <FileTextIcon className="w-4 h-4" />
              Generate Report
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </Button>
          </div>
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
          <Card className="bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Blood Inventory</CardTitle>
              <CardDescription>Current blood inventory levels by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {inventoryStats.map(stat => (
                  <div key={stat.bloodType} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
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
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-950/20 dark:border-red-900/30">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
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

        {/* Analytics Chart */}
        <section>
          <Card className="bg-gradient-to-br from-card to-accent/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Blood Donation Trends</CardTitle>
              <CardDescription>Monthly donation statistics by blood type</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {donationStats.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={donationStats}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        label={{ 
                          value: 'Donations', 
                          angle: -90, 
                          position: 'insideLeft', 
                          style: { fontSize: 12 } 
                        }} 
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="A+" 
                        stackId="1" 
                        stroke={chartConfig['A+'].color} 
                        fill={chartConfig['A+'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="A-" 
                        stackId="1" 
                        stroke={chartConfig['A-'].color} 
                        fill={chartConfig['A-'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="B+" 
                        stackId="1" 
                        stroke={chartConfig['B+'].color} 
                        fill={chartConfig['B+'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="B-" 
                        stackId="1" 
                        stroke={chartConfig['B-'].color} 
                        fill={chartConfig['B-'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="AB+" 
                        stackId="1" 
                        stroke={chartConfig['AB+'].color} 
                        fill={chartConfig['AB+'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="AB-" 
                        stackId="1" 
                        stroke={chartConfig['AB-'].color} 
                        fill={chartConfig['AB-'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="O+" 
                        stackId="1" 
                        stroke={chartConfig['O+'].color} 
                        fill={chartConfig['O+'].color} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="O-" 
                        stackId="1" 
                        stroke={chartConfig['O-'].color} 
                        fill={chartConfig['O-'].color} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Loading analytics...</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Please wait while we fetch the donation trends data.
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
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Blood Donations</CardTitle>
                <CardDescription>Last 5 blood units collected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestDonations.map(unit => (
                    <div key={unit.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
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
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Urgent Blood Requests</CardTitle>
                <CardDescription>High priority requests that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgentRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
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
      </div>
    </>
  );
}
