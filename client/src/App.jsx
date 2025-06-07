import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard';
import UploadPage from './pages/upload/upload';
import SegmentBuilder from './pages/segments/segmentBuilder';
import { BarChart2, Upload, Layers } from 'lucide-react';
import styles from './App.module.scss';

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        {/* Single header that doesn't repeat */}
        <header className={styles.header}>
          <div className={styles.branding}>
            <h1 className={styles.logo}>SegmentIQ</h1>
            <p className={styles.tagline}>Customer Data Platform</p>
          </div>
          
          <nav className={styles.mainNav}>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              <BarChart2 size={18} />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/upload" 
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              <Upload size={18} />
              <span>Upload Profiles</span>
            </NavLink>
            
            <NavLink 
              to="/segments" 
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              <Layers size={18} />
              <span>Segment Builder</span>
            </NavLink>
          </nav>
        </header>

        {/* Main content area */}
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/segments" element={<SegmentBuilder />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;