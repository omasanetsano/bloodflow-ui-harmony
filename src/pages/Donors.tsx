
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  PlusIcon, 
  SearchIcon, 
  DropletIcon,
  XIcon,
  UserPlusIcon
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Donor, BloodType } from '@/lib/types';
import { donorService } from '@/lib/mockData';
import BloodTypeTag from '@/components/BloodTypeTag';
import { toast } from 'sonner';

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    age: '',
    gender: '',
    bloodType: '',
    phone: '',
    email: '',
    address: ''
  });

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      const data = await donorService.getDonors();
      setDonors(data);
      setFilteredDonors(data);
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast.error('Failed to load donors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDonors(donors);
    } else {
      const filtered = donors.filter(donor => 
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.phone.includes(searchQuery)
      );
      setFilteredDonors(filtered);
    }
  }, [searchQuery, donors]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDonor(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewDonor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDonor = async () => {
    // Basic form validation
    if (!newDonor.name || !newDonor.bloodType || !newDonor.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const donorData = {
        name: newDonor.name,
        age: parseInt(newDonor.age) || 0,
        gender: newDonor.gender as 'Male' | 'Female' | 'Other',
        bloodType: newDonor.bloodType as BloodType,
        phone: newDonor.phone,
        email: newDonor.email,
        address: newDonor.address,
        lastDonation: null,
        donationCount: 0
      };

      const addedDonor = await donorService.addDonor(donorData);
      setDonors(prev => [addedDonor, ...prev]);
      toast.success('Donor added successfully');
      setIsDialogOpen(false);
      
      // Reset form
      setNewDonor({
        name: '',
        age: '',
        gender: '',
        bloodType: '',
        phone: '',
        email: '',
        address: ''
      });
    } catch (error) {
      console.error('Error adding donor:', error);
      toast.error('Failed to add donor');
    }
  };

  return (
    <>
      <Helmet>
        <title>Donors | Blood Bank Management System</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Donors</h1>
            <p className="text-muted-foreground">
              Manage blood donor records
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Donor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Donor</DialogTitle>
                <DialogDescription>
                  Enter the details of the new donor here. Required fields are marked with *.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={newDonor.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="age" className="text-sm font-medium">
                      Age
                    </label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={newDonor.age}
                      onChange={handleInputChange}
                      placeholder="30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="gender" className="text-sm font-medium">
                      Gender
                    </label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('gender', value)}
                      value={newDonor.gender}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="bloodType" className="text-sm font-medium">
                    Blood Type *
                  </label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('bloodType', value)}
                    value={newDonor.bloodType}
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Select" />
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
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newDonor.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newDonor.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={newDonor.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, City"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDonor}>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Donor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9 pr-10"
            placeholder="Search donors by name, ID, blood type..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={clearSearch}
            >
              <XIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Donors List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Placeholder cards for loading state
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDonors.length > 0 ? (
            filteredDonors.map(donor => (
              <Card key={donor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{donor.name}</CardTitle>
                    <BloodTypeTag type={donor.bloodType} />
                  </div>
                  <CardDescription>
                    ID: {donor.id} • Age: {donor.age} • {donor.gender}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">Phone:</span> {donor.phone}
                    </p>
                    {donor.email && (
                      <p className="flex items-center gap-2">
                        <span className="text-gray-500">Email:</span> {donor.email}
                      </p>
                    )}
                    {donor.address && (
                      <p className="flex items-center gap-2">
                        <span className="text-gray-500">Address:</span> {donor.address}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">Donations:</span> {donor.donationCount}
                      {donor.lastDonation && ` • Last: ${new Date(donor.lastDonation).toLocaleDateString()}`}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 p-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <DropletIcon className="h-4 w-4 mr-2 text-bloodRed-500" />
                    Record Donation
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="lg:col-span-3 p-8 text-center">
              <div className="mx-auto w-full max-w-md">
                <div className="rounded-full bg-muted w-12 h-12 mx-auto flex items-center justify-center mb-4">
                  <SearchIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No donors found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No donors matching "${searchQuery}"`
                    : "There are no donors registered yet."}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
