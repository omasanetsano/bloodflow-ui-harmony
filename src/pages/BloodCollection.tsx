import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  DropletIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import BloodTypeTag from '@/components/BloodTypeTag';
import StatusBadge from '@/components/StatusBadge';
import { DEFAULT_HOSPITAL_NAME } from '@/lib/constants';
import { donorService, bloodUnitService } from '@/lib/mockData';
import { BloodUnit, Donor, BloodType } from '@/lib/types';
import { getHospitalInfo } from '@/utils/auth';

const formSchema = z.object({
  donorId: z.string().min(1, { message: 'Donor is required' }),
  quantity: z.number().min(200, { message: 'Minimum donation is 200ml' }).max(500, { message: 'Maximum donation is 500ml' }),
  notes: z.string().optional(),
  hemoglobin: z.number().min(12, { message: 'Hemoglobin must be at least 12 g/dL' }).optional(),
});

export default function BloodCollection() {
  const [donations, setDonations] = useState<BloodUnit[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [hospital, setHospital] = useState<any>(null);
  const hospitalName = hospital?.name || DEFAULT_HOSPITAL_NAME;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 450,
      notes: '',
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsData, donorsData] = await Promise.all([
        bloodUnitService.getBloodUnits(),
        donorService.getDonors(),
        // Add fetch for hospital info
      ]);
      
      setDonations(donationsData);
      setDonors(donorsData);
      
      // Fetch hospital info
      const hospitalInfo = await getHospitalInfo();
      setHospital(hospitalInfo);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || 
      donation.bloodType === filterType ||
      donation.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const donor = donors.find(d => d.id === values.donorId);
      
      if (!donor) {
        toast.error('Donor not found');
        return;
      }
      
      const newDonation = {
        donorId: donor.id,
        donorName: donor.name,
        bloodType: donor.bloodType,
        quantity: values.quantity,
        collectionDate: new Date().toISOString().split('T')[0],
        status: 'Processing' as const,
        notes: values.notes
      };
      
      await bloodUnitService.addBloodUnit(newDonation);
      
      // Update donor's last donation and count
      await donorService.updateDonor(donor.id, {
        lastDonation: new Date(),
        donationCount: donor.donationCount + 1
      });
      
      toast.success('Blood donation recorded successfully');
      setOpen(false);
      form.reset();
      fetchData();
    } catch (error) {
      console.error('Error recording donation:', error);
      toast.error('Failed to record donation');
    }
  };

  const handleExport = () => {
    // In a real app, this would generate a CSV or PDF file
    toast.success('Donation records exported successfully');
  };

  return (
    <>
      <Helmet>
        <title>Blood Collection | {hospitalName} Blood Bank</title>
      </Helmet>
      
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blood Collection</h1>
            <p className="text-muted-foreground">
              Record and manage blood donation records
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-bloodRed-500 hover:bg-bloodRed-600 text-white">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Donation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Record Blood Donation</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new blood donation below.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="donorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Donor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a donor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {donors.map((donor) => (
                                <SelectItem key={donor.id} value={donor.id}>
                                  {donor.name} ({donor.bloodType})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity (ml)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="200" 
                              max="500" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Standard donation is 450ml
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hemoglobin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hemoglobin (g/dL)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              min="0"
                              placeholder="13.5"
                              {...field}
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum requirement is 12 g/dL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-bloodRed-500 hover:bg-bloodRed-600 text-white">
                        Record Donation
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleExport}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Blood Donation Records</CardTitle>
            <CardDescription>View and manage all blood donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search by donor name, ID, or blood type..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blood Types</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Collection Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCwIcon className="h-6 w-6 text-muted-foreground animate-spin mb-2" />
                          <span className="text-muted-foreground">Loading records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDonations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <DropletIcon className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-muted-foreground">No blood donation records found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">{donation.id}</TableCell>
                        <TableCell>{donation.donorName}</TableCell>
                        <TableCell>
                          <BloodTypeTag type={donation.bloodType} />
                        </TableCell>
                        <TableCell>{donation.quantity} ml</TableCell>
                        <TableCell>{formatDate(donation.collectionDate)}</TableCell>
                        <TableCell>{formatDate(donation.expiryDate)}</TableCell>
                        <TableCell>
                          <StatusBadge status={donation.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>Showing {filteredDonations.length} of {donations.length} donations</div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
