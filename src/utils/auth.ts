
// This is a placeholder auth utility that will be replaced with Supabase auth

// Define the hospital type for type safety
export type HospitalType = 'private' | 'government' | 'nonprofit';

export interface Hospital {
  name: string;
  type: HospitalType;
}

export interface Admin {
  name: string;
  email: string;
}

// Mock function to simulate login
export const login = (email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would validate against Supabase
      if (email && password) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
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
      
      // Store hospital info
      const hospital = {
        name: data.hospitalName,
        type: data.hospitalType
      };
      localStorage.setItem("hospital", JSON.stringify(hospital));
      
      // Store admin info
      const admin = {
        name: data.name,
        email: data.email
      };
      localStorage.setItem("admin", JSON.stringify(admin));
      
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
  localStorage.removeItem("hospital");
  localStorage.removeItem("admin");
  localStorage.removeItem("registrationData");
  window.location.href = "/login";
};

// Get current hospital info
export const getHospitalInfo = (): Hospital | null => {
  if (!isAuthenticated()) return null;
  
  try {
    const hospitalData = localStorage.getItem("hospital");
    if (hospitalData) {
      return JSON.parse(hospitalData);
    }
    return null;
  } catch (error) {
    console.error("Error parsing hospital data:", error);
    return null;
  }
};

// Get current admin info
export const getAdminInfo = (): Admin | null => {
  if (!isAuthenticated()) return null;
  
  try {
    const adminData = localStorage.getItem("admin");
    if (adminData) {
      return JSON.parse(adminData);
    }
    return null;
  } catch (error) {
    console.error("Error parsing admin data:", error);
    return null;
  }
};
