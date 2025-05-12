
// This is a placeholder auth utility that will be replaced with Supabase auth

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
  window.location.href = "/login";
};

// Get current user info
export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  
  return {
    email: localStorage.getItem("userEmail") || "",
    // In a real app with Supabase, we would get more user data here
  };
};
