import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;

      if (exp && now > exp) {
        console.warn('🔐 Token expired');
        localStorage.clear();
        navigate('/login');
      }
    } catch (err) {
      console.error('Invalid token format');
      localStorage.clear();
      navigate('/login');
    }
  }, []);
};
