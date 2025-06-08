import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  Calendar, Users, Layers, Activity, Filter, Database,
  TrendingUp, ArrowRight, Zap, Shield, ChevronDown, ArrowUpRight, 
  BarChart2, Search, Bell, Settings, Download, RefreshCw,
  ChevronLeft, ChevronRight, Clock, Grid, List, Target,
  AlertTriangle, CheckCircle, Eye, Edit, Star, PieChart as PieChartIcon
} from 'lucide-react';
import axios from 'axios';
import styles from './dashboard.module.scss';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartView, setChartView] = useState('area');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({ title: '', value: '', position: { x: 0, y: 0 } });
  const [filterActive, setFilterActive] = useState(false);
  const [profileView, setProfileView] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);
  
  // Colors with alpha variations for premium gradients
  const COLORS = useMemo(() => [
    '#7b61ff', '#06d6a0', '#4cc9f0', '#f72585', '#8b5cf6', '#3b82f6'
  ], []);
  
  const GRADIENT_COLORS = useMemo(() => [
    'rgba(123, 97, 255, 0.2)', 'rgba(123, 97, 255, 0.05)', 'rgba(123, 97, 255, 0)'
  ], []);
  
  const ACCENT_GRADIENT_COLORS = useMemo(() => [
    'rgba(6, 214, 160, 0.2)', 'rgba(6, 214, 160, 0.05)', 'rgba(6, 214, 160, 0)'
  ], []);
  
  // Fetch data on time range change
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

  // Refresh data handler
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`/api/dashboard?timeRange=${timeRange}&t=${Date.now()}`);
      setMetrics(res.data);
      
      // Simulate success animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1200);
    } catch (err) {
      setError('Failed to refresh data');
      setRefreshing(false);
    }
  }, [timeRange]);

  // Enhanced trend data generation with more data points for smoother curves
  const generateTrendData = useCallback(() => {
    if (!metrics) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Create last 12 months of data with smooth growth trend
    return months.map((month, index) => {
      // Calculate a growth factor that starts lower and increases over time
      const normalizedIndex = (index + 12 - currentMonth) % 12;
      const growthFactor = 0.5 + (normalizedIndex / 12) * 0.5;
      
      return {
        name: month,
        profiles: Math.floor(metrics.totalProfiles * growthFactor),
        segments: Math.floor(metrics.totalSegments * (growthFactor * 0.9)), // Slightly different curve
        engagement: Math.floor(80 * (growthFactor * 0.85 + Math.sin(normalizedIndex / 2) * 0.1)), // Add some sine wave variation
      };
    });
  }, [metrics]);
  
  // Generate data for the interactive radial chart
  const generateRadialData = useCallback(() => {
    if (!metrics) return [];
    
    return metrics.segmentStats.map((segment, index) => ({
      name: segment.name,
      value: (segment.count / metrics.totalProfiles) * 100,
      fill: COLORS[index % COLORS.length]
    }));
  }, [metrics, COLORS]);

  // Process segment selection
  const handleSegmentSelect = useCallback((segment) => {
    setSelectedSegment(segment === selectedSegment ? null : segment);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [selectedSegment]);

  // Show custom tooltip
  const handleShowTooltip = useCallback((title, value, e) => {
    if (!e) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    setTooltipContent({
      title,
      value,
      position: { x, y }
    });
    
    setShowTooltip(true);
  }, []);

  // Hide tooltip
  const handleHideTooltip = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Generate chart data based on time range and filtered by selected segment if any
  const trendData = useMemo(() => {
    const data = metrics ? generateTrendData() : [];
    
    if (selectedSegment && metrics) {
      // Filter or adjust data for selected segment
      const segmentData = metrics.segmentStats.find(s => s.name === selectedSegment);
      if (segmentData) {
        const ratio = segmentData.count / metrics.totalProfiles;
        return data.map(item => ({
          ...item,
          profiles: Math.floor(item.profiles * ratio),
          segments: item.segments,
          engagement: Math.floor(item.engagement * (ratio * 1.2)) // Slightly boost engagement for segment focus
        }));
      }
    }
    
    return data;
  }, [metrics, generateTrendData, selectedSegment]);
  
  const radialData = useMemo(() => generateRadialData(), [generateRadialData]);

  // Custom formatter for tooltips
  const customTooltipFormatter = useCallback((value, name) => {
    const formattedValue = name === 'profiles' 
      ? value.toLocaleString() 
      : name === 'engagement' 
        ? `${value}%` 
        : value.toLocaleString();
        
    const formattedName = name === 'profiles' 
      ? 'Profiles' 
      : name === 'segments' 
        ? 'Segments' 
        : name === 'engagement' 
          ? 'Engagement Rate' 
          : name;
          
    return [formattedValue, formattedName];
  }, []);

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className={styles.tooltipItem}>
              <div 
                className={styles.tooltipMarker} 
                style={{ backgroundColor: entry.color }}
              />
              <span className={styles.tooltipName}>
                {entry.name === 'profiles' ? 'Profiles' : 
                 entry.name === 'segments' ? 'Segments' : 
                 entry.name === 'engagement' ? 'Engagement' : entry.name}:
              </span>
              <span className={styles.tooltipValue}>
                {entry.name === 'engagement' 
                  ? `${entry.value}%` 
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading state with enhanced animation
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

  // Error state with recovery option
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
      <button 
        className={styles.retryButton}
        onClick={handleRefresh}
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );

  if (!metrics) return null;

  return (
    <div className={styles.dashboardContainer}>
      {/* Custom tooltip that follows cursor */}
      {showTooltip && (
        <div 
          className={styles.floatingTooltip}
          style={{
            left: `${tooltipContent.position.x + 15}px`,
            top: `${tooltipContent.position.y - 40}px`
          }}
        >
          <div className={styles.tooltipTitle}>{tooltipContent.title}</div>
          <div className={styles.tooltipValue}>{tooltipContent.value}</div>
        </div>
      )}
      
      {/* Dashboard header with controls and actions */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.dashboardTitle}>Analytics Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Real-time insights into your segments and profiles</p>
        </div>
        
        <div className={styles.headerControls}>
          {/* Time range selector with enhanced UI */}
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
          
          {/* Refresh button with animation */}
          <button 
            className={`${styles.actionButton} ${refreshing ? styles.refreshing : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={styles.controlIcon} />
            <span>Refresh</span>
          </button>
          
          {/* Export data button */}
          <button className={styles.actionButton}>
            <Download size={16} className={styles.controlIcon} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Premium statistics cards with advanced visuals */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${isAnimating ? styles.pulse : ''}`}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Total Profiles</h2>
            <div className={styles.iconWrapper}>
              <Users className={styles.statIcon} size={20} />
              <div className={styles.iconGlow}></div>
            </div>
          </div>
          <div className={styles.statValue}>
            <span className={styles.valueNumber}>{metrics.totalProfiles.toLocaleString()}</span>
            <div className={styles.statTrend}>
              <ArrowUpRight size={14} className={styles.trendUpIcon} />
              <span className={styles.trendValue}>+12.5%</span>
            </div>
          </div>
          <div className={styles.statFooter}>
            <div className={styles.sparklineContainer}>
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={trendData.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorProfiles" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7b61ff" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#7b61ff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area 
        type="monotone" 
        dataKey="profiles" 
        stroke="#7b61ff" 
        strokeWidth={2}
        fill="url(#colorProfiles)"
        dot={false}
        isAnimationActive={true}
        animationDuration={1500}
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
            <span className={styles.compareText}>vs. last period</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${isAnimating ? styles.pulse : ''}`}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Active Segments</h2>
            <div className={styles.iconWrapper}>
              <Layers className={styles.statIcon} size={20} />
              <div className={`${styles.iconGlow} ${styles.accentGlow}`}></div>
            </div>
          </div>
          <div className={styles.statValue}>
            <span className={styles.valueNumber}>{metrics.totalSegments.toLocaleString()}</span>
            <div className={styles.statTrend}>
              <ArrowUpRight size={14} className={styles.trendUpIcon} />
              <span className={styles.trendValue}>+8.3%</span>
            </div>
          </div>
          <div className={styles.statFooter}>
            <div className={styles.sparklineContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.slice(-6)}>
                  <Line 
                    type="monotone" 
                    dataKey="segments" 
                    stroke="#06d6a0" 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <span className={styles.compareText}>vs. last period</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${isAnimating ? styles.pulse : ''}`}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Avg. Profiles per Segment</h2>
            <div className={styles.iconWrapper}>
              <Target className={styles.statIcon} size={20} />
              <div className={`${styles.iconGlow} ${styles.purpleGlow}`}></div>
            </div>
          </div>
          <div className={styles.statValue}>
            <span className={styles.valueNumber}>
              {metrics.totalSegments ? Math.round(metrics.totalProfiles / metrics.totalSegments).toLocaleString() : 0}
            </span>
          </div>
          <div className={styles.statFooter}>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar}
                style={{ 
                  width: `${Math.min(100, (metrics.totalProfiles / metrics.totalSegments) / 10)}%`
                }}
              ></div>
            </div>
            <span className={styles.compareText}>
              Target: {(metrics.totalProfiles / metrics.totalSegments * 1.2).toFixed(0)}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} ${isAnimating ? styles.pulse : ''}`}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Data Quality Score</h2>
            <div className={styles.iconWrapper}>
              <Shield className={styles.statIcon} size={20} />
              <div className={`${styles.iconGlow} ${styles.amberGlow}`}></div>
            </div>
          </div>
          <div className={styles.statValue}>
            <span className={styles.valueNumber}>94<span className={styles.valueUnit}>%</span></span>
          </div>
          <div className={styles.statFooter}>
            <div className={styles.qualityGauge}>
              <svg viewBox="0 0 120 60" className={styles.gauge}>
                <path 
                  className={styles.gaugeBackground}
                  d="M10,50 A40,40 0 1,1 110,50"
                />
                <path 
                  className={styles.gaugeFill}
                  d="M10,50 A40,40 0 1,1 110,50"
                  style={{ 
                    strokeDasharray: `${94 * 1.26}, 126`,
                    stroke: `url(#qualityGradient)`
                  }}
                />
                <defs>
                  <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06d6a0" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={styles.qualityIndicator}>
              <CheckCircle size={14} className={styles.qualityIcon} />
              <span>Excellent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive chart control tabs */}
      <div className={styles.tabNavigation}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`${styles.tabButton} ${
            activeTab === 'overview' 
              ? styles.tabButtonActive
              : styles.tabButtonInactive
          }`}
        >
          <Activity className={styles.tabIcon} size={18} />
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
          <Layers className={styles.tabIcon} size={18} />
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
          <Users className={styles.tabIcon} size={18} />
          Profiles
        </button>
        
        <button
          onClick={() => setActiveTab('trends')}
          className={`${styles.tabButton} ${
            activeTab === 'trends' 
              ? styles.tabButtonActive
              : styles.tabButtonInactive
          }`}
        >
          <TrendingUp className={styles.tabIcon} size={18} />
          Trends
        </button>
        
        {/* Chart type toggle group */}
        <div className={styles.chartTypeToggle}>
          <button 
            className={`${styles.chartTypeButton} ${chartView === 'area' ? styles.chartTypeActive : ''}`}
            onClick={() => setChartView('area')}
            title="Area Chart"
          >
            <Activity size={16} />
          </button>
          <button 
            className={`${styles.chartTypeButton} ${chartView === 'bar' ? styles.chartTypeActive : ''}`}
            onClick={() => setChartView('bar')}
            title="Bar Chart"
          >
            <BarChart2 size={16} />
          </button>
          <button 
            className={`${styles.chartTypeButton} ${chartView === 'pie' ? styles.chartTypeActive : ''}`}
            onClick={() => setChartView('pie')}
            title="Pie Chart"
          >
            <PieChartIcon size={16} />
          </button>
        </div>
      </div>

      {/* Main dashboard content based on active tab */}
      <div className={`${styles.dashboardContent} ${styles[`tab${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`]}`}>
        {activeTab === 'overview' && (
          <>
            <div className={styles.contentGrid}>
              {/* Main chart section */}
              <div className={`${styles.contentSection} ${styles.largeSection}`}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Growth Trends</h2>
                    <p className={styles.sectionSubtitle}>
                      {selectedSegment 
                        ? `Data for "${selectedSegment}" segment` 
                        : 'Profiles and segments over time'}
                    </p>
                  </div>
                  
                  <div className={styles.sectionControls}>
                    {selectedSegment && (
                      <button 
                        className={styles.clearFilterButton}
                        onClick={() => setSelectedSegment(null)}
                      >
                        Clear Filter
                      </button>
                    )}
                    
                    <div className={styles.chartLegend}>
                      <div 
                        className={styles.legendItem}
                        onMouseEnter={(e) => handleShowTooltip('Profiles', 'User profiles in the system', e)}
                        onMouseLeave={handleHideTooltip}
                      >
                        <div className={styles.legendMarker} style={{backgroundColor: '#7b61ff'}}></div>
                        <span>Profiles</span>
                      </div>
                      <div 
                        className={styles.legendItem}
                        onMouseEnter={(e) => handleShowTooltip('Segments', 'Active segments defined', e)}
                        onMouseLeave={handleHideTooltip}
                      >
                        <div className={styles.legendMarker} style={{backgroundColor: '#06d6a0'}}></div>
                        <span>Segments</span>
                      </div>
                      <div 
                        className={styles.legendItem}
                        onMouseEnter={(e) => handleShowTooltip('Engagement', 'User engagement percentage', e)}
                        onMouseLeave={handleHideTooltip}
                      >
                        <div className={styles.legendMarker} style={{backgroundColor: '#4cc9f0'}}></div>
                        <span>Engagement</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.chartContainer}>
                  {chartView === 'area' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={trendData} 
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
                            {GRADIENT_COLORS.map((color, i) => (
                              <stop 
                                key={i} 
                                offset={i / (GRADIENT_COLORS.length - 1)} 
                                stopColor={color} 
                              />
                            ))}
                          </linearGradient>
                          <linearGradient id="segmentFill" x1="0" y1="0" x2="0" y2="1">
                            {ACCENT_GRADIENT_COLORS.map((color, i) => (
                              <stop 
                                key={i} 
                                offset={i / (ACCENT_GRADIENT_COLORS.length - 1)} 
                                stopColor={color} 
                              />
                            ))}
                          </linearGradient>
                          <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="rgba(76, 201, 240, 0.2)" />
                            <stop offset="0.5" stopColor="rgba(76, 201, 240, 0.05)" />
                            <stop offset="1" stopColor="rgba(76, 201, 240, 0)" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(255, 255, 255, 0.05)" 
                          vertical={false} 
                        />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                          dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="profiles" 
                          stroke="#7b61ff" 
                          strokeWidth={2} 
                          fill="url(#profileFill)" 
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="segments" 
                          stroke="#06d6a0" 
                          strokeWidth={2} 
                          fill="url(#segmentFill)"
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                          isAnimationActive={true}
                          animationDuration={1500} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="#4cc9f0" 
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#4cc9f0' }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                  
                  {chartView === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(255, 255, 255, 0.05)" 
                          vertical={false} 
                        />
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
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="profiles" 
                          fill="#7b61ff" 
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                        <Bar 
                          dataKey="segments" 
                          fill="#06d6a0"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {chartView === 'pie' && (
                    <div className={styles.pieChartLayout}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metrics.segmentStats}
                            nameKey="name"
                            dataKey="count"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            fill="#8884d8"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1 }}
                            isAnimationActive={true}
                            animationDuration={1500}
                            onClick={(entry) => handleSegmentSelect(entry.name)}
                          >
                            {metrics.segmentStats.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                opacity={selectedSegment === entry.name ? 1 : selectedSegment ? 0.5 : 1}
                                stroke={selectedSegment === entry.name ? '#ffffff' : 'none'}
                                strokeWidth={selectedSegment === entry.name ? 2 : 0}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={customTooltipFormatter} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className={styles.pieChartLegend}>
                        {metrics.segmentStats.map((segment, index) => (
                          <div 
                            key={index} 
                            className={`${styles.legendItem} ${styles.clickableLegend} ${selectedSegment === segment.name ? styles.legendSelected : ''}`}
                            onClick={() => handleSegmentSelect(segment.name)}
                          >
                            <div 
                              className={styles.legendMarker} 
                              style={{backgroundColor: COLORS[index % COLORS.length]}}
                            ></div>
                            <span className={styles.legendLabel}>{segment.name}</span>
                            <span className={styles.legendValue}>{segment.count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Radial chart for segment analysis */}
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Segment Distribution</h2>
                    <p className={styles.sectionSubtitle}>Relative size and performance</p>
                  </div>
                  <button className={styles.viewAllButton}>
                    View All
                    <ArrowRight size={16} className={styles.arrowIcon} />
                  </button>
                </div>
                
                <div className={styles.radialChartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="30%" 
                      outerRadius="85%" 
                      data={radialData} 
                      startAngle={90} 
                      endAngle={-270}
                      barSize={20}
                    >
                      <RadialBar
                        label={{ fill: 'rgba(255, 255, 255, 0.65)', fontSize: 12, position: 'insideStart' }}
                        background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationEasing="ease-out"
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Percentage']}
                        cursor={false}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  
                  <div className={styles.radialChartCenter}>
                    <div className={styles.radialChartValue}>
                      {selectedSegment ? 
                        metrics.segmentStats.find(s => s.name === selectedSegment)?.count.toLocaleString() : 
                        metrics.totalProfiles.toLocaleString()}
                    </div>
                    <div className={styles.radialChartLabel}>
                      {selectedSegment ? selectedSegment : 'Total Profiles'}
                    </div>
                  </div>
                </div>
                
                <div className={styles.distributionLegend}>
                  {metrics.segmentStats.slice(0, 4).map((segment, index) => (
                    <div 
                      key={index} 
                      className={`${styles.distributionItem} ${selectedSegment === segment.name ? styles.distributionSelected : ''}`}
                      onClick={() => handleSegmentSelect(segment.name)}
                    >
                      <div className={styles.distributionIcon} style={{backgroundColor: COLORS[index % COLORS.length]}}>
                        {segment.name.charAt(0)}
                      </div>
                      <div className={styles.distributionInfo}>
                        <div className={styles.distributionName}>{segment.name}</div>
                        <div className={styles.distributionCount}>{segment.count.toLocaleString()} profiles</div>
                      </div>
                      <div className={styles.distributionPercentage}>
                        {((segment.count / metrics.totalProfiles) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom performance section */}
            <div className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Top Performing Segments</h2>
                  <p className={styles.sectionSubtitle}>Highest profile count by segment</p>
                </div>
                <div className={styles.sectionControls}>
                  <button className={styles.viewAllButton}>
                    View All
                    <ArrowRight size={16} className={styles.arrowIcon} />
                  </button>
                </div>
              </div>
              
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metrics.segmentStats.sort((a, b) => b.count - a.count).slice(0, 5)} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    layout="vertical"
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255, 255, 255, 0.05)" 
                      horizontal={true} 
                      vertical={false} 
                    />
                    <XAxis 
                      type="number" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={150}
                      tick={{
                        fill: 'rgba(255, 255, 255, 0.85)',
                        fontSize: 12,
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      name="Profiles" 
                      fill="#7b61ff" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                      isAnimationActive={true}
                      animationDuration={1500}
                    >
                      {metrics.segmentStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          onClick={() => handleSegmentSelect(entry.name)}
                          opacity={selectedSegment === entry.name ? 1 : selectedSegment ? 0.5 : 1}
                          cursor="pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'segments' && (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Segment Analysis</h2>
                <p className={styles.sectionSubtitle}>Overview of all defined segments</p>
              </div>
              <button className={styles.primaryButton}>
                <Layers size={16} />
                <span>Create Segment</span>
              </button>
            </div>
            
            <div className={styles.tableToolbar}>
              <div className={styles.tableSearch}>
                <Search size={16} className={styles.tableSearchIcon} />
                <input type="text" placeholder="Search segments..." className={styles.tableSearchInput} />
              </div>
              <div className={styles.tableActions}>
                <button 
                  className={`${styles.tableAction} ${filterActive ? styles.tableActionActive : ''}`}
                  onClick={() => setFilterActive(!filterActive)}
                >
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
                <button className={styles.tableAction}>
                  <BarChart2 size={16} />
                  <span>Sort</span>
                </button>
              </div>
            </div>
            
            {filterActive && (
              <div className={styles.filterPanel}>
                <div className={styles.filterSection}>
                  <h3 className={styles.filterTitle}>Filter Segments</h3>
                  <div className={styles.filterGroup}>
                    <div className={styles.filterControl}>
                      <label className={styles.filterLabel}>Min Profiles</label>
                      <input type="number" className={styles.filterInput} placeholder="0" />
                    </div>
                    <div className={styles.filterControl}>
                      <label className={styles.filterLabel}>Max Profiles</label>
                      <input type="number" className={styles.filterInput} placeholder="Max" />
                    </div>
                    <div className={styles.filterControl}>
                      <label className={styles.filterLabel}>Created After</label>
                      <input type="date" className={styles.filterInput} />
                    </div>
                  </div>
                  <div className={styles.filterButtons}>
                    <button className={styles.filterApplyButton}>Apply Filters</button>
                    <button className={styles.filterResetButton}>Reset</button>
                  </div>
                </div>
              </div>
            )}
            
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>Segment Name</th>
                    <th className={styles.tableHeaderCell}>Profiles</th>
                    <th className={styles.tableHeaderCell}>% of Total</th>
                    <th className={styles.tableHeaderCell}>Created</th>
                    <th className={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.segmentStats.map((segment, index) => (
                    <tr 
                      key={index} 
                      className={`${styles.tableRow} ${selectedSegment === segment.name ? styles.tableRowSelected : ''}`}
                      onClick={() => handleSegmentSelect(segment.name)}
                    >
                      <td className={`${styles.tableCell} ${styles.tableCellMain}`}>
                        <div className={styles.segmentNameCell}>
                          <div 
                            className={styles.segmentIcon} 
                            style={{backgroundColor: COLORS[index % COLORS.length]}}
                          >
                            <Layers size={14} className={styles.segmentIconInner} />
                          </div>
                          {segment.name}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.cellWithBadge}>
                          {segment.count.toLocaleString()}
                          {segment.count > 300 && (
                            <span className={styles.highCountBadge}>
                              High
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.percentageBar}>
                          <div 
                            className={styles.percentageBarFill} 
                            style={{
                              width: `${(segment.count / metrics.totalProfiles) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                          <span>{((segment.count / metrics.totalProfiles) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {segment.created ? new Date(segment.created).toLocaleDateString() : '2 days ago'}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionButtonView}>
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button className={styles.actionButtonEdit}>
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={styles.tablePagination}>
              <div className={styles.paginationInfo}>
                Showing <span>1-{metrics.segmentStats.length}</span> of <span>{metrics.segmentStats.length}</span> segments
              </div>
              <div className={styles.paginationControls}>
                <button className={`${styles.paginationButton} ${styles.paginationButtonDisabled}`}>
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button className={styles.paginationButton}>
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Profile Distribution</h2>
                <p className={styles.sectionSubtitle}>Breakdown of profiles across segments</p>
              </div>
              <div className={styles.viewControls}>
                <button 
                  className={`${styles.viewControl} ${profileView === 'grid' ? styles.viewControlActive : ''}`}
                  onClick={() => setProfileView('grid')}
                >
                  <Grid size={16} />
                </button>
                <button 
                  className={`${styles.viewControl} ${profileView === 'list' ? styles.viewControlActive : ''}`}
                  onClick={() => setProfileView('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
            
            {profileView === 'grid' ? (
              <div className={styles.profileGrid}>
                {metrics.segmentStats.map((segment, index) => (
                  <div 
                    key={index} 
                    className={`${styles.profileCard} ${selectedSegment === segment.name ? styles.profileCardSelected : ''}`}
                    onClick={() => handleSegmentSelect(segment.name)}
                  >
                    <div 
                      className={styles.profileCardHeader}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      <h3 className={styles.profileCardTitle}>{segment.name}</h3>
                      <div className={styles.profileCardBadge}>
                        {((segment.count / metrics.totalProfiles) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className={styles.profileCardBody}>
                      <div className={styles.profileCardValue}>
                        {segment.count.toLocaleString()}
                        <span className={styles.profileCardLabel}>profiles</span>
                      </div>
                      <div className={styles.profileCardTrend}>
                        <div className={styles.sparklineContainer}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData.slice(-5)}>
                              <Line 
                                type="monotone" 
                                dataKey="profiles" 
                                stroke={COLORS[index % COLORS.length]} 
                                strokeWidth={2} 
                                dot={false} 
                                isAnimationActive={true}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <div className={styles.profileCardFooter}>
                      <button className={styles.profileCardButton}>
                        <Eye size={14} />
                        <span>View Profiles</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.profileList}>
                {metrics.segmentStats.map((segment, index) => (
                  <div 
                    key={index} 
                    className={`${styles.profileListItem} ${selectedSegment === segment.name ? styles.profileListItemSelected : ''}`}
                    onClick={() => handleSegmentSelect(segment.name)}
                  >
                    <div className={styles.profileListMain}>
                      <div 
                        className={styles.profileListIcon} 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {segment.name.charAt(0)}
                      </div>
                      <div className={styles.profileListInfo}>
                        <h3 className={styles.profileListTitle}>{segment.name}</h3>
                        <div className={styles.profileListMeta}>
                          Created {segment.created ? new Date(segment.created).toLocaleDateString() : '2 days ago'}
                        </div>
                      </div>
                    </div>
                    <div className={styles.profileListCount}>
                      {segment.count.toLocaleString()}
                      <span className={styles.profileListLabel}>profiles</span>
                    </div>
                    <div className={styles.profileListPercentage}>
                      {((segment.count / metrics.totalProfiles) * 100).toFixed(1)}%
                    </div>
                    <div className={styles.profileListActions}>
                      <button className={styles.profileListButton}>
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Growth Trends</h2>
                <p className={styles.sectionSubtitle}>Long-term performance metrics</p>
              </div>
              <div className={styles.sectionControls}>
                <button className={styles.actionButton}>
                  <Download size={16} />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
            
            <div className={styles.trendCharts}>
              <div className={styles.trendChartWrapper}>
                <h3 className={styles.trendChartTitle}>Profile Growth</h3>
                <div className={styles.trendChart}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="profiles" 
                        name="Profiles" 
                        stroke="#7b61ff" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#7b61ff', strokeWidth: 2, stroke: 'rgba(255, 255, 255, 0.2)' }}
                        activeDot={{ r: 8, fill: '#7b61ff', strokeWidth: 2, stroke: '#ffffff' }}
                        isAnimationActive={true}
                        animationDuration={2000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={styles.trendChartWrapper}>
                <h3 className={styles.trendChartTitle}>Segment Growth</h3>
                <div className={styles.trendChart}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="segments" 
                        name="Segments" 
                        stroke="#06d6a0" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#06d6a0', strokeWidth: 2, stroke: 'rgba(255, 255, 255, 0.2)' }}
                        activeDot={{ r: 8, fill: '#06d6a0', strokeWidth: 2, stroke: '#ffffff' }}
                        isAnimationActive={true}
                        animationDuration={2000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className={styles.insightsSection}>
              <h3 className={styles.insightsTitle}>Key Insights</h3>
              <div className={styles.insightsGrid}>
                <div className={styles.insightCard}>
                  <div className={styles.insightIcon}>
                    <TrendingUp size={20} />
                  </div>
                  <div className={styles.insightContent}>
                    <h4 className={styles.insightTitle}>Steady Growth</h4>
                    <p className={styles.insightText}>
                      Profile count has increased by 12.5% over the last period, showing consistent growth.
                    </p>
                  </div>
                </div>
                
                <div className={styles.insightCard}>
                  <div className={styles.insightIcon}>
                    <Target size={20} />
                  </div>
                  <div className={styles.insightContent}>
                    <h4 className={styles.insightTitle}>Segment Optimization</h4>
                    <p className={styles.insightText}>
                      The average profiles per segment ratio suggests efficient segmentation.
                    </p>
                  </div>
                </div>
                
                <div className={styles.insightCard}>
                  <div className={styles.insightIcon}>
                    <Star size={20} />
                  </div>
                  <div className={styles.insightContent}>
                    <h4 className={styles.insightTitle}>High Quality Data</h4>
                    <p className={styles.insightText}>
                      94% data quality score indicates excellent profile data integrity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}