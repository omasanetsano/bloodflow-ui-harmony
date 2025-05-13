
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // If no session, redirect to login
      if (!data.session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return <Dashboard />;
};

export default Index;
