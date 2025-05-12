import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  DropletIcon, 
  UsersIcon, 
  ClipboardListIcon, 
  AlertTriangleIcon,
  RefreshCwIcon,
  BarChart3Icon,
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
import { APP_NAME } from '@/lib/constants';
import { jsPDF } from 'jspdf';
import { useIsMobile } from '@/hooks/use-mobile';
import { getHospitalInfo } from '@/utils/auth';

export const HOSPITAL_NAME = "LifeFlow Medical Center";

export default function Dashboard() {
  const [inventoryStats, setInventoryStats] = useState<InventoryStats[]>([]);
  const [latestDonations, setLatestDonations] = useState<BloodUnit[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<BloodRequest[]>([]);
  const [donationStats, setDonationStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const hospital = getHospitalInfo();
  const hospitalName = hospital?.name || "Hospital";

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const stats = await inventoryService.getInventoryStats();
      setInventoryStats(stats);
      
      const units = await bloodUnitService.getBloodUnits();
      const sorted = [...units].sort((a, b) => 
        new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime()
      );
      setLatestDonations(sorted.slice(0, 5));
      
      const requests = await bloodRequestService.getBloodRequests();
      const urgent = requests.filter(
        req => (req.urgency === 'High' || req.urgency === 'Critical') && req.status === 'Pending'
      );
      setUrgentRequests(urgent);

      const donations = await donorService.getDonationRecords();
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const donationsByMonth: {[key: string]: {[key: string]: number}} = {};
      
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
        donationsByMonth[monthKey] = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
      }
      
      donations.forEach((donation: DonationRecord) => {
        const donationDate = new Date(donation.date);
        const monthKey = `${monthNames[donationDate.getMonth()]} ${donationDate.getFullYear()}`;
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        if (donationDate >= sixMonthsAgo && donationsByMonth[monthKey]) {
          donationsByMonth[monthKey][donation.donorBloodType] = 
            (donationsByMonth[monthKey][donation.donorBloodType] || 0) + 1;
        }
      });
      
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

  const totalDonors = 20;
  const totalUnits = inventoryStats.reduce((sum, stat) => sum + stat.available, 0);
  const totalRequests = 15;
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

  const exportAnalytics = () => {
    try {
      toast.success("Generating analytics PDF report...");
      
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`${hospitalName} - Blood Bank Analytics`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
      
      doc.setFontSize(14);
      doc.text("Current Blood Inventory", 14, 45);
      doc.setFontSize(10);
      let yPos = 55;
      inventoryStats.forEach(stat => {
        doc.text(`${stat.bloodType}: ${stat.available} units (${stat.reserved} reserved)`, 20, yPos);
        yPos += 7;
      });
      
      doc.setFontSize(14);
      doc.text("Blood Donation Summary", 14, yPos + 10);
      doc.setFontSize(10);
      yPos += 20;
      if (donationStats.length > 0) {
        const lastMonthData = donationStats[donationStats.length - 1];
        doc.text(`Latest Month (${lastMonthData.month})`, 20, yPos);
        yPos += 7;
        Object.entries(lastMonthData)
          .filter(([key]) => key !== 'month' && key !== 'total')
          .forEach(([type, count]) => {
            doc.text(`${type}: ${count} donations`, 25, yPos);
            yPos += 7;
          });
        doc.text(`Total: ${lastMonthData.total} donations`, 20, yPos + 3);
      }
      
      doc.save(`${hospitalName.replace(/\s+/g, '_')}_analytics_report.pdf`);
      
      toast.success("Analytics report downloaded successfully");
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate analytics report');
    }
  };

  const generateReport = () => {
    try {
      toast.success("Comprehensive PDF report generation initiated");
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text(`${APP_NAME}`, 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`${hospitalName} - Comprehensive Blood Bank Report`, 105, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 40, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text("Executive Summary", 14, 55);
      doc.setFontSize(10);
      doc.text(`Total Donors: ${totalDonors}`, 20, 65);
      doc.text(`Available Blood Units: ${totalUnits}`, 20, 72);
      doc.text(`Active Requests: ${totalRequests}`, 20, 79);
      
      doc.setFontSize(14);
      doc.text("Blood Inventory Status", 14, 95);
      doc.setFontSize(10);
      let yPos = 105;
      inventoryStats.forEach(stat => {
        doc.text(`${stat.bloodType}: ${stat.available} units (${stat.reserved} reserved)`, 20, yPos);
        yPos += 7;
      });
      
      if (criticalTypes.length > 0) {
        doc.setTextColor(255, 0, 0);
        doc.text(`Critical Alert: Low stock for ${criticalTypes.join(', ')}`, 20, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += 15;
      } else {
        yPos += 5;
      }
      
      doc.setFontSize(14);
      doc.text("Recent Blood Donations", 14, yPos + 5);
      doc.setFontSize(10);
      yPos += 15;
      latestDonations.forEach(unit => {
        doc.text(`${formatDate(unit.collectionDate)} - ${unit.donorName} (${unit.bloodType}) - ${unit.quantity} ml - ${unit.status}`, 20, yPos);
        yPos += 7;
      });
      
      doc.setFontSize(14);
      doc.text("Urgent Blood Requests", 14, yPos + 10);
      doc.setFontSize(10);
      yPos += 20;
      if (urgentRequests.length > 0) {
        urgentRequests.forEach(request => {
          doc.text(`${formatDate(request.requestDate)} - Patient: ${request.patientName} - ${request.bloodType} - ${request.quantity} ml - ${request.urgency}`, 20, yPos);
          yPos += 7;
        });
      } else {
        doc.text("No urgent requests at this time", 20, yPos);
      }
      
      doc.save(`${hospitalName.replace(/\s+/g, '_')}_comprehensive_report.pdf`);
      
      toast.success("Comprehensive report downloaded successfully");
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      toast.error('Failed to generate comprehensive report');
    }
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
        <title>Dashboard | {hospitalName} Blood Bank</title>
      </Helmet>
      <div className="flex flex-col gap-6 md:gap-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {hospitalName} Blood Bank Management System
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by {APP_NAME}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              className="flex gap-2 items-center text-xs md:text-sm"
              onClick={exportAnalytics}
            >
              <FileTextIcon className="w-3 h-3 md:w-4 md:h-4" />
              {isMobile ? "Report" : "Export Report"}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              className="flex gap-2 items-center text-xs md:text-sm"
              onClick={generateReport}
            >
              <FileTextIcon className="w-3 h-3 md:w-4 md:h-4" />
              {isMobile ? "Full" : "Full Report"}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              className="flex gap-2 items-center text-xs md:text-sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCwIcon className="w-3 h-3 md:w-4 md:h-4" />
              {isMobile ? "" : "Refresh"}
            </Button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Donors"
            value={totalDonors}
            icon={<UsersIcon className="text-bloodRed-500 h-5 w-5" />}
            trend="up"
            trendValue="5% this month"
            valueClassName="text-foreground"
          />
          <StatCard
            title="Available Blood Units"
            value={totalUnits}
            icon={<DropletIcon className="text-bloodRed-500 h-5 w-5" />}
            description="Total units across all blood types"
            valueClassName="text-foreground"
          />
          <StatCard
            title="Active Requests"
            value={totalRequests}
            icon={<ClipboardListIcon className="text-bloodRed-500 h-5 w-5" />}
            trend="down"
            trendValue="2% this week"
            valueClassName="text-foreground"
          />
        </section>

        <section>
          <Card className="bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Blood Inventory</CardTitle>
              <CardDescription>Current blood inventory levels by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {inventoryStats.map(stat => (
                  <div key={stat.bloodType} className="p-3 md:p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <BloodTypeTag type={stat.bloodType} />
                      {stat.available <= 2 && (
                        <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xl md:text-2xl font-semibold">{stat.available}</p>
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
                    <p className="text-xs md:text-sm font-medium">
                      Critical Inventory Alert: Low stock for {criticalTypes.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-gradient-to-br from-card to-accent/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Blood Donation Trends</CardTitle>
              <CardDescription>Monthly donation statistics by blood type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px]">
              {donationStats.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={donationStats}
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 10 : 30, 
                        left: isMobile ? -20 : 0, 
                        bottom: 0 
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: isMobile ? 8 : 12 }}
                        tickFormatter={isMobile ? (value) => value.split(' ')[0] : undefined}
                      />
                      <YAxis 
                        tick={{ fontSize: isMobile ? 8 : 12 }} 
                        width={isMobile ? 20 : 30}
                        label={isMobile ? null : { 
                          value: 'Donations', 
                          angle: -90, 
                          position: 'insideLeft', 
                          style: { fontSize: 12 } 
                        }}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Legend wrapperStyle={{ fontSize: isMobile ? 8 : 12 }} />
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

        <div className="grid lg:grid-cols-2 gap-6">
          <section>
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Blood Donations</CardTitle>
                <CardDescription>Last 5 blood units collected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {latestDonations.map(unit => (
                    <div key={unit.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 md:pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm md:text-base">{unit.donorName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BloodTypeTag type={unit.bloodType} />
                          <span className="text-xs md:text-sm text-gray-500">
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

          <section>
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Urgent Blood Requests</CardTitle>
                <CardDescription>High priority requests that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {urgentRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 md:pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm md:text-base">{request.patientName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BloodTypeTag type={request.bloodType} />
                          <span className="text-xs md:text-sm text-gray-500">
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
