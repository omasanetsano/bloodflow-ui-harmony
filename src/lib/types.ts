
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Donor = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: BloodType;
  phone: string;
  email: string;
  address: string;
  lastDonation: string | null;
  donationCount: number;
  createdAt: string;
};

export type BloodUnit = {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: BloodType;
  quantity: number; // in ml
  collectionDate: string;
  expiryDate: string;
  status: 'Available' | 'Reserved' | 'Used' | 'Expired';
};

export type BloodRequest = {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  bloodType: BloodType;
  quantity: number; // in ml
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  hospital: string;
  requestDate: string;
  status: 'Pending' | 'Processing' | 'Fulfilled' | 'Cancelled';
  notes?: string;
};

export type InventoryStats = {
  bloodType: BloodType;
  available: number; // units
  reserved: number; // units
};
