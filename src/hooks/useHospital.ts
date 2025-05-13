
import { useState, useEffect } from 'react';
import { getHospitalInfo, Hospital } from '@/utils/auth';
import { DEFAULT_HOSPITAL_NAME } from '@/lib/constants';

export const useHospital = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const hospitalInfo = await getHospitalInfo();
        setHospital(hospitalInfo);
      } catch (error) {
        console.error("Error loading hospital info:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospital();
  }, []);
  
  return {
    hospital,
    hospitalName: hospital?.name || DEFAULT_HOSPITAL_NAME,
    loading,
  };
};
