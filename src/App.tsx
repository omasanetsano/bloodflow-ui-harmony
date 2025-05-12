
import { Helmet } from 'react-helmet';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
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
import { HOSPITAL_NAME } from "@/pages/Dashboard";
import { APP_NAME } from "@/lib/constants";
import { isAuthenticated } from "@/utils/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Helmet
            titleTemplate={`%s | ${HOSPITAL_NAME} - ${APP_NAME}`}
            defaultTitle={`${APP_NAME} | ${HOSPITAL_NAME} Blood Bank Management System`}
          >
            <meta name="description" content={`${APP_NAME} - Advanced Blood Bank Management System for ${HOSPITAL_NAME}`} />
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
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donors" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Donors />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/collection" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <BloodCollection />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/requests" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <BloodRequests />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout>
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

export default App;
