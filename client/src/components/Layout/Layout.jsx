import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Layout.scss';
import { 
  PieChart, 
  Upload, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Target, 
  TrendingUp,
  User,
  Bell,
  Search,
  ChevronDown,
  Zap,
  Shield,
  Database
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <BarChart3 size={20} />,
      description: 'Analytics & Insights'
    },
    {
      path: '/upload',
      label: 'Data Upload',
      icon: <Upload size={20} />,
      description: 'Import Customer Data'
    },
    {
      path: '/segments',
      label: 'Segments',
      icon: <Target size={20} />,
      description: 'Manage Segments'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <TrendingUp size={20} />,
      description: 'Advanced Reports'
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      description: 'Platform Configuration'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <div className="logo-text">
              <h1>SegmentIQ</h1>
              <span>AI-Powered Analytics</span>
            </div>
          </div>
          
          <button 
            className="sidebar-toggle mobile-only"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Main</span>
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div className="nav-item-icon">
                      {item.icon}
                    </div>
                    <div className="nav-item-content">
                      <span className="nav-item-label">{item.label}</span>
                      <span className="nav-item-description">{item.description}</span>
                    </div>
                    {isActiveRoute(item.path) && <div className="nav-item-indicator"></div>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="status-card">
            <div className="status-header">
              <Shield size={16} />
              <span>System Status</span>
            </div>
            <div className="status-indicators">
              <div className="status-item">
                <div className="status-dot online"></div>
                <span>ML Engine</span>
              </div>
              <div className="status-item">
                <div className="status-dot online"></div>
                <span>Database</span>
              </div>
              <div className="status-item">
                <div className="status-dot online"></div>
                <span>API Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-container">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            
            <div className="breadcrumb">
              <PieChart size={16} />
              <span>SegmentIQ Platform</span>
            </div>
          </div>

          <div className="header-center">
            <div className="search-container">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search segments, customers, insights..."
                className="global-search"
              />
            </div>
          </div>

          <div className="header-right">
            <div className="header-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <div className="user-info">
                  <span className="user-name">Pedro T.</span>
                  <span className="user-role">Admin</span>
                </div>
                <ChevronDown size={16} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar large">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="user-name">Pedro Tengelmann</div>
                      <div className="user-email">pedro@segmentiq.com</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <User size={16} />
                      Profile Settings
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <Settings size={16} />
                      Preferences
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="app-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>© 2025 SegmentIQ Platform</span>
              <span>•</span>
              <span>Powered by Advanced ML</span>
            </div>
            <div className="footer-right">
              <div className="performance-indicator">
                <Database size={14} />
                <span>Response: 45ms</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;