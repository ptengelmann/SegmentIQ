import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Calendar, Users, Layers, Activity, Filter, Database } from 'lucide-react';
import axios from 'axios';
import styles from './dashboard.module.scss';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4BC0C0'];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/dashboard?timeRange=${timeRange}`);
        setMetrics(res.data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingAnimation}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>Failed to load dashboard: {error}</p>
        </div>
      </div>
    </div>
  );

  if (!metrics) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.headerTitle}>SegmentIQ Analytics Dashboard</h1>
          <p className={styles.headerSubtitle}>Real-time insights about your customer segments</p>
        </div>
        
        {/* Time range selector */}
        <div className={styles.timeRangeSelector}>
          <Calendar className={styles.calendarIcon} />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.timeRangeSelect}
          >
            <option value="all">All time</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
          </select>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className={styles.tabNavigation}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`${styles.tabButton} ${
            activeTab === 'overview' 
              ? styles.tabButtonActive
              : styles.tabButtonInactive
          }`}
        >
          <Activity className={styles.tabIcon} />
          Overview
        </button>
        
        <button
          onClick={() => setActiveTab('segments')}
          className={`${styles.tabButton} ${
            activeTab === 'segments' 
              ? styles.tabButtonActive
              : styles.tabButtonInactive
          }`}
        >
          <Layers className={styles.tabIcon} />
          Segments
        </button>
        
        <button
          onClick={() => setActiveTab('profiles')}
          className={`${styles.tabButton} ${
            activeTab === 'profiles' 
              ? styles.tabButtonActive
              : styles.tabButtonInactive
          }`}
        >
          <Users className={styles.tabIcon} />
          Profiles
        </button>
      </div>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Total Profiles</h2>
            <div className={`${styles.iconContainer} ${styles.blueIconBg}`}>
              <Users className={`${styles.icon} ${styles.blueIcon}`} />
            </div>
          </div>
          <div className={styles.statValue}>
            {metrics.totalProfiles.toLocaleString()}
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Active Segments</h2>
            <div className={`${styles.iconContainer} ${styles.greenIconBg}`}>
              <Layers className={`${styles.icon} ${styles.greenIcon}`} />
            </div>
          </div>
          <div className={styles.statValue}>
            {metrics.totalSegments.toLocaleString()}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Avg. Profiles per Segment</h2>
            <div className={`${styles.iconContainer} ${styles.purpleIconBg}`}>
              <Filter className={`${styles.icon} ${styles.purpleIcon}`} />
            </div>
          </div>
          <div className={styles.statValue}>
            {metrics.totalSegments ? Math.round(metrics.totalProfiles / metrics.totalSegments).toLocaleString() : 0}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Data Points</h2>
            <div className={`${styles.iconContainer} ${styles.amberIconBg}`}>
              <Database className={`${styles.icon} ${styles.amberIcon}`} />
            </div>
          </div>
          <div className={styles.statValue}>
            {(metrics.segmentStats.length).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main content based on active tab */}
      {activeTab === 'overview' && (
        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Segment Distribution</h2>
            <button className={styles.viewAllButton}>
              View All Segments
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.segmentStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Profiles" 
                  fill="#0070f3" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Segment Analysis</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Segment Name</th>
                  <th className={styles.tableHeaderCell}>Profiles</th>
                  <th className={styles.tableHeaderCell}>% of Total</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {metrics.segmentStats.map((segment, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellMedium}`}>{segment.name}</td>
                    <td className={styles.tableCell}>{segment.count.toLocaleString()}</td>
                    <td className={styles.tableCell}>
                      {((segment.count / metrics.totalProfiles) * 100).toFixed(1)}%
                    </td>
                    <td className={styles.tableCell}>
                      <button className={styles.actionButton}>View</button>
                      <button className={styles.secondaryActionButton}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Profile Distribution</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.segmentStats}
                  nameKey="name"
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {metrics.segmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}