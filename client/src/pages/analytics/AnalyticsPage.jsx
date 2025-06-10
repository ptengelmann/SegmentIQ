// pages/analytics/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
  Scatter, ScatterChart, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  TrendingUp, Users, Layers, Filter, Download, RefreshCw,
  Calendar, Target, Database, Eye, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart as PieChartIcon, Activity, Zap, Clock,
  AlertTriangle, CheckCircle, Info, Settings, Search, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import styles from './AnalyticsPage.module.scss';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [activeMetric, setActiveMetric] = useState('profiles');
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = useMemo(() => [
    '#8b5cf6', '#06d6a0', '#4cc9f0', '#f72585', '#7b61ff', '#3b82f6', '#10b981', '#f59e0b'
  ], []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [dashboardRes, segmentsRes] = await Promise.all([
          axios.get(`/api/dashboard?timeRange=${timeRange}`),
          axios.get('/api/segments')
        ]);

        // Generate enhanced analytics data
        const enhancedData = {
          ...dashboardRes.data,
          segments: segmentsRes.data.segments || [],
          trends: generateTrendAnalytics(dashboardRes.data),
          segmentPerformance: generateSegmentPerformance(dashboardRes.data.segmentStats),
          cohortAnalysis: generateCohortData(),
          conversionFunnel: generateFunnelData(dashboardRes.data),
          geographicData: generateGeographicData(),
          timeSeriesData: generateTimeSeriesData(dashboardRes.data)
        };

        setAnalytics(enhancedData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Generate trend analytics
  const generateTrendAnalytics = useCallback((data) => {
    if (!data) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const normalizedIndex = (index + 12 - currentMonth) % 12;
      const growthFactor = 0.3 + (normalizedIndex / 12) * 0.7;
      const variance = 0.9 + Math.random() * 0.2; // Add some realistic variance
      
      return {
        month,
        profiles: Math.floor(data.totalProfiles * growthFactor * variance),
        segments: Math.floor(data.totalSegments * growthFactor * variance),
        engagement: Math.floor(75 + Math.random() * 20),
        conversion: Math.floor(15 + Math.random() * 10),
        retention: Math.floor(80 + Math.random() * 15),
        revenue: Math.floor(50000 * growthFactor * variance)
      };
    });
  }, []);

  // Generate segment performance data
  const generateSegmentPerformance = useCallback((segmentStats) => {
    if (!segmentStats) return [];
    
    return segmentStats.map((segment, index) => ({
      ...segment,
      engagement: 70 + Math.random() * 25,
      conversion: 10 + Math.random() * 15,
      retention: 75 + Math.random() * 20,
      growth: -5 + Math.random() * 20,
      revenue: segment.count * (100 + Math.random() * 200),
      quality: 80 + Math.random() * 15
    }));
  }, []);

  // Generate cohort analysis data
  const generateCohortData = useCallback(() => {
    const cohorts = [];
    for (let i = 0; i < 12; i++) {
      const cohort = {
        month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
        week0: 100,
        week1: 85 - Math.random() * 10,
        week2: 70 - Math.random() * 10,
        week3: 60 - Math.random() * 10,
        week4: 55 - Math.random() * 10,
        week8: 45 - Math.random() * 10,
        week12: 40 - Math.random() * 10
      };
      cohorts.push(cohort);
    }
    return cohorts;
  }, []);

  // Generate funnel data
  const generateFunnelData = useCallback((data) => {
    if (!data) return [];
    
    const total = data.totalProfiles || 10000;
    return [
      { name: 'Total Visitors', value: total, fill: '#8b5cf6' },
      { name: 'Engaged Users', value: Math.floor(total * 0.7), fill: '#06d6a0' },
      { name: 'Qualified Leads', value: Math.floor(total * 0.4), fill: '#4cc9f0' },
      { name: 'Active Customers', value: Math.floor(total * 0.2), fill: '#f72585' },
      { name: 'Premium Users', value: Math.floor(total * 0.05), fill: '#7b61ff' }
    ];
  }, []);

  // Generate geographic data
  const generateGeographicData = useCallback(() => {
    return [
      { region: 'North America', users: 4250, revenue: 125000, growth: 12.5 },
      { region: 'Europe', users: 3100, revenue: 89000, growth: 8.3 },
      { region: 'Asia Pacific', users: 2800, revenue: 76000, growth: 18.7 },
      { region: 'Latin America', users: 1500, revenue: 34000, growth: 15.2 },
      { region: 'Middle East', users: 890, revenue: 28000, growth: 22.1 },
      { region: 'Africa', users: 650, revenue: 18000, growth: 28.4 }
    ];
  }, []);

  // Generate time series data
  const generateTimeSeriesData = useCallback((data) => {
    if (!data) return [];
    
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString(),
        profiles: Math.floor(data.totalProfiles * (0.8 + Math.random() * 0.4)) / 30,
        segments: Math.floor(data.totalSegments * (0.8 + Math.random() * 0.4)) / 30,
        activity: Math.floor(50 + Math.random() * 100)
      });
    }
    return days;
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`/api/dashboard?timeRange=${timeRange}&t=${Date.now()}`);
      setAnalytics(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [timeRange]);

  // Export handler
  const handleExport = useCallback(() => {
    if (!analytics) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      timeRange,
      metrics: {
        totalProfiles: analytics.totalProfiles,
        totalSegments: analytics.totalSegments,
        trends: analytics.trends,
        segmentPerformance: analytics.segmentPerformance
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segmentiq-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analytics, timeRange]);
  
  // Custom tooltip component
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
              <span className={styles.tooltipName}>{entry.name || entry.dataKey}:</span>
              <span className={styles.tooltipValue}>
                {typeof entry.value === 'number' && entry.dataKey === 'revenue' 
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading state with animated aurora background
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.auroraBackground}>
          <div className={styles.aurora1}></div>
          <div className={styles.aurora2}></div>
          <div className={styles.aurora3}></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={styles.loadingContent}
        >
          <div className={styles.loadingSpinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerCore}></div>
          </div>
          <p className={styles.loadingText}>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
            Loading advanced analytics
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.auroraBackground}>
          <div className={styles.aurora1}></div>
          <div className={styles.aurora2}></div>
          <div className={styles.aurora3}></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.errorContent}
        >
          <div className={styles.errorIcon}>
            <AlertTriangle size={48} />
            <div className={styles.iconPulse}></div>
          </div>
          <h2 className={styles.errorTitle}>Analytics Unavailable</h2>
          <p className={styles.errorText}>{error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            <RefreshCw size={16} />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className={styles.analyticsContainer}>
      {/* Aurora Background */}
      <div className={styles.auroraBackground}>
        <div className={styles.aurora1}></div>
        <div className={styles.aurora2}></div>
        <div className={styles.aurora3}></div>
      </div>
      
      {/* Header */}
      <motion.div 
        className={styles.analyticsHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <TrendingUp size={32} className={styles.titleIcon} />
            Advanced Analytics
          </h1>
          <p className={styles.pageSubtitle}>
            Deep insights into segment performance, customer behavior, and growth trends
          </p>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.timeRangeWrapper}>
            <div className={styles.timeRangeSelector}>
              <Clock size={16} className={styles.controlIcon} />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.timeSelect}
              >
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
            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
            <span>Refresh</span>
          </button>
          
          <button className={styles.actionButton} onClick={handleExport}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Overview */}
      <motion.div 
        className={styles.kpiGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={`${styles.kpiCard} ${styles.primaryCard}`} variants={itemVariants}>
          <div className={styles.cardIcon}>
            <Users size={24} />
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Total Reach</h3>
            <div className={styles.cardValue}>{analytics.totalProfiles.toLocaleString()}</div>
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>+12.5%</span>
            </div>
          </div>
          <div className={styles.cardSparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trends?.slice(-6)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="profiles" 
                  stroke="#8b5cf6" 
                  fill="url(#reachGradient)" 
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className={`${styles.kpiCard} ${styles.accentCard}`} variants={itemVariants}>
          <div className={styles.cardIcon}>
            <Target size={24} />
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Avg. Conversion</h3>
            <div className={styles.cardValue}>
              {analytics.segmentPerformance?.length > 0 ? 
                (analytics.segmentPerformance.reduce((acc, seg) => acc + seg.conversion, 0) / analytics.segmentPerformance.length).toFixed(1) : 0}%
            </div>
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>+3.2%</span>
            </div>
          </div>
          <div className={styles.cardSparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trends?.slice(-6)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Line 
                  type="monotone" 
                  dataKey="conversion" 
                  stroke="#06d6a0" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className={`${styles.kpiCard} ${styles.infoCard}`} variants={itemVariants}>
          <div className={styles.cardIcon}>
            <Activity size={24} />
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Engagement Rate</h3>
            <div className={styles.cardValue}>
              {analytics.segmentPerformance?.length > 0 ? 
                (analytics.segmentPerformance.reduce((acc, seg) => acc + seg.engagement, 0) / analytics.segmentPerformance.length).toFixed(1) : 0}%
            </div>
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>+8.7%</span>
            </div>
          </div>
          <div className={styles.cardProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${analytics.segmentPerformance?.length > 0 ? 
                    (analytics.segmentPerformance.reduce((acc, seg) => acc + seg.engagement, 0) / analytics.segmentPerformance.length) : 0}%`
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div className={`${styles.kpiCard} ${styles.successCard}`} variants={itemVariants}>
          <div className={styles.cardIcon}>
            <Database size={24} />
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Data Quality</h3>
            <div className={styles.cardValue}>94<span className={styles.valueUnit}>%</span></div>
            <div className={styles.cardTrend}>
              <ArrowUpRight size={14} />
              <span>+2.1%</span>
            </div>
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
        </motion.div>
      </motion.div>

      {/* Main Analytics Grid */}
      <motion.div 
        className={styles.analyticsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Trend Analysis */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Growth Trends</h3>
            <div className={styles.chartControls}>
              <select 
                value={activeMetric}
                onChange={(e) => setActiveMetric(e.target.value)}
                className={styles.metricSelect}
              >
                <option value="profiles">Profiles</option>
                <option value="segments">Segments</option>
                <option value="engagement">Engagement</option>
                <option value="conversion">Conversion</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.65)' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.65)' }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric}
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Segment Performance */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Segment Performance</h3>
            <div className={styles.cardControls}>
              <Eye size={16} />
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.segmentPerformance?.slice(0, 6)} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06d6a0" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06d6a0" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4cc9f0" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4cc9f0" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.65)' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="engagement" 
                  name="Engagement"
                  fill="url(#engagementGradient)" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="conversion" 
                  name="Conversion"
                  fill="url(#conversionGradient)" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Conversion Funnel</h3>
            <div className={styles.cardControls}>
              <Filter size={16} />
            </div>
          </div>
          <div className={styles.funnelContainer}>
            {analytics.conversionFunnel?.map((stage, index) => (
              <motion.div 
                key={index} 
                className={styles.funnelStage}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div 
                  className={styles.funnelBar}
                  style={{ 
                    width: `${(stage.value / analytics.conversionFunnel[0].value) * 100}%`,
                    backgroundColor: stage.fill
                  }}
                >
                  <span className={styles.funnelLabel}>{stage.name}</span>
                  <span className={styles.funnelValue}>{stage.value.toLocaleString()}</span>
                </div>
                <div className={styles.funnelPercentage}>
                  {index > 0 ? 
                    `${((stage.value / analytics.conversionFunnel[index-1].value) * 100).toFixed(1)}%` : 
                    '100%'
                  }
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Geographic Distribution</h3>
            <div className={styles.cardControls}>
              <Database size={16} />
            </div>
          </div>
          <div className={styles.geoContainer}>
            {analytics.geographicData?.map((region, index) => (
              <motion.div 
                key={index} 
                className={styles.geoItem}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <div className={styles.geoInfo}>
                  <span className={styles.geoName}>{region.region}</span>
                  <span className={styles.geoUsers}>{region.users.toLocaleString()} users</span>
                </div>
                <div className={styles.geoMetrics}>
                  <span className={styles.geoRevenue}>${(region.revenue / 1000).toFixed(0)}K</span>
                  <span className={`${styles.geoGrowth} ${region.growth > 0 ? styles.positive : styles.negative}`}>
                    {region.growth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(region.growth).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Time Series Activity */}
        <motion.div className={`${styles.chartCard} ${styles.fullWidth}`} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Daily Activity Trends</h3>
            <div className={styles.cardControls}>
              <Activity size={16} />
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeSeriesData?.slice(-30)} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="profilesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#06d6a0" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.65)' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="activity" 
                  name="Activity"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profiles" 
                  name="Profiles"
                  stroke="#06d6a0" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#06d6a0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Insights Panel */}
      <motion.div 
        className={styles.insightsSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className={styles.insightsTitle}>
          <Zap size={22} className={styles.titleIcon} />
          Key Insights
        </h3>
        <div className={styles.insightsGrid}>
          <motion.div 
            className={styles.insightCard}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <div className={styles.insightIcon}>
              <CheckCircle size={22} />
            </div>
            <div className={styles.insightContent}>
              <h4>High Performance Segments</h4>
              <p>3 segments show above-average conversion rates (>15%), indicating strong targeting effectiveness.</p>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.insightCard}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <div className={styles.insightIcon}>
              <TrendingUp size={22} />
            </div>
            <div className={styles.insightContent}>
              <h4>Growth Acceleration</h4>
              <p>Profile acquisition has increased 18% in the last 30 days, with quality scores remaining stable.</p>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.insightCard}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <div className={styles.insightIcon}>
              <Target size={22} />
            </div>
            <div className={styles.insightContent}>
              <h4>Optimization Opportunity</h4>
              <p>Geographic expansion in Asia Pacific shows 28% growth potential based on current trends.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;