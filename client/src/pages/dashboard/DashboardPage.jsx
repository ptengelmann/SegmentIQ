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
  Clock, Target, AlertTriangle, Eye, Database, BarChart3
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
    '#8b5cf6', '#06d6a0', '#4cc9f0', '#f72585', '#7b61ff', '#3b82f6'
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

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className={styles.tooltipItem}>
              <div 
                className={styles.tooltipMarker} 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className={styles.tooltipName}>{entry.name}:</span>
              <span className={styles.tooltipValue}>
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // KPI Card component (inline since we're not creating separate files)
  const KpiCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    trend, 
    chartData, 
    chartType = 'area', 
    color = '#8b5cf6',
    secondaryColor = 'rgba(139, 92, 246, 0.3)',
    className = '' 
  }) => {
    // Calculate style properties
    const iconBgColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15)`;
    
    // Chart config
    const renderChart = () => {
      if (chartType === 'area') {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.slice(-6)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="profiles" 
                stroke={color} 
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      } else if (chartType === 'line') {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.slice(-6)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Line 
                type="monotone" 
                dataKey="segments" 
                stroke={color} 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      } else if (chartType === 'gauge') {
        return (
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
                  stroke={color}
                  strokeWidth="6"
                  strokeDasharray={`${value * 1.26}, 126`}
                />
              </svg>
            </div>
          </div>
        );
      } else if (chartType === 'progress') {
        return (
          <div className={styles.cardProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${Math.min(100, value / 10)}%`,
                  background: `linear-gradient(90deg, ${color}, ${secondaryColor})`
                }}
              ></div>
            </div>
          </div>
        );
      }
    };
    
    return (
      <div className={`${styles.kpiCard} ${className}`} style={{ "--card-color": color }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon} style={{ background: iconBgColor }}>
            <Icon size={22} color={color} />
            <div className={styles.iconGlow} style={{ background: iconBgColor }}></div>
          </div>
          {trend && (
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <div className={styles.cardValue}>
            {value.toLocaleString()}
          </div>
          <p className={styles.cardSubtitle}>{subtitle}</p>
        </div>
        <div className={styles.cardSparkline}>
          {renderChart()}
        </div>
      </div>
    );
  };

  // Quick Action component
  const QuickAction = ({ icon: Icon, title, description, onClick }) => {
    return (
      <button className={styles.quickActionCard} onClick={onClick}>
        <div className={styles.actionIcon}>
          <Icon size={20} />
        </div>
        <div className={styles.actionContent}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <ArrowRight size={16} className={styles.actionArrow} />
      </button>
    );
  };

  // Loading state
  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.auroraBackground}></div>
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
      <div className={styles.auroraBackground}></div>
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
      {/* Aurora Background */}
      <div className={styles.auroraBackground}>
        <div className={styles.aurora1}></div>
        <div className={styles.aurora2}></div>
        <div className={styles.aurora3}></div>
      </div>
      
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
        <KpiCard 
          icon={Users}
          title="Total Profiles"
          value={metrics.totalProfiles}
          subtitle="Active customer profiles"
          trend="+12.5%"
          chartData={trendData}
          chartType="area"
          color="#8b5cf6"
          className={styles.primaryCard}
        />

        <KpiCard 
          icon={Layers}
          title="Active Segments"
          value={metrics.totalSegments}
          subtitle="Customer segments"
          trend="+8.3%"
          chartData={trendData}
          chartType="line"
          color="#06d6a0"
          className={styles.accentCard}
        />

        <KpiCard 
          icon={Target}
          title="Avg. Segment Size"
          value={metrics.totalSegments ? Math.round(metrics.totalProfiles / metrics.totalSegments) : 0}
          subtitle="Profiles per segment"
          chartType="progress"
          color="#4cc9f0"
          className={styles.infoCard}
        />

        <KpiCard 
          icon={Shield}
          title="Data Quality"
          value={94}
          subtitle="Excellent quality"
          chartType="gauge"
          color="#06d6a0"
          className={styles.successCard}
        />
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
          <QuickAction 
            icon={Layers} 
            title="Create Segment" 
            description="Build a new customer segment" 
            onClick={() => handleQuickAction('create-segment')}
          />

          <QuickAction 
            icon={Database} 
            title="Upload Profiles" 
            description="Import customer data" 
            onClick={() => handleQuickAction('upload-profiles')}
          />

          <QuickAction 
            icon={Eye} 
            title="View Segments" 
            description="Browse all segments" 
            onClick={() => handleQuickAction('view-segments')}
          />

          <QuickAction 
            icon={TrendingUp} 
            title="Analytics" 
            description="Deep dive insights" 
            onClick={() => handleQuickAction('analytics')}
          />
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
                <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <defs>
                    <linearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
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
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="profiles" 
                    name="Profiles"
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    fill="url(#profileFill)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="segments" 
                    name="Segments"
                    stroke="#06d6a0" 
                    strokeWidth={2} 
                    fill="url(#segmentFill)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#06d6a0' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
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
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    name="Profiles" 
                    dataKey="profiles" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar 
                    name="Segments" 
                    dataKey="segments" 
                    fill="#06d6a0" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
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