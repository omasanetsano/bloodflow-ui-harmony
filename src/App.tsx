
import { Helmet } from 'react-helmet';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Donors from "@/pages/Donors";
import BloodCollection from "@/pages/BloodCollection";
import BloodRequests from "@/pages/BloodRequests";
import Inventory from "@/pages/Inventory";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Helmet
      titleTemplate="%s | Blood Bank Management System"
      defaultTitle="Blood Bank Management System"
    >
      <meta name="description" content="Blood Bank Management System" />
    </Helmet>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <Layout>
                <Index />
              </Layout>
            } 
          />
          <Route 
            path="/donors" 
            element={
              <Layout>
                <Donors />
              </Layout>
            } 
          />
          <Route 
            path="/collection" 
            element={
              <Layout>
                <BloodCollection />
              </Layout>
            } 
          />
          <Route 
            path="/requests" 
            element={
              <Layout>
                <BloodRequests />
              </Layout>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <Layout>
                <Inventory />
              </Layout>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Layout>
                <Settings />
              </Layout>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
