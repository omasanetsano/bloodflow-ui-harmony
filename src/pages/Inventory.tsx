
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  ArchiveIcon, 
  DropletIcon, 
  AlertTriangleIcon, 
  RefreshCwIcon,
  FilterIcon,
  CalendarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  FileTextIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltipContent,
  ChartTooltip
} from '@/components/ui/chart';
import BloodTypeTag from '@/components/BloodTypeTag';
import { HOSPITAL_NAME } from './Dashboard';
import { inventoryService, bloodUnitService } from '@/lib/mockData';
import { InventoryItem, BloodType, BloodUnit } from '@/lib/types';
import { jsPDF } from 'jspdf';

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expiringUnits, setExpiringUnits] = useState<BloodUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [ajustInventoryOpen, setAdjustInventoryOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType>('A+');
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryData, unitsData] = await Promise.all([
        inventoryService.getInventory(),
        bloodUnitService.getBloodUnits()
      ]);
      
      setInventory(inventoryData);
      
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const expiring = unitsData.filter(unit => {
        const expiryDate = new Date(unit.expiryDate);
        return expiryDate <= nextWeek && expiryDate >= today && unit.status === 'Available';
      });
      
      setExpiringUnits(expiring);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const daysUntilExpiry = (expiryDateString: string) => {
    const today = new Date();
    const expiryDate = new Date(expiryDateString);
    const differenceInTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days <= 2) return 'text-red-500';
    if (days <= 5) return 'text-amber-500';
    return 'text-green-500';
  };

  const filteredInventory = inventory.filter(item => {
    return filterType === 'all' || item.bloodType === filterType;
  });

  const chartData = inventory.map(item => ({
    name: item.bloodType,
    value: item.available,
    total: item.total,
    fill: getBloodTypeColor(item.bloodType)
  }));

  function getBloodTypeColor(bloodType: BloodType): string {
    const colors: Record<BloodType, string> = {
      'A+': '#F87171',
      'A-': '#FB923C',
      'B+': '#FBBF24',
      'B-': '#34D399',
      'AB+': '#60A5FA',
      'AB-': '#818CF8',
      'O+': '#A78BFA',
      'O-': '#F472B6'
    };
    return colors[bloodType];
  }

  const exportInventoryReport = () => {
    try {
      toast.success("Generating PDF report...");
      
      // Create new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Blood Inventory Report", 15, 20);
      
      // Add timestamp
      const now = new Date();
      doc.setFontSize(10);
      doc.text(`Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 15, 30);
      
      // Add hospital name
      doc.setFontSize(12);
      doc.text(`${HOSPITAL_NAME} Blood Bank`, 15, 40);
      
      // Add inventory section
      doc.setFontSize(14);
      doc.text("Current Inventory Levels", 15, 55);
      
      // Create a table for inventory data
      let yPos = 65;
      doc.setFontSize(10);
      doc.text("Blood Type", 15, yPos);
      doc.text("Available Units", 60, yPos);
      doc.text("Total Capacity", 110, yPos);
      doc.text("Status", 160, yPos);
      
      yPos += 5;
      doc.line(15, yPos, 195, yPos);
      yPos += 10;
      
      // Add inventory data rows
      filteredInventory.forEach(item => {
        const percentUsed = Math.floor((item.available / item.total) * 100);
        let statusText = "Adequate";
        
        if (percentUsed <= 15) {
          statusText = "Critical";
        } else if (percentUsed <= 30) {
          statusText = "Low";
        }
        
        doc.text(item.bloodType, 15, yPos);
        doc.text(item.available.toString(), 60, yPos);
        doc.text(item.total.toString(), 110, yPos);
        doc.text(statusText, 160, yPos);
        
        yPos += 10;
      });
      
      // Add expiring units section if available
      if (expiringUnits.length > 0) {
        yPos += 10;
        doc.setFontSize(14);
        doc.text("Units Expiring Soon", 15, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text("Unit ID", 15, yPos);
        doc.text("Blood Type", 60, yPos);
        doc.text("Expiry Date", 110, yPos);
        doc.text("Days Left", 160, yPos);
        
        yPos += 5;
        doc.line(15, yPos, 195, yPos);
        yPos += 10;
        
        // Add expiring units data
        expiringUnits.slice(0, 5).forEach(unit => {
          const days = daysUntilExpiry(unit.expiryDate);
          
          doc.text(unit.id, 15, yPos);
          doc.text(unit.bloodType, 60, yPos);
          doc.text(formatDate(unit.expiryDate), 110, yPos);
          doc.text(days.toString(), 160, yPos);
          
          yPos += 10;
        });
      }
      
      // Save and trigger download
      doc.save("InventoryReport.pdf");
      
      toast.success("Inventory report downloaded successfully");
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate inventory report');
    }
  };

  const handleAdjustInventory = async () => {
    try {
      const item = inventory.find(i => i.bloodType === selectedBloodType);
      
      if (!item) {
        toast.error(`Blood type ${selectedBloodType} not found in inventory`);
        return;
      }
      
      const newAvailable = Math.max(0, item.available + adjustmentAmount);
      const newTotal = Math.max(newAvailable, item.total + adjustmentAmount);
      
      await inventoryService.updateInventoryItem(selectedBloodType, {
        available: newAvailable,
        total: newTotal
      });
      
      const actionType = adjustmentAmount > 0 ? 'added to' : 'removed from';
      toast.success(`${Math.abs(adjustmentAmount)} units ${actionType} ${selectedBloodType} inventory`);
      
      setAdjustInventoryOpen(false);
      setAdjustmentAmount(0);
      fetchData();
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      toast.error('Failed to adjust inventory');
    }
  };

  return (
    <>
      <Helmet>
        <title>Inventory | {HOSPITAL_NAME} Blood Bank</title>
      </Helmet>
      
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blood Inventory</h1>
            <p className="text-muted-foreground">
              Manage blood stock levels and track blood unit status
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={exportInventoryReport} 
              className="flex gap-2 items-center"
            >
              <FileTextIcon className="h-4 w-4" />
              Generate Report
            </Button>
            <Dialog open={ajustInventoryOpen} onOpenChange={setAdjustInventoryOpen}>
              <DialogTrigger asChild>
                <Button className="bg-bloodRed-500 hover:bg-bloodRed-600 text-white">
                  <DropletIcon className="mr-2 h-4 w-4" />
                  Adjust Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Adjust Inventory</DialogTitle>
                  <DialogDescription>
                    Add or remove blood units from the inventory.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blood Type</label>
                    <Select value={selectedBloodType} onValueChange={(value) => setSelectedBloodType(value as BloodType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adjustment</label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAdjustmentAmount(prev => prev - 1)}
                      >
                        <TrendingDownIcon className="h-4 w-4" />
                      </Button>
                      
                      <input
                        type="number"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-border px-3 py-2 text-sm"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAdjustmentAmount(prev => prev + 1)}
                      >
                        <TrendingUpIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {adjustmentAmount > 0 ? `Adding ${adjustmentAmount} units` : adjustmentAmount < 0 ? `Removing ${Math.abs(adjustmentAmount)} units` : 'No change'}
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAdjustInventoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAdjustInventory} 
                    disabled={adjustmentAmount === 0}
                    className={adjustmentAmount > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {adjustmentAmount > 0 ? 'Add Units' : adjustmentAmount < 0 ? 'Remove Units' : 'No Change'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <section>
          <Card className="bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Inventory Overview</CardTitle>
              <CardDescription>Current blood levels by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] relative">
                <ChartContainer config={{}} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                      layout="vertical"
                      barSize={24}
                      barGap={8}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        domain={[0, 'dataMax + 5']}
                        tick={{ fill: 'var(--foreground)' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={50}
                        tick={{ fill: 'var(--foreground)' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Available Units"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.fill}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-gradient-to-br from-card to-accent/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-medium">Inventory Levels</CardTitle>
                <CardDescription>Current stock levels and capacity</CardDescription>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Available Units</TableHead>
                      <TableHead>Total Capacity</TableHead>
                      <TableHead>Usage Level</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center">
                            <RefreshCwIcon className="h-6 w-6 text-muted-foreground animate-spin mb-2" />
                            <span className="text-muted-foreground">Loading inventory...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center">
                            <ArchiveIcon className="h-6 w-6 text-muted-foreground mb-2" />
                            <span className="text-muted-foreground">No inventory records found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => {
                        const percentUsed = Math.floor((item.available / item.total) * 100);
                        let statusColor = "bg-green-500";
                        let statusText = "Adequate";
                        
                        if (percentUsed <= 15) {
                          statusColor = "bg-red-500";
                          statusText = "Critical";
                        } else if (percentUsed <= 30) {
                          statusColor = "bg-amber-500";
                          statusText = "Low";
                        }
                        
                        return (
                          <TableRow key={item.bloodType}>
                            <TableCell>
                              <BloodTypeTag type={item.bloodType} />
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.available} units
                            </TableCell>
                            <TableCell>{item.total} units</TableCell>
                            <TableCell>
                              <div className="w-full flex items-center gap-2">
                                <Progress value={percentUsed} className="h-2" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {percentUsed}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                                <span className="text-sm">{statusText}</span>
                                {percentUsed <= 15 && (
                                  <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-gradient-to-br from-card to-primary/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Expiring Soon</CardTitle>
              <CardDescription>Blood units expiring in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringUnits.length === 0 ? (
                <div className="text-center py-6 bg-muted rounded-md">
                  <CalendarIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No units expiring in the next 7 days</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit ID</TableHead>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Collection Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringUnits.map((unit) => {
                        const daysLeft = daysUntilExpiry(unit.expiryDate);
                        return (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.id}</TableCell>
                            <TableCell>
                              <BloodTypeTag type={unit.bloodType} />
                            </TableCell>
                            <TableCell>{unit.quantity} ml</TableCell>
                            <TableCell>{formatDate(unit.collectionDate)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{formatDate(unit.expiryDate)}</span>
                                <span className={`text-xs ${getStatusColor(daysLeft)}`}>
                                  ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} left)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span>Available</span>
                                {daysLeft <= 2 && (
                                  <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
