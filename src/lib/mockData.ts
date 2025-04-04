
import { Donor, BloodUnit, BloodRequest, InventoryStats, BloodType } from './types';

// Generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generate mock donors
export const mockDonors: Donor[] = Array.from({ length: 20 }, (_, i) => {
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'] as const;
  const names = [
    'John Smith', 'Emma Johnson', 'Michael Davis', 'Sophia Wilson', 'James Brown',
    'Olivia Jones', 'William Miller', 'Ava Taylor', 'Daniel Anderson', 'Mia Thomas',
    'Alexander White', 'Charlotte Harris', 'Benjamin Martin', 'Amelia Thompson', 'Henry Garcia',
    'Ella Martinez', 'Samuel Robinson', 'Grace Lewis', 'Joseph Lee', 'Chloe Walker'
  ];
  
  return {
    id: `D${1000 + i}`,
    name: names[i],
    age: 20 + Math.floor(Math.random() * 40),
    gender: genders[Math.floor(Math.random() * genders.length)],
    bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
    phone: `(${100 + Math.floor(Math.random() * 900)}) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
    email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
    address: `${1000 + Math.floor(Math.random() * 9000)} Main Street, City`,
    lastDonation: Math.random() > 0.2 ? randomDate(new Date(2023, 0, 1), new Date()) : null,
    donationCount: Math.floor(Math.random() * 10),
    createdAt: randomDate(new Date(2020, 0, 1), new Date(2023, 0, 1))
  };
});

// Generate mock blood units
export const mockBloodUnits: BloodUnit[] = Array.from({ length: 50 }, (_, i) => {
  const donor = mockDonors[Math.floor(Math.random() * mockDonors.length)];
  const collectionDate = new Date(randomDate(new Date(2023, 0, 1), new Date()));
  const expiryDate = new Date(collectionDate);
  expiryDate.setDate(expiryDate.getDate() + 42); // Blood typically expires in 42 days
  
  const statuses = ['Available', 'Reserved', 'Used', 'Expired'] as const;
  const weightedStatuses = [
    ...Array(20).fill('Available'),
    ...Array(10).fill('Reserved'),
    ...Array(15).fill('Used'),
    ...Array(5).fill('Expired')
  ];
  
  return {
    id: `BU${10000 + i}`,
    donorId: donor.id,
    donorName: donor.name,
    bloodType: donor.bloodType,
    quantity: 450, // Standard blood donation is about 450 ml
    collectionDate: collectionDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: weightedStatuses[Math.floor(Math.random() * weightedStatuses.length)] as any
  };
});

// Generate mock blood requests
export const mockBloodRequests: BloodRequest[] = Array.from({ length: 15 }, (_, i) => {
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'] as const;
  const patientNames = [
    'Robert Clark', 'Patricia Hall', 'Charles Rodriguez', 'Jennifer Lewis', 'Thomas Young',
    'Linda Green', 'Richard Adams', 'Elizabeth Baker', 'Joseph Hill', 'Barbara Reed',
    'Thomas Allen', 'Susan Morris', 'Paul Murphy', 'Jessica Cook', 'Mark Bell'
  ];
  const hospitals = [
    'Memorial Hospital', 'Central Medical Center', 'City General Hospital', 
    'University Hospital', 'St. Mary\'s Medical Center'
  ];
  const urgencies = ['Low', 'Medium', 'High', 'Critical'] as const;
  const statuses = ['Pending', 'Processing', 'Fulfilled', 'Cancelled'] as const;
  
  return {
    id: `R${5000 + i}`,
    patientName: patientNames[i],
    patientAge: 20 + Math.floor(Math.random() * 60),
    patientGender: genders[Math.floor(Math.random() * genders.length)],
    bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
    quantity: (1 + Math.floor(Math.random() * 3)) * 450, // 1-3 units
    urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
    hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
    requestDate: randomDate(new Date(2023, 6, 1), new Date()),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    notes: Math.random() > 0.7 ? 'Special handling required' : undefined
  };
});

// Generate mock inventory stats
export const mockInventoryStats: InventoryStats[] = (() => {
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return bloodTypes.map(bloodType => {
    const availableUnits = mockBloodUnits.filter(unit => 
      unit.bloodType === bloodType && unit.status === 'Available'
    ).length;
    
    const reservedUnits = mockBloodUnits.filter(unit => 
      unit.bloodType === bloodType && unit.status === 'Reserved'
    ).length;
    
    return {
      bloodType,
      available: availableUnits,
      reserved: reservedUnits
    };
  });
})();

// Simple services to retrieve mock data
export const donorService = {
  getDonors: () => Promise.resolve([...mockDonors]),
  getDonorById: (id: string) => Promise.resolve(mockDonors.find(donor => donor.id === id)),
  addDonor: (donor: Omit<Donor, 'id' | 'createdAt'>) => {
    const newDonor: Donor = {
      ...donor,
      id: `D${1000 + mockDonors.length + 1}`,
      createdAt: new Date().toISOString(),
      donationCount: 0,
      lastDonation: null
    };
    mockDonors.push(newDonor);
    return Promise.resolve(newDonor);
  }
};

export const bloodUnitService = {
  getBloodUnits: () => Promise.resolve([...mockBloodUnits]),
  getBloodUnitById: (id: string) => Promise.resolve(mockBloodUnits.find(unit => unit.id === id)),
  addBloodUnit: (unit: Omit<BloodUnit, 'id'>) => {
    const newUnit: BloodUnit = {
      ...unit,
      id: `BU${10000 + mockBloodUnits.length + 1}`
    };
    mockBloodUnits.push(newUnit);
    return Promise.resolve(newUnit);
  }
};

export const bloodRequestService = {
  getBloodRequests: () => Promise.resolve([...mockBloodRequests]),
  getBloodRequestById: (id: string) => Promise.resolve(mockBloodRequests.find(request => request.id === id)),
  addBloodRequest: (request: Omit<BloodRequest, 'id'>) => {
    const newRequest: BloodRequest = {
      ...request,
      id: `R${5000 + mockBloodRequests.length + 1}`
    };
    mockBloodRequests.push(newRequest);
    return Promise.resolve(newRequest);
  },
  updateBloodRequestStatus: (id: string, status: BloodRequest['status']) => {
    const request = mockBloodRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
    }
    return Promise.resolve(request);
  }
};

export const inventoryService = {
  getInventoryStats: () => Promise.resolve([...mockInventoryStats])
};
