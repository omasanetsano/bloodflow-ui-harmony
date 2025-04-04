
import { useState } from 'react';
import { Calendar, DropletIcon } from 'lucide-react';
import { format } from 'date-fns';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Donor } from '@/lib/types';
import { donorService } from '@/lib/mockData';

interface RecordDonationDialogProps {
  donor: Donor;
  onDonationRecorded: () => void;
}

export default function RecordDonationDialog({ donor, onDonationRecorded }: RecordDonationDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [donationDate, setDonationDate] = useState<Date | undefined>(new Date());
  const [quantity, setQuantity] = useState('450');
  const [hemoglobin, setHemoglobin] = useState('14');
  const [notes, setNotes] = useState('');

  const handleRecordDonation = async () => {
    if (!donationDate) {
      toast.error('Please select a donation date');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    try {
      await donorService.recordDonation(donor.id, {
        date: donationDate,
        quantity: parseInt(quantity),
        hemoglobin: parseFloat(hemoglobin),
        notes: notes
      });
      
      toast.success('Donation recorded successfully');
      setIsDialogOpen(false);
      onDonationRecorded();
      
      // Reset form
      setDonationDate(new Date());
      setQuantity('450');
      setHemoglobin('14');
      setNotes('');
    } catch (error) {
      console.error('Error recording donation:', error);
      toast.error('Failed to record donation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <DropletIcon className="h-4 w-4 mr-2 text-bloodRed-500" />
          Record Donation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Blood Donation</DialogTitle>
          <DialogDescription>
            Record a new blood donation for {donor.name} ({donor.bloodType}).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Donation Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !donationDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {donationDate ? format(donationDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={donationDate}
                  onSelect={setDonationDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity (ml) *
            </label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="10"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="hemoglobin" className="text-sm font-medium">
              Hemoglobin Level (g/dL)
            </label>
            <Input
              id="hemoglobin"
              type="number"
              value={hemoglobin}
              onChange={(e) => setHemoglobin(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRecordDonation} 
            disabled={isLoading}
            className="bg-bloodRed-500 hover:bg-bloodRed-600"
          >
            {isLoading ? 'Recording...' : 'Record Donation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
