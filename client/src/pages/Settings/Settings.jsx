import React, { useEffect, useState } from 'react';
import { fetchSegmentHistory } from '../../services/segmentService';
import './Settings.scss';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Key,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  Info,
  Zap,
  Clock,
  BarChart3,
  Target,
  Eye,
  RefreshCw,
  ChevronRight,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Server
} from 'lucide-react';

const Settings = () => {
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [userSettings, setUserSettings] = useState({
    name: 'Pedro Tengelmann',
    email: 'pedro@segmentiq.com',
    role: 'Administrator',
    company: 'SegmentIQ Analytics',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    timezone: 'PST (UTC-8)',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      autoSave: true,
      analytics: true
    }
  });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const result = await fetchSegmentHistory();
        setHistory(result);
      } catch (err) {
        console.error('History fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const loadEntry = (entry) => {
    localStorage.setItem('segments', JSON.stringify({
      segments: entry.segments,
      summary: entry.summary,
      segment_details: entry.segmentDetails,
      features_used: entry.featuresUsed
    }));
    window.location.href = '/dashboard';
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API save
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  const updateSetting = (section, key, value) => {
    setUserSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const settingsTabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={18} />,
      description: 'Personal information'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      description: 'Alert preferences'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield size={18} />,
      description: 'Privacy & access'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Database size={18} />,
      description: 'Connected services'
    },
    {
      id: 'history',
      label: 'History',
      icon: <Clock size={18} />,
      description: 'Segment history'
    },
    {
      id: 'system',
      label: 'System',
      icon: <SettingsIcon size={18} />,
      description: 'Platform status'
    }
  ];

  const renderProfileTab = () => (
    <div className="settings-content">
      <div className="content-header">
        <h3>Profile Information</h3>
        <p>Manage your personal details and account preferences</p>
      </div>

      <div className="profile-section">
        <div className="profile-avatar">
          <div className="avatar-container">
            <div className="avatar">
              <User size={32} />
            </div>
            <button className="avatar-edit">
              <Edit3 size={14} />
            </button>
          </div>
          <div className="avatar-info">
            <h4>{userSettings.name}</h4>
            <span>{userSettings.role}</span>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-group">
              <User size={16} />
              <input 
                type="text" 
                value={userSettings.name}
                onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-group">
              <Mail size={16} />
              <input 
                type="email" 
                value={userSettings.email}
                onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company</label>
            <div className="input-group">
              <Target size={16} />
              <input 
                type="text" 
                value={userSettings.company}
                onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-group">
              <Phone size={16} />
              <input 
                type="tel" 
                value={userSettings.phone}
                onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <div className="input-group">
              <MapPin size={16} />
              <input 
                type="text" 
                value={userSettings.location}
                onChange={(e) => setUserSettings(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <div className="input-group">
              <Globe size={16} />
              <select value={userSettings.timezone}>
                <option value="PST">PST (UTC-8)</option>
                <option value="EST">EST (UTC-5)</option>
                <option value="GMT">GMT (UTC+0)</option>
                <option value="CET">CET (UTC+1)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-content">
      <div className="content-header">
        <h3>Notification Preferences</h3>
        <p>Choose how you want to be notified about important updates</p>
      </div>

      <div className="notification-groups">
        <div className="notification-group">
          <div className="group-header">
            <Bell size={20} />
            <div>
              <h4>Communication</h4>
              <p>How you receive notifications from SegmentIQ</p>
            </div>
          </div>
          
          <div className="notification-items">
            <div className="notification-item">
              <div className="item-info">
                <span className="item-title">Email Notifications</span>
                <span className="item-desc">Receive updates via email</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={userSettings.notifications.email}
                  onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="item-info">
                <span className="item-title">Push Notifications</span>
                <span className="item-desc">Browser and mobile alerts</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={userSettings.notifications.push}
                  onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="item-info">
                <span className="item-title">SMS Notifications</span>
                <span className="item-desc">Critical alerts via text message</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={userSettings.notifications.sms}
                  onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="notification-group">
          <div className="group-header">
            <Target size={20} />
            <div>
              <h4>Marketing & Updates</h4>
              <p>Product updates and marketing communications</p>
            </div>
          </div>
          
          <div className="notification-items">
            <div className="notification-item">
              <div className="item-info">
                <span className="item-title">Product Updates</span>
                <span className="item-desc">New features and improvements</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={userSettings.notifications.marketing}
                  onChange={(e) => updateSetting('notifications', 'marketing', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-content">
      <div className="content-header">
        <h3>Security & Privacy</h3>
        <p>Manage your account security and privacy settings</p>
      </div>

      <div className="security-sections">
        <div className="security-section">
          <div className="section-header">
            <Lock size={20} />
            <div>
              <h4>Password & Authentication</h4>
              <p>Keep your account secure</p>
            </div>
          </div>
          
          <div className="security-items">
            <div className="security-item">
              <div className="item-content">
                <div className="item-info">
                  <span className="item-title">Change Password</span>
                  <span className="item-desc">Last changed 3 months ago</span>
                </div>
                <button className="btn-secondary">
                  <Key size={14} />
                  Update
                </button>
              </div>
            </div>

            <div className="security-item">
              <div className="item-content">
                <div className="item-info">
                  <span className="item-title">Two-Factor Authentication</span>
                  <span className="item-desc status-enabled">
                    <Check size={14} />
                    Enabled
                  </span>
                </div>
                <button className="btn-secondary">
                  <Shield size={14} />
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="security-section">
          <div className="section-header">
            <Activity size={20} />
            <div>
              <h4>Login Activity</h4>
              <p>Recent account access</p>
            </div>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <Check size={16} />
              </div>
              <div className="activity-details">
                <span className="activity-title">Successful login</span>
                <span className="activity-meta">San Francisco, CA • 2 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">
                <Check size={16} />
              </div>
              <div className="activity-details">
                <span className="activity-title">Successful login</span>
                <span className="activity-meta">San Francisco, CA • Yesterday at 9:15 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="settings-content">
      <div className="content-header">
        <h3>System Status</h3>
        <p>Monitor platform health and performance metrics</p>
      </div>

      <div className="system-overview">
        <div className="status-grid">
          <div className="status-card healthy">
            <div className="status-header">
              <Cpu size={20} />
              <span>ML Engine</span>
            </div>
            <div className="status-details">
              <div className="status-indicator online"></div>
              <span className="status-text">Operational</span>
            </div>
          </div>

          <div className="status-card healthy">
            <div className="status-header">
              <Database size={20} />
              <span>Database</span>
            </div>
            <div className="status-details">
              <div className="status-indicator online"></div>
              <span className="status-text">Operational</span>
            </div>
          </div>

          <div className="status-card healthy">
            <div className="status-header">
              <Server size={20} />
              <span>API Gateway</span>
            </div>
            <div className="status-details">
              <div className="status-indicator online"></div>
              <span className="status-text">Operational</span>
            </div>
          </div>

          <div className="status-card healthy">
            <div className="status-header">
              <Wifi size={20} />
              <span>Network</span>
            </div>
            <div className="status-details">
              <div className="status-indicator online"></div>
              <span className="status-text">45ms avg</span>
            </div>
          </div>
        </div>

        <div className="performance-metrics">
          <h4>Performance Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Response Time</span>
              <span className="metric-value">45ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Uptime</span>
              <span className="metric-value">99.9%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Active Users</span>
              <span className="metric-value">1,247</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Data Processed</span>
              <span className="metric-value">12.4GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="settings-content">
      <div className="content-header">
        <h3>Segmentation History</h3>
        <p>View and restore previous segmentation analyses</p>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <RefreshCw size={24} className="spinning" />
          <p>Loading history...</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date Created</th>
                <th>Summary</th>
                <th>Segments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <small>{new Date(entry.createdAt).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="summary-cell">
                      <span className="summary-text">{entry.summary}</span>
                    </div>
                  </td>
                  <td>
                    <div className="segments-cell">
                      <BarChart3 size={14} />
                      <span>{entry.segments?.length || 0} segments</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">
                      <Check size={12} />
                      Complete
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-primary small"
                        onClick={() => loadEntry(entry)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button className="btn-secondary small">
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 && (
            <div className="empty-history">
              <Clock size={48} />
              <h4>No History Found</h4>
              <p>Your segmentation history will appear here once you start analyzing data.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <SettingsIcon size={28} />
            <div>
              <h1>Settings</h1>
              <p>Manage your account, preferences, and platform configuration</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className={`save-btn ${saveStatus}`}
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-container">
        {/* Settings Navigation */}
        <nav className="settings-nav">
          <ul className="nav-list">
            {settingsTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="nav-icon">{tab.icon}</div>
                  <div className="nav-content">
                    <span className="nav-label">{tab.label}</span>
                    <span className="nav-description">{tab.description}</span>
                  </div>
                  <ChevronRight size={16} className="nav-arrow" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings Content */}
        <main className="settings-main">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'system' && renderSystemTab()}
          {activeTab === 'integrations' && (
            <div className="settings-content">
              <div className="content-header">
                <h3>Integrations</h3>
                <p>Connect SegmentIQ with your favorite tools and services</p>
              </div>
              <div className="coming-soon">
                <Zap size={48} />
                <h4>Coming Soon</h4>
                <p>Integration management will be available in the next update.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;