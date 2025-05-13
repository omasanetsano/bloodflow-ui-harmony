
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

// Define the hospital type for type safety
export type HospitalType = 'private' | 'government' | 'nonprofit';

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  email: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

// Login with Supabase
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return false;
    }

    return !!data.session;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

// Register with Supabase
export const register = async (data: {
  name: string;
  email: string;
  password: string;
  hospitalName: string;
  hospitalType: HospitalType;
}): Promise<boolean> => {
  try {
    // First, create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        }
      }
    });

    if (authError || !authData.user) {
      console.error("Registration error:", authError);
      return false;
    }

    // Create hospital record
    const { data: hospitalData, error: hospitalError } = await supabase
      .from('hospitals')
      .insert({
        name: data.hospitalName,
        type: data.hospitalType,
        email: data.email
      })
      .select('id')
      .single();

    if (hospitalError) {
      console.error("Hospital creation error:", hospitalError);
      return false;
    }

    // Create hospital_users record (linking user to hospital)
    const { error: linkError } = await supabase
      .from('hospital_users')
      .insert({
        user_id: authData.user.id,
        hospital_id: hospitalData.id,
        name: data.name,
        role: 'admin' // First user is always admin
      });

    if (linkError) {
      console.error("User-hospital link error:", linkError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Registration error:", error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error("Authentication check error:", error);
    return false;
  }
};

// Logout with Supabase
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Get current hospital info
export const getHospitalInfo = async (): Promise<Hospital | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;
    
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .single();
    
    if (error) {
      console.error("Error fetching hospital info:", error);
      return null;
    }
    
    return data as Hospital;
  } catch (error) {
    console.error("Error getting hospital info:", error);
    return null;
  }
};

// Get current admin info
export const getAdminInfo = async (): Promise<Admin | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;
    
    const { data, error } = await supabase
      .from('hospital_users')
      .select('id, name, role, user_id')
      .eq('user_id', sessionData.session.user.id)
      .single();
    
    if (error) {
      console.error("Error fetching admin info:", error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: sessionData.session.user.email || '',
      role: data.role
    } as Admin;
  } catch (error) {
    console.error("Error getting admin info:", error);
    return null;
  }
};

// Upload hospital logo
export const uploadHospitalLogo = async (
  hospitalId: string,
  file: File
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${hospitalId}/logo.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('hospital_logos')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hospital_logos')
      .getPublicUrl(fileName);
      
    if (!urlData.publicUrl) return null;
    
    // Update hospital record with logo URL
    const { error: updateError } = await supabase
      .from('hospitals')
      .update({ logo_url: urlData.publicUrl })
      .eq('id', hospitalId);
      
    if (updateError) {
      console.error("Logo URL update error:", updateError);
      return null;
    }
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Logo upload error:", error);
    return null;
  }
};

// Subscribe to auth changes
export const subscribeToAuthChanges = (
  callback: (session: Session | null, user: User | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session, session?.user ?? null);
  });
};
