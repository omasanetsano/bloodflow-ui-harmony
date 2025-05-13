
import { Helmet } from 'react-helmet';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Donors from "@/pages/Donors";
import BloodCollection from "@/pages/BloodCollection";
import BloodRequests from "@/pages/BloodRequests";
import Inventory from "@/pages/Inventory";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { APP_NAME } from "@/lib/constants";
import { getHospitalInfo, Hospital } from "@/utils/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ 
  children, 
  user, 
  loading 
}: { 
  children: React.ReactNode; 
  user: User | null;
  loading: boolean;
}) => {
  if (loading) {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="mb-4">
            <div className="rounded-full bg-muted h-16 w-16 mx-auto"></div>
          </div>
          <div className="h-4 bg-muted rounded w-48 mb-2.5"></div>
          <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  
  // Subscribe to auth changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch hospital info if user is logged in
        if (session?.user) {
          setTimeout(async () => {
            const hospitalInfo = await getHospitalInfo();
            setHospital(hospitalInfo);
          }, 0);
        } else {
          setHospital(null);
        }
      }
    );
    
    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const hospitalInfo = await getHospitalInfo();
        setHospital(hospitalInfo);
      }
      
      setLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const hospitalName = hospital?.name || "Hospital";
  
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Helmet
              titleTemplate={`%s | ${hospitalName} - ${APP_NAME}`}
              defaultTitle={`${APP_NAME} | Blood Bank Management System`}
            >
              <meta name="description" content={`${APP_NAME} - Advanced Blood Bank Management System`} />
              <meta name="theme-color" content="#E52222" />
            </Helmet>
            <Toaster />
            <Sonner richColors position="top-right" />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute user={user} loading={loading}>
                    <Layout hospital={hospital}>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donors" 
                element={
                  <ProtectedRoute user={user} loading={loading}>
                    <Layout hospital={hospital}>
                      <Donors />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/collection" 
                element={
                  <ProtectedRoute user={user} loading={loading}>
                    <Layout hospital={hospital}>
                      <BloodCollection />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <ProtectedRoute user={user} loading={loading}>
                    <Layout hospital={hospital}>
                      <BloodRequests />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute user={user} loading={loading}>
                    <Layout hospital={hospital}>
                      <Inventory />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute user={user} loading={loading}>
                    <Layout hospital={hospital}>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
