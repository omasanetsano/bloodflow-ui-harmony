import { Donor, BloodType, BloodCollection, BloodRequest, InventoryItem, DonationRecord } from './types';
import { format } from 'date-fns';

// Mock data for donors
let mockDonors: Donor[] = [
  {
    id: 'D0001',
    name: 'John Smith',
    age: 35,
    gender: 'Male',
    bloodType: 'A+',
    phone: '123-456-7890',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown',
    lastDonation: new Date('2023-03-15'),
    donationCount: 3,
  },
  {
    id: 'D0002',
    name: 'Alice Johnson',
    age: 28,
    gender: 'Female',
    bloodType: 'O-',
    phone: '987-654-3210',
    email: 'alice.johnson@example.com',
    address: '456 Oak Ave, Anytown',
    lastDonation: new Date('2023-04-20'),
    donationCount: 5,
  },
  {
    id: 'D0003',
    name: 'Bob Williams',
    age: 42,
    gender: 'Male',
    bloodType: 'B+',
    phone: '555-123-4567',
    address: '789 Pine Ln, Anytown',
    lastDonation: new Date('2023-02-01'),
    donationCount: 2,
  },
  {
    id: 'D0004',
    name: 'Emily Brown',
    age: 31,
    gender: 'Female',
    bloodType: 'AB+',
    phone: '111-222-3333',
    address: '101 Elm Rd, Anytown',
    lastDonation: new Date('2023-05-05'),
    donationCount: 7,
  },
  {
    id: 'D0005',
    name: 'David Garcia',
    age: 25,
    gender: 'Male',
    bloodType: 'A-',
    phone: '444-555-6666',
    address: '222 Maple Dr, Anytown',
    lastDonation: new Date('2023-01-10'),
    donationCount: 1,
  },
];

// Mock data for blood collections
let mockBloodCollections: BloodCollection[] = [
  {
    id: 'BC001',
    date: new Date('2023-05-26'),
    donorId: 'D0001',
    quantity: 450,
    bloodType: 'A+',
    status: 'Processing',
  },
  {
    id: 'BC002',
    date: new Date('2023-05-27'),
    donorId: 'D0002',
    quantity: 400,
    bloodType: 'O-',
    status: 'Available',
  },
];

// Mock data for blood requests
let mockBloodRequests: BloodRequest[] = [
  {
    id: 'BR001',
    date: new Date('2023-05-28'),
    patientName: 'Jane Doe',
    bloodType: 'O-',
    quantity: 2,
    status: 'Pending',
  },
  {
    id: 'BR002',
    date: new Date('2023-05-29'),
    patientName: 'Richard Roe',
    bloodType: 'A+',
    quantity: 1,
    status: 'Completed',
  },
];

// Mock data for inventory
let bloodInventory: { [key: string]: InventoryItem } = {
  APos: { bloodType: 'A+', available: 5, total: 10 },
  ANeg: { bloodType: 'A-', available: 3, total: 5 },
  BPos: { bloodType: 'B+', available: 2, total: 7 },
  BNeg: { bloodType: 'B-', available: 1, total: 3 },
  ABPos: { bloodType: 'AB+', available: 4, total: 6 },
  ABNeg: { bloodType: 'AB-', available: 2, total: 4 },
  OPos: { bloodType: 'O+', available: 7, total: 12 },
  ONeg: { bloodType: 'O-', available: 6, total: 9 },
};

let mockDonations: DonationRecord[] = [];

export const donorService = {
  getDonors: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockDonors;
  },
  
  getDonorById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const donor = mockDonors.find(donor => donor.id === id);
    if (!donor) throw new Error('Donor not found');
    return donor;
  },
  
  addDonor: async (donorData: Omit<Donor, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate a unique ID
    const id = `D${String(mockDonors.length + 1).padStart(4, '0')}`;
    
    const newDonor: Donor = {
      id,
      ...donorData
    };
    
    mockDonors.unshift(newDonor);
    return newDonor;
  },
  
  updateDonor: async (id: string, donorData: Partial<Donor>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockDonors.findIndex(donor => donor.id === id);
    if (index === -1) throw new Error('Donor not found');
    
    mockDonors[index] = { ...mockDonors[index], ...donorData };
    return mockDonors[index];
  },
  
  deleteDonor: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const index = mockDonors.findIndex(donor => donor.id === id);
    if (index === -1) throw new Error('Donor not found');
    
    mockDonors.splice(index, 1);
    return { success: true };
  },
  
  recordDonation: async (donorId: string, donationData: {
    date: Date;
    quantity: number;
    hemoglobin?: number;
    notes?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const donor = mockDonors.find(d => d.id === donorId);
    if (!donor) throw new Error('Donor not found');
    
    // Update donor data
    donor.lastDonation = donationData.date;
    donor.donationCount = (donor.donationCount || 0) + 1;
    
    // Create a donation record
    const donationId = `DN${String(mockDonations.length + 1).padStart(4, '0')}`;
    
    const newDonation = {
      id: donationId,
      donorId,
      donorName: donor.name,
      donorBloodType: donor.bloodType,
      date: donationData.date,
      quantity: donationData.quantity,
      hemoglobin: donationData.hemoglobin,
      notes: donationData.notes,
      status: 'Processing' as const
    };
    
    mockDonations.unshift(newDonation);
    
    // Update inventory
    const bloodTypeKey = donor.bloodType.replace('+', 'Pos').replace('-', 'Neg');
    if (bloodInventory[bloodTypeKey as keyof typeof bloodInventory]) {
      bloodInventory[bloodTypeKey as keyof typeof bloodInventory].available += donationData.quantity;
      bloodInventory[bloodTypeKey as keyof typeof bloodInventory].total += donationData.quantity;
    }
    
    return newDonation;
  }
};

export const bloodCollectionService = {
  getBloodCollections: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBloodCollections;
  },
  
  getBloodCollectionById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const collection = mockBloodCollections.find(collection => collection.id === id);
    if (!collection) throw new Error('Blood collection not found');
    return collection;
  },
  
  addBloodCollection: async (collectionData: Omit<BloodCollection, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const id = `BC${String(mockBloodCollections.length + 1).padStart(3, '0')}`;
    
    const newCollection: BloodCollection = {
      id,
      ...collectionData
    };
    
    mockBloodCollections.unshift(newCollection);
    return newCollection;
  },
  
  updateBloodCollection: async (id: string, collectionData: Partial<BloodCollection>) => {
    await new Promise(resolve => setTimeout(resolve, 450));
    
    const index = mockBloodCollections.findIndex(collection => collection.id === id);
    if (index === -1) throw new Error('Blood collection not found');
    
    mockBloodCollections[index] = { ...mockBloodCollections[index], ...collectionData };
    return mockBloodCollections[index];
  },
  
  deleteBloodCollection: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockBloodCollections.findIndex(collection => collection.id === id);
    if (index === -1) throw new Error('Blood collection not found');
    
    mockBloodCollections.splice(index, 1);
    return { success: true };
  }
};

export const bloodRequestService = {
  getBloodRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBloodRequests;
  },
  
  getBloodRequestById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const request = mockBloodRequests.find(request => request.id === id);
    if (!request) throw new Error('Blood request not found');
    return request;
  },
  
  addBloodRequest: async (requestData: Omit<BloodRequest, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const id = `BR${String(mockBloodRequests.length + 1).padStart(3, '0')}`;
    
    const newRequest: BloodRequest = {
      id,
      ...requestData
    };
    
    mockBloodRequests.unshift(newRequest);
    return newRequest;
  },
  
  updateBloodRequest: async (id: string, requestData: Partial<BloodRequest>) => {
    await new Promise(resolve => setTimeout(resolve, 450));
    
    const index = mockBloodRequests.findIndex(request => request.id === id);
    if (index === -1) throw new Error('Blood request not found');
    
    mockBloodRequests[index] = { ...mockBloodRequests[index], ...requestData };
    return mockBloodRequests[index];
  },
  
  deleteBloodRequest: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockBloodRequests.findIndex(request => request.id === id);
    if (index === -1) throw new Error('Blood request not found');
    
    mockBloodRequests.splice(index, 1);
    return { success: true };
  }
};

export const inventoryService = {
  getInventory: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.values(bloodInventory);
  },
  
  updateInventoryItem: async (bloodType: BloodType, itemData: Partial<InventoryItem>) => {
    await new Promise(resolve => setTimeout(resolve, 450));
    
    const bloodTypeKey = bloodType.replace('+', 'Pos').replace('-', 'Neg');
    if (!bloodInventory[bloodTypeKey as keyof typeof bloodInventory]) throw new Error('Blood type not found in inventory');
    
    bloodInventory[bloodTypeKey as keyof typeof bloodInventory] = { ...bloodInventory[bloodTypeKey as keyof typeof bloodInventory], ...itemData };
    return bloodInventory[bloodTypeKey as keyof typeof bloodInventory];
  }
};
