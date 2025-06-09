// pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { 
  Users, Layers, Activity, 
  TrendingUp, ArrowRight, Zap, Shield, ArrowUpRight, 
  BarChart2, Download, RefreshCw,
  Clock, Target,
  AlertTriangle, Eye, Database, BarChart3
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.scss';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [chartView, setChartView] = useState('area');
  const [refreshing, setRefreshing] = useState(false);
  
  // Colors for charts
  const COLORS = useMemo(() => [
    '#7b61ff', '#06d6a0', '#4cc9f0', '#f72585', '#8b5cf6', '#3b82f6'
  ], []);
  
  // Fetch data on time range change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/dashboard?timeRange=${timeRange}`);
        setMetrics(res.data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Refresh data handler
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`/api/dashboard?timeRange=${timeRange}&t=${Date.now()}`);
      setMetrics(res.data);
      
      setTimeout(() => {
        setRefreshing(false);
      }, 1200);
    } catch (error) {
      setError('Failed to refresh data');
      setRefreshing(false);
    }
  }, [timeRange]);

  // Enhanced trend data generation
  const generateTrendData = useCallback(() => {
    if (!metrics) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const normalizedIndex = (index + 12 - currentMonth) % 12;
      const growthFactor = 0.5 + (normalizedIndex / 12) * 0.5;
      
      return {
        name: month,
        profiles: Math.floor(metrics.totalProfiles * growthFactor),
        segments: Math.floor(metrics.totalSegments * (growthFactor * 0.9)),
        engagement: Math.floor(80 * (growthFactor * 0.85 + Math.sin(normalizedIndex / 2) * 0.1)),
      };
    });
  }, [metrics]);

  // Quick actions navigation
  const handleQuickAction = useCallback((action) => {
    switch(action) {
      case 'create-segment':
        navigate('/segments/create');
        break;
      case 'upload-profiles':
        navigate('/upload');
        break;
      case 'view-segments':
        navigate('/segments/list');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  }, [navigate]);

  const trendData = useMemo(() => generateTrendData(), [generateTrendData]);

  // Loading state
  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingAnimation}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerCore}></div>
        </div>
        <p className={styles.loadingText}>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
          Loading dashboard data
        </p>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          <AlertTriangle size={32} />
        </div>
        <div className={styles.errorMessage}>
          <h3 className={styles.errorTitle}>Unable to load dashboard</h3>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
      <button className={styles.retryButton} onClick={handleRefresh}>
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );

  if (!metrics) return null;

  return (
    <div className={styles.dashboardContainer}>
      {/* Enhanced Dashboard Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.dashboardTitle}>
            <BarChart3 size={28} className={styles.titleIcon} />
            Real-time Dashboard
          </h1>
          <p className={styles.dashboardSubtitle}>
            Monitor your key metrics and segment performance in real-time
          </p>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.timeRangeWrapper}>
            <div className={styles.timeRangeSelector}>
              <Clock size={16} className={styles.controlIcon} />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.timeRangeSelect}
              >
                <option value="all">All time</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
                <option value="year">Last 12 months</option>
              </select>
            </div>
          </div>
          
          <button 
            className={`${styles.actionButton} ${refreshing ? styles.refreshing : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={styles.controlIcon} />
            <span>Refresh</span>
          </button>
          
          <button className={styles.actionButton} onClick={() => handleQuickAction('analytics')}>
            <TrendingUp size={16} className={styles.controlIcon} />
            <span>Analytics</span>
          </button>
        </div>
      </div>
      
      {/* Enhanced KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.primaryCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Users size={24} />
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>+12.5%</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Total Profiles</h3>
            <div className={styles.cardValue}>
              {metrics.totalProfiles.toLocaleString()}
            </div>
            <p className={styles.cardSubtitle}>Active customer profiles</p>
          </div>
          <div className={styles.cardSparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.slice(-6)}>
                <defs>
                  <linearGradient id="profilesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7b61ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7b61ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="profiles" 
                  stroke="#7b61ff" 
                  strokeWidth={2}
                  fill="url(#profilesGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.accentCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Layers size={24} />
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>+8.3%</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Active Segments</h3>
            <div className={styles.cardValue}>
              {metrics.totalSegments.toLocaleString()}
            </div>
            <p className={styles.cardSubtitle}>Customer segments</p>
          </div>
          <div className={styles.cardSparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.slice(-6)}>
                <Line 
                  type="monotone" 
                  dataKey="segments" 
                  stroke="#06d6a0" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.infoCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Target size={24} />
              <div className={styles.iconGlow}></div>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Avg. Segment Size</h3>
            <div className={styles.cardValue}>
              {metrics.totalSegments ? Math.round(metrics.totalProfiles / metrics.totalSegments).toLocaleString() : 0}
            </div>
            <p className={styles.cardSubtitle}>Profiles per segment</p>
          </div>
          <div className={styles.cardProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${Math.min(100, (metrics.totalProfiles / metrics.totalSegments) / 10)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.successCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Shield size={24} />
              <div className={styles.iconGlow}></div>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Data Quality</h3>
            <div className={styles.cardValue}>
              94<span className={styles.valueUnit}>%</span>
            </div>
            <p className={styles.cardSubtitle}>Excellent quality</p>
          </div>
          <div className={styles.cardGauge}>
            <div className={styles.gaugeContainer}>
              <svg viewBox="0 0 100 50" className={styles.gauge}>
                <path 
                  d="M10,40 A30,30 0 1,1 90,40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <path 
                  d="M10,40 A30,30 0 1,1 90,40"
                  fill="none"
                  stroke="#06d6a0"
                  strokeWidth="6"
                  strokeDasharray={`${94 * 1.26}, 126`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className={styles.quickActionsPanel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <Zap size={20} />
            Quick Actions
          </h2>
        </div>
        <div className={styles.actionGrid}>
          <button 
            className={styles.quickActionCard}
            onClick={() => handleQuickAction('create-segment')}
          >
            <div className={styles.actionIcon}>
              <Layers size={20} />
            </div>
            <div className={styles.actionContent}>
              <h3>Create Segment</h3>
              <p>Build a new customer segment</p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </button>

          <button 
            className={styles.quickActionCard}
            onClick={() => handleQuickAction('upload-profiles')}
          >
            <div className={styles.actionIcon}>
              <Database size={20} />
            </div>
            <div className={styles.actionContent}>
              <h3>Upload Profiles</h3>
              <p>Import customer data</p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </button>

          <button 
            className={styles.quickActionCard}
            onClick={() => handleQuickAction('view-segments')}
          >
            <div className={styles.actionIcon}>
              <Eye size={20} />
            </div>
            <div className={styles.actionContent}>
              <h3>View Segments</h3>
              <p>Browse all segments</p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </button>

          <button 
            className={styles.quickActionCard}
            onClick={() => handleQuickAction('analytics')}
          >
            <div className={styles.actionIcon}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.actionContent}>
              <h3>Analytics</h3>
              <p>Deep dive insights</p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </button>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className={styles.chartsSection}>
        <div className={styles.primaryChart}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Performance Overview</h2>
              <p className={styles.chartSubtitle}>Profiles and segments growth over time</p>
            </div>
            <div className={styles.chartControls}>
              <div className={styles.chartTypeToggle}>
                <button 
                  className={`${styles.toggleButton} ${chartView === 'area' ? styles.active : ''}`}
                  onClick={() => setChartView('area')}
                >
                  <Activity size={16} />
                </button>
                <button 
                  className={`${styles.toggleButton} ${chartView === 'bar' ? styles.active : ''}`}
                  onClick={() => setChartView('bar')}
                >
                  <BarChart2 size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.chartContainer}>
            {chartView === 'area' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7b61ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7b61ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="segmentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06d6a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(26, 32, 53, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profiles" 
                    stroke="#7b61ff" 
                    strokeWidth={2} 
                    fill="url(#profileFill)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="segments" 
                    stroke="#06d6a0" 
                    strokeWidth={2} 
                    fill="url(#segmentFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                  />
                  <Tooltip />
                  <Bar dataKey="profiles" fill="#7b61ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="segments" fill="#06d6a0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Segment Distribution */}
        <div className={styles.secondaryChart}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Top Segments</h3>
          </div>
          <div className={styles.segmentList}>
            {metrics.segmentStats.slice(0, 5).map((segment, index) => (
              <div key={index} className={styles.segmentItem}>
                <div 
                  className={styles.segmentColor}
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div className={styles.segmentInfo}>
                  <div className={styles.segmentName}>{segment.name}</div>
                  <div className={styles.segmentCount}>{segment.count.toLocaleString()} profiles</div>
                </div>
                <div className={styles.segmentPercentage}>
                  {((segment.count / metrics.totalProfiles) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}