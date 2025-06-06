import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Upload from './pages/Upload/Upload';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import Settings from './pages/Settings/Settings';
import Layout from './components/Layout/Layout';

// 🆕 Create components for the new routes
const Segments = () => <Dashboard />;
const Analytics = () => <Dashboard />;

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/segments" element={<Segments />} /> {/* 🆕 ADD THIS */}
        <Route path="/analytics" element={<Analytics />} /> {/* 🆕 ADD THIS */}
        <Route path="/upload" element={<Upload />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} /> {/* 🆕 CHANGE THIS */}
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Route>
    </Routes>
  );
};

export default App;