
import { Helmet } from 'react-helmet';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { HOSPITAL_NAME } from "@/pages/Dashboard";
import { APP_NAME } from "@/lib/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
