import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import './Layout.scss';

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="logo">
          <Link to="/dashboard">SegmentIQ</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/upload">Upload</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>

      <main className="app-content">
        <Outlet /> {/* ✅ Renders the current child route */}
      </main>
    </div>
  );
};

export default Layout;
