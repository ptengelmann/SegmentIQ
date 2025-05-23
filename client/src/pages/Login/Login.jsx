import React, { useState } from 'react';
import axios from 'axios';
import './Login.scss';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 🆕 Add loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(''); // 🆕 Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 🆕 Set loading
    setError(''); // 🆕 Clear previous errors
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      
      // 🆕 Validate token before storing
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // 🆕 Better error handling
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false); // 🆕 Clear loading
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Login to SegmentIQ</h2>
        {error && <p className="error">{error}</p>}
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
          disabled={isLoading} // 🆕 Disable when loading
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
          disabled={isLoading} // 🆕 Disable when loading
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Login'} {/* 🆕 Loading text */}
        </button>
      </form>
    </div>
  );
};

export default Login;