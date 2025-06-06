// pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.scss';
import Card from '../../components/Card/Card';
import AreaChart from '../../components/Charts/AreaChart';

import { 
  PieChart, 
  Upload,  
  Users, 
  TrendingUp, 
  Target, 
  Download, 
  Sparkles, 
  BarChart3, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  Activity,
  Eye,
  RefreshCw,
  Settings,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain,
  Globe,
  Shield,
  Clock,
  TrendingDown,
  Star,
  AlertCircle,
  CheckCircle,
  Database,
  Layers,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';

const Dashboard = () => {
  useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState({});
  const [features, setFeatures] = useState([]);
  const [gptSummaries, setGptSummaries] = useState({});
  const [loadingSeg, setLoadingSeg] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Generate mock data for charts
  const generateChartData = (days = 30, trend = 'up', volatility = 0.2) => {
    const data = [];
    const today = new Date();
    const baseValue = 1000 + Math.random() * 2000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let modifier = trend === 'up' 
        ? 1 + (i / days) * (1 + Math.random() * volatility)
        : 1 + ((days - i) / days) * (1 + Math.random() * volatility);
      
      if (trend === 'volatile') {
        modifier = 1 + Math.sin(i * 0.5) * volatility + Math.random() * volatility;
      }
      
      data.push({
        date: date.toISOString(),
        value: Math.round(baseValue * modifier)
      });
    }
    
    return data;
  };

  // Update activeView based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') {
      setActiveView('overview');
    } else if (path === '/segments') {
      setActiveView('segments');
    } else if (path === '/analytics') {
      setActiveView('analytics');
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Try to get data from localStorage
      const raw = localStorage.getItem('segments');
      console.log('[Dashboard] Loading data from localStorage:', raw);
      
      if (!raw) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        console.log('[Dashboard] Parsed data:', parsed);
        
        setSegments(parsed.segments || []);
        setSummary(parsed.summary || '');
        setDetails(parsed.segment_details || {});
        setFeatures(parsed.features_used || []);
        
        if (parsed.segment_insights) {
          setGptSummaries(parsed.segment_insights);
        }
      } catch (err) {
        console.error('[Dashboard] Error parsing localStorage:', err);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const segmentGroups = segments.reduce((acc, row) => {
    const seg = row.segment;
    if (!acc[seg]) acc[seg] = [];
    acc[seg].push(row);
    return acc;
  }, {});

  const generateSummary = async (segmentId) => {
    const data = segmentGroups[segmentId];
    if (!data || data.length === 0) return;

    try {
      setLoadingSeg(segmentId);
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/insight/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ segmentData: data })
      });

      const result = await res.json();
      if (result.summary) {
        setGptSummaries(prev => ({ ...prev, [segmentId]: result.summary }));
      }
    } catch (err) {
      console.error('[Dashboard] Summary Error:', err);
      setGptSummaries(prev => ({ ...prev, [segmentId]: 'Analysis temporarily unavailable.' }));
    } finally {
      setLoadingSeg(null);
    }
  };

  const getSegmentMetrics = (segmentId) => {
    const data = segmentGroups[segmentId];
    const detailKey = `Segment_${segmentId}`;
    const info = details[detailKey] || {};
    
    if (!data || data.length === 0) {
      return {
        totalUsers: 0,
        percentage: 0,
        avgValue: 0,
        growth: 0,
        engagement: 0
      };
    }
    
    const totalUsers = data.length;
    const percentage = info.percentage || 0;
    
    const sampleRow = data[0] || {};
    const numericFields = Object.keys(sampleRow).filter(key => 
      typeof sampleRow[key] === 'number' && key !== 'segment'
    );
    
    let avgValue = 0;
    let engagement = 0;
    
    if (numericFields.length > 0) {
      const firstNumericField = numericFields[0];
      const values = data
        .map(row => row[firstNumericField])
        .filter(val => val !== null && val !== undefined && !isNaN(val));
      
      if (values.length > 0) {
        avgValue = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
      }
      
      if (numericFields.length > 1) {
        const secondField = numericFields[1];
        const engagementValues = data
          .map(row => row[secondField])
          .filter(val => val !== null && val !== undefined && !isNaN(val));
        
        if (engagementValues.length > 0) {
          engagement = Math.round(engagementValues.reduce((sum, val) => sum + val, 0) / engagementValues.length);
        }
      } else {
        engagement = avgValue > 0 ? Math.min(Math.round((avgValue / 100) * 75), 100) : Math.round(Math.random() * 40 + 40);
      }
    } else {
      avgValue = Math.round(totalUsers * 45 + 800);
      engagement = Math.round(Math.min(totalUsers * 0.8 + 20, 95));
    }
    
    const growth = totalUsers > 100 ? 
      Math.round((totalUsers / 10) - 5) : 
      Math.round((totalUsers / 5) - 8);
    
    return {
      totalUsers,
      percentage,
      avgValue,
      growth: Math.max(-15, Math.min(25, growth)),
      engagement: Math.max(15, Math.min(100, engagement)),
      chartData: generateChartData(30, growth > 0 ? 'up' : 'down', 0.3),
      ...info
    };
  };

  const renderQuickStats = () => {
    const totalCustomers = segments.length;
    const totalSegments = Object.keys(segmentGroups).length;
    const avgSegmentSize = totalSegments > 0 ? Math.round(totalCustomers / totalSegments) : 0;
    
    return (
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-value">{totalCustomers.toLocaleString()}</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-change positive">+12.5%</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{totalSegments}</div>
          <div className="stat-label">Active Segments</div>
          <div className="stat-change positive">+2 new</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{avgSegmentSize}</div>
          <div className="stat-label">Avg Segment Size</div>
          <div className="stat-change neutral">Stable</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">94.2%</div>
          <div className="stat-label">ML Accuracy</div>
          <div className="stat-change positive">+2.1%</div>
        </div>
      </div>
    );
  };

  // Update the navigation tabs to use proper routing
  const renderNavigationTabs = () => (
    <div className="content-tabs">
      <button 
        className={`tab ${activeView === 'overview' ? 'active' : ''}`}
        onClick={() => navigate('/dashboard')}
      >
        <Eye size={16} />
        Overview
      </button>
      <button 
        className={`tab ${activeView === 'segments' ? 'active' : ''}`}
        onClick={() => navigate('/segments')}
      >
        <Target size={16} />
        Segments
      </button>
      <button 
       className={`tab ${activeView === 'analytics' ? 'active' : ''}`}
       onClick={() => navigate('/analytics')}
     >
       <BarChart3 size={16} />
       Analytics
     </button>
     <button 
       className={`tab ${activeView === 'data' ? 'active' : ''}`}
       onClick={() => setActiveView('data')}
     >
       <Database size={16} />
       Data
     </button>
   </div>
 );

 const renderSegmentCards = () => {
   const segmentIds = Object.keys(segmentGroups);
   
   if (segmentIds.length === 0) {
     return (
       <Card 
         className="empty-state-card"
         icon={<Target size={32} />}
         title="No Segments Available"
         footer={
           <button className="btn-primary" onClick={() => navigate('/upload')}>
             <Upload size={16} />
             Upload Customer Data
           </button>
         }
       >
         <p>Upload customer data to generate intelligent segments and unlock powerful insights</p>
       </Card>
     );
   }

   return (
     <div className="segments-container">
       {segmentIds.map((segmentId) => {
         const metrics = getSegmentMetrics(segmentId);
         const isActive = selectedSegment === segmentId;
         
         return (
           <Card
             key={segmentId}
             className={`segment-card ${isActive ? 'active' : ''} segment-${segmentId}`}
             onClick={() => setSelectedSegment(selectedSegment === segmentId ? null : segmentId)}
           >
             <div className="card-header">
               <div className="segment-info">
                 <div className={`segment-dot segment-${segmentId}`}></div>
                 <div className="segment-title">
                   <h4>Segment {segmentId}</h4>
                   <span className="segment-size">{metrics.totalUsers} customers • {metrics.percentage}%</span>
                 </div>
               </div>
               
               <div className="card-actions">
                 <button 
                   className="action-btn"
                   onClick={(e) => {
                     e.stopPropagation();
                     generateSummary(segmentId);
                   }}
                   disabled={loadingSeg === segmentId}
                   title="Generate AI Insights"
                 >
                   {loadingSeg === segmentId ? (
                     <RefreshCw size={14} className="spinning" />
                   ) : (
                     <Brain size={14} />
                   )}
                 </button>
                 <button 
                   className="action-btn"
                   onClick={(e) => {
                     e.stopPropagation();
                     // Handle export logic
                   }}
                   title="Export Data"
                 >
                   <Download size={14} />
                 </button>
                 <button className="action-btn">
                   <MoreHorizontal size={14} />
                 </button>
               </div>
             </div>

             {/* Growth Chart */}
             <div className="segment-chart">
               <AreaChart 
                 data={metrics.chartData} 
                 height={80} 
                 color={
                   segmentId === '0' ? '#ef4444' :
                   segmentId === '1' ? '#3b82f6' :
                   segmentId === '2' ? '#10b981' :
                   segmentId === '3' ? '#f59e0b' :
                   '#8b5cf6'
                 }
                 showAxis={false}
                 showTooltip={false}
               />
             </div>

             <div className="metrics-grid">
               <div className="metric">
                 <div className="metric-icon">
                   <DollarSign size={16} />
                 </div>
                 <div className="metric-content">
                   <div className="metric-value">${metrics.avgValue.toLocaleString()}</div>
                   <div className="metric-label">Avg Value</div>
                 </div>
               </div>
               
               <div className="metric">
                 <div className="metric-icon">
                   <Activity size={16} />
                 </div>
                 <div className="metric-content">
                   <div className="metric-value">{metrics.engagement}%</div>
                   <div className="metric-label">Engagement</div>
                 </div>
               </div>
               
               <div className="metric">
                 <div className="metric-icon">
                   <TrendingUp size={16} />
                 </div>
                 <div className="metric-content">
                   <div className={`metric-value ${metrics.growth >= 0 ? 'positive' : 'negative'}`}>
                     {metrics.growth >= 0 ? '+' : ''}{metrics.growth}%
                   </div>
                   <div className="metric-label">Growth</div>
                 </div>
               </div>
               
               <div className="metric">
                 <div className="metric-icon">
                   <Star size={16} />
                 </div>
                 <div className="metric-content">
                   <div className="metric-value">A+</div>
                   <div className="metric-label">Quality</div>
                 </div>
               </div>
             </div>

             {gptSummaries[segmentId] && (
               <div className="ai-insights">
                 <div className="insights-header">
                   <Sparkles size={14} />
                   <span>AI Analysis</span>
                 </div>
                 <p className="insights-text">{gptSummaries[segmentId]}</p>
               </div>
             )}

             {isActive && (
               <div className="segment-actions">
                 <button className="primary-action">
                   <Play size={14} />
                   Launch Campaign
                 </button>
                 <button className="secondary-action">
                   <Eye size={14} />
                   View Details
                 </button>
               </div>
             )}
           </Card>
         );
       })}
     </div>
   );
 };

 const renderDataTable = () => {
   if (segments.length === 0) return null;

   const filteredSegments = segments.filter(row => {
     const matchesSearch = searchTerm === '' || 
       Object.values(row).some(val => 
         String(val).toLowerCase().includes(searchTerm.toLowerCase())
       );
     
     const matchesFilter = filterType === 'all' || 
       String(row.segment) === filterType;
     
     return matchesSearch && matchesFilter;
   });

   return (
     <Card 
       title="Customer Data"
       subtitle={`${filteredSegments.length.toLocaleString()} records`}
       icon={<Database size={20} />}
       className="data-table-card"
     >
       <div className="table-controls">
         <div className="search-input">
           <Search size={16} />
           <input
             type="text"
             placeholder="Search customers..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         
         <select 
           value={filterType} 
           onChange={(e) => setFilterType(e.target.value)}
           className="filter-select"
         >
           <option value="all">All Segments</option>
           {Object.keys(segmentGroups).map(id => (
             <option key={id} value={id}>Segment {id}</option>
           ))}
         </select>
       </div>

       <div className="table-wrapper">
         <table className="data-table">
           <thead>
             <tr>
               {segments[0] && Object.keys(segments[0]).map((col) => (
                 <th key={col}>
                   <div className="header-content">
                     <span>{col.replace('_', ' ').toUpperCase()}</span>
                     <Filter size={12} />
                   </div>
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {filteredSegments.slice(0, 50).map((row, i) => (
               <tr key={i} className={`row-segment-${row.segment}`}>
                 {Object.entries(row).map(([key, val], j) => (
                   <td key={j}>
                     {key === 'segment' ? (
                       <span className={`segment-tag segment-${val}`}>
                         Segment {val}
                       </span>
                     ) : (
                       <span className="cell-value">{String(val)}</span>
                     )}
                   </td>
                 ))}
               </tr>
             ))}
           </tbody>
         </table>
         
         {filteredSegments.length > 50 && (
           <div className="table-pagination">
             <span>Showing 50 of {filteredSegments.length} records</span>
             <button className="load-more">Load More</button>
           </div>
         )}
       </div>
     </Card>
   );
 };

 const renderAnalyticsContent = () => {
   // Generate some mock data for analytics
   const segmentGrowthData = generateChartData(30, 'up', 0.3);
   const revenueData = generateChartData(30, 'up', 0.2);
   const engagementData = generateChartData(30, 'up', 0.25);
   
   return (
     <div className="analytics-content">
       <div className="analytics-header">
         <h2>Advanced Analytics</h2>
         <p>Comprehensive metrics and insights across all customer segments</p>
         
         <div className="time-selector">
           <button className="btn-secondary">
             <Calendar size={16} />
             <span>Last {timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '12 months'}</span>
             <ChevronDown size={14} />
           </button>
         </div>
       </div>
       
       <div className="analytics-grid">
         <Card 
           title="Segment Growth"
           subtitle="New segments and customer distribution"
           icon={<TrendingUp size={20} />}
           className="analytics-card"
         >
           <div className="chart-container">
             <AreaChart 
               data={segmentGrowthData} 
               height={200} 
               color="#635bff"
               formatY={value => `${value.toLocaleString()}`}
             />
           </div>
           
           <div className="kpi-row">
             <div className="kpi">
               <div className="kpi-value">+32%</div>
               <div className="kpi-label">Growth Rate</div>
             </div>
             <div className="kpi">
               <div className="kpi-value">1,248</div>
               <div className="kpi-label">New Customers</div>
             </div>
             <div className="kpi">
               <div className="kpi-value">5</div>
               <div className="kpi-label">Active Segments</div>
             </div>
           </div>
         </Card>
         
         <Card 
           title="Revenue Performance"
           subtitle="Revenue by segment and growth trend"
           icon={<DollarSign size={20} />}
           className="analytics-card"
         >
           <div className="chart-container">
             <AreaChart 
               data={revenueData} 
               height={200} 
               color="#10b981"
               formatY={value => `$${value.toLocaleString()}`}
             />
           </div>
           
           <div className="kpi-row">
             <div className="kpi">
               <div className="kpi-value">$842k</div>
               <div className="kpi-label">Total Revenue</div>
             </div>
             <div className="kpi">
               <div className="kpi-value">+18%</div>
               <div className="kpi-label">Growth Rate</div>
             </div>
             <div className="kpi">
               <div className="kpi-value">$4.2k</div>
               <div className="kpi-label">Avg. Order Value</div>
             </div>
           </div>
         </Card>
         
         <Card 
           title="Customer Engagement"
           subtitle="Engagement metrics and activity levels"
           icon={<Activity size={20} />}
           className="analytics-card"
         >
           <div className="chart-container">
             <AreaChart 
               data={engagementData} 
               height={200} 
               color="#3b82f6"
               formatY={value => `${value.toLocaleString()}`}
             />
           </div>
           
           <div className="kpi-row">
             <div className="kpi">
               <div className="kpi-value">78%</div>
               <div className="kpi-label">Active Users</div>
             </div>
             <div className="kpi">
               <div className="kpi-value">3.4</div>
               <div className="kpi-label">Sessions / User</div>
             </div>
             <div className="kpi">
               <div className="kpi-value">8m 32s</div>
               <div className="kpi-label">Avg. Session</div>
             </div>
           </div>
         </Card>
         
         <Card 
           title="Segment Performance"
           subtitle="Key metrics by customer segment"
           icon={<Target size={20} />}
           className="analytics-card full-width"
         >
           <div className="segment-performance-grid">
             {Object.keys(segmentGroups).map(segmentId => {
               const metrics = getSegmentMetrics(segmentId);
               
               return (
                 <div key={segmentId} className="segment-performance">
                   <div className="segment-header">
                     <div className={`segment-dot segment-${segmentId}`}></div>
                     <div className="segment-name">Segment {segmentId}</div>
                     <div className="segment-count">{metrics.totalUsers} customers</div>
                   </div>
                   
                   <div className="segment-metrics">
                     <div className="metric-bar-container">
                       <div className="metric-bar-label">Value</div>
                       <div className="metric-bar">
                         <div 
                           className="metric-bar-fill" 
                           style={{ width: `${Math.min(Math.max(metrics.avgValue / 50, 10), 95)}%` }}
                         ></div>
                         <div className="metric-bar-value">${metrics.avgValue}</div>
                       </div>
                     </div>
                     
                     <div className="metric-bar-container">
                       <div className="metric-bar-label">Engagement</div>
                       <div className="metric-bar">
                         <div 
                           className="metric-bar-fill" 
                           style={{ width: `${metrics.engagement}%` }}
                         ></div>
                         <div className="metric-bar-value">{metrics.engagement}%</div>
                       </div>
                     </div>
                     
                     <div className="metric-bar-container">
                       <div className="metric-bar-label">Growth</div>
                       <div className="metric-bar">
                         <div 
                           className="metric-bar-fill" 
                           style={{ width: `${Math.min(Math.max(metrics.growth + 20, 10), 95)}%` }}
                         ></div>
                         <div className="metric-bar-value">{metrics.growth}%</div>
                       </div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         </Card>
         
         <Card
           title="AI-Generated Insights"
           subtitle="Intelligent analysis of your customer segments"
           icon={<Sparkles size={20} />}
           className="analytics-card full-width"
         >
           <div className="insights-list">
             {Object.entries(gptSummaries).map(([segmentId, summary], index) => (
               <div key={segmentId} className="insight-item">
                 <div className="insight-icon">
                   <div className={`segment-dot segment-${segmentId}`}></div>
                 </div>
                 <div className="insight-content">
                   <div className="insight-title">Segment {segmentId} Analysis</div>
                   <div className="insight-text">{summary}</div>
                 </div>
                 <div className="insight-actions">
                   <button className="btn-text">View Details</button>
                 </div>
               </div>
             ))}
             
             {Object.keys(gptSummaries).length === 0 && (
               <div className="empty-insights">
                 <Sparkles size={24} />
                 <p>Generate AI insights for your segments to see detailed analysis and recommendations</p>
                 <button className="btn-primary">
                   <Brain size={16} />
                   Generate Insights
                 </button>
               </div>
             )}
           </div>
         </Card>
       </div>
     </div>
   );
 };

 if (isLoading) {
   return (
     <div className="dashboard-loading">
       <div className="loading-spinner">
         <RefreshCw size={24} className="spinning" />
       </div>
       <p>Loading dashboard...</p>
     </div>
   );
 }

 return (
   <div className="dashboard-page">
     {/* Page Header */}
     <div className="page-header">
       <div className="header-content">
         <div className="page-title">
           <h1>
             {activeView === 'overview' && 'Dashboard'}
             {activeView === 'segments' && 'Segments'}
             {activeView === 'analytics' && 'Analytics'}
             {activeView === 'data' && 'Data View'}
           </h1>
           <p>
             {activeView === 'overview' && 'Real-time customer intelligence and segmentation analytics'}
             {activeView === 'segments' && 'Manage and analyze customer segments'}
             {activeView === 'analytics' && 'Advanced analytics and performance insights'}
             {activeView === 'data' && 'Raw customer data and segment assignments'}
           </p>
         </div>
         
         <div className="header-actions">
           <button className="btn-secondary">
             <Calendar size={16} />
             Export Report
           </button>
           <button className="btn-primary">
             <Settings size={16} />
             Configure
           </button>
         </div>
       </div>
       
       {/* Quick Stats Bar */}
       {renderQuickStats()}
     </div>

     {/* Main Content */}
     <div className="dashboard-content">
       {summary && (
         <Card
           className="summary-banner"
           icon={<Brain size={20} />}
           title="Analysis Summary"
           actions={
             <div className="banner-status">
               <CheckCircle size={16} />
               <span>Complete</span>
             </div>
           }
         >
           <p>{summary}</p>
         </Card>
       )}

       {/* Navigation Tabs */}
       {renderNavigationTabs()}

       {/* Tab Content */}
       <div className="tab-content">
         {activeView === 'overview' && (
           <div className="overview-content">
             <div className="section-header">
               <h2>Customer Segments</h2>
               <p>AI-powered behavioral analysis and targeting recommendations</p>
             </div>
             {renderSegmentCards()}
           </div>
         )}

         {activeView === 'segments' && (
           <div className="segments-content">
             <div className="section-header">
               <h2>Segment Management</h2>
               <p>Detailed view of all customer segments and their characteristics</p>
             </div>
             {renderSegmentCards()}
           </div>
         )}

         {activeView === 'analytics' && renderAnalyticsContent()}

         {activeView === 'data' && (
           <div className="data-content">
             {renderDataTable()}
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default Dashboard;