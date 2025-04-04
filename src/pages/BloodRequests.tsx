
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircleIcon
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import BloodTypeTag from '@/components/BloodTypeTag';
import StatusBadge from '@/components/StatusBadge';
import { HOSPITAL_NAME } from './Dashboard';
import { bloodRequestService, inventoryService } from '@/lib/mockData';
import { BloodRequest, BloodType, InventoryStats } from '@/lib/types';

const formSchema = z.object({
  patientName: z.string().min(1, { message: 'Patient name is required' }),
  patientAge: z.number().min(0, { message: 'Age must be a positive number' }),
  patientGender: z.enum(['Male', 'Female', 'Other']),
  bloodType: z.string() as z.ZodType<BloodType>,
  quantity: z.number().min(1, { message: 'Quantity must be at least 1 unit' }),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']),
  hospital: z.string().min(1, { message: 'Hospital name is required' }),
  notes: z.string().optional(),
});

export default function BloodRequests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientAge: 30,
      patientGender: 'Male',
      bloodType: 'A+',
      quantity: 1,
      urgency: 'Medium',
      hospital: HOSPITAL_NAME,
      notes: '',
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsData, inventoryData] = await Promise.all([
        bloodRequestService.getBloodRequests(),
        inventoryService.getInventoryStats()
      ]);
      
      setRequests(requestsData);
      setInventory(inventoryData);
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

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || 
      request.bloodType === filterType ||
      request.urgency === filterType ||
      request.status === filterType;
    
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
      // Create new request object
      const newRequest = {
        id: `BR${String(requests.length + 1).padStart(3, '0')}`,
        patientName: values.patientName,
        patientAge: values.patientAge,
        patientGender: values.patientGender,
        bloodType: values.bloodType,
        quantity: values.quantity,
        urgency: values.urgency,
        hospital: values.hospital,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending' as const,
        notes: values.notes
      };
      
      await bloodRequestService.addBloodRequest(newRequest);
      
      // Check inventory levels and show warning if critically low
      const bloodTypeInventory = inventory.find(item => item.bloodType === values.bloodType);
      
      if (bloodTypeInventory && bloodTypeInventory.available < values.quantity) {
        toast.warning(`Warning: Requested blood type ${values.bloodType} is low in inventory (${bloodTypeInventory.available} units available)`);
      }
      
      toast.success('Blood request recorded successfully');
      setOpen(false);
      form.reset();
      fetchData();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    }
  };

  const handleFulfillRequest = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        toast.error('Request not found');
        return;
      }
      
      // Check if we have enough inventory
      const bloodTypeInventory = inventory.find(item => item.bloodType === request.bloodType);
      
      if (!bloodTypeInventory || bloodTypeInventory.available < request.quantity) {
        toast.error(`Not enough ${request.bloodType} blood in inventory. Available: ${bloodTypeInventory?.available || 0} units`);
        return;
      }
      
      // Update the request status
      await bloodRequestService.updateBloodRequest(requestId, { status: 'Fulfilled' });
      
      // Update inventory
      const inventoryItem = await inventoryService.getInventoryItem(request.bloodType);
      if (inventoryItem) {
        await inventoryService.updateInventoryItem(request.bloodType, {
          available: inventoryItem.available - request.quantity
        });
      }
      
      toast.success(`Request ${requestId} has been fulfilled`);
      fetchData();
    } catch (error) {
      console.error('Error fulfilling request:', error);
      toast.error('Failed to fulfill request');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await bloodRequestService.updateBloodRequest(requestId, { status: 'Cancelled' });
      toast.success(`Request ${requestId} has been cancelled`);
      fetchData();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  return (
    <>
      <Helmet>
        <title>Blood Requests | {HOSPITAL_NAME} Blood Bank</title>
      </Helmet>
      
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blood Requests</h1>
            <p className="text-muted-foreground">
              Manage incoming blood requests and patient needs
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-bloodRed-500 hover:bg-bloodRed-600 text-white">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Blood Request</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new blood request below.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="patientGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity (units)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hospital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
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
                        Create Request
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Blood Requests</CardTitle>
            <CardDescription>Manage and fulfill blood requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search by patient name, hospital, or blood type..." 
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
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCwIcon className="h-6 w-6 text-muted-foreground animate-spin mb-2" />
                          <span className="text-muted-foreground">Loading requests...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <ClipboardListIcon className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-muted-foreground">No blood requests found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>
                          {request.patientName}
                          <div className="text-xs text-muted-foreground">
                            {request.patientAge} years, {request.patientGender}
                          </div>
                        </TableCell>
                        <TableCell>
                          <BloodTypeTag type={request.bloodType} />
                        </TableCell>
                        <TableCell>{request.quantity} units</TableCell>
                        <TableCell>{request.hospital}</TableCell>
                        <TableCell>{formatDate(request.requestDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={request.status} />
                            {request.urgency === 'Critical' && (
                              <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.status === 'Pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/20"
                                  onClick={() => handleFulfillRequest(request.id)}
                                >
                                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                  Fulfill
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                                  onClick={() => handleCancelRequest(request.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>Showing {filteredRequests.length} of {requests.length} requests</div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
