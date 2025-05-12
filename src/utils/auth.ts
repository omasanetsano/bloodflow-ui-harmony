
// This is a placeholder auth utility that will be replaced with Supabase auth

// Define the hospital type for type safety
export type HospitalType = 'private' | 'government' | 'nonprofit';

export interface Hospital {
  name: string;
  type: HospitalType;
}

// Mock function to simulate login
export const login = (email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would validate against Supabase
      if (email && password) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", "hospital");
        resolve(true);
      } else {
        resolve(false);
      }
    }, 800);
  });
};

// Mock function to simulate registration
export const register = (data: any): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would register with Supabase
      localStorage.setItem("registrationData", JSON.stringify(data));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", "hospital");
      
      // Store hospital info
      const hospitals = [{
        name: data.hospitalName,
        type: data.hospitalType
      }];
      localStorage.setItem("managedHospitals", JSON.stringify(hospitals));
      
      resolve(true);
    }, 800);
  });
};

// Mock function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Mock function to logout
export const logout = (): void => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("managedHospitals");
  window.location.href = "/login";
};

// Get current user info
export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  
  const managedHospitals = localStorage.getItem("managedHospitals") 
    ? JSON.parse(localStorage.getItem("managedHospitals") || "[]")
    : [];
    
  return {
    email: localStorage.getItem("userEmail") || "",
    role: localStorage.getItem("userRole") || "hospital",
    managedHospitals
    // In a real app with Supabase, we would get more user data here
  };
};

// Get managed hospitals
export const getManagedHospitals = (): Hospital[] => {
  return localStorage.getItem("managedHospitals") 
    ? JSON.parse(localStorage.getItem("managedHospitals") || "[]")
    : [];
};
