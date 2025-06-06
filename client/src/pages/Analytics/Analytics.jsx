// pages/Analytics/Analytics.jsx
import React, { useState, useEffect } from 'react';
import './Analytics.scss';
import Card from '../../components/Card/Card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  Zap,
  Target,
  PieChart
} from 'lucide-react';
import { fetchSegmentHistory } from '../../services/segmentService';

// Mock chart component - we would replace this with a real chart implementation
const AreaChart = ({ data, color = '#635bff' }) => (
  <div className="area-chart" style={{ height: '200px', background: `linear-gradient(180deg, ${color}10 0%, transparent 100%)` }}>
    {/* Chart implementation would go here */}
    <div className="chart-placeholder"></div>
  </div>
);

const Analytics = () => {
  const [segmentHistory, setSegmentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchSegmentHistory();
        setSegmentHistory(result.history || []);
      } catch (error) {
        console.error('Failed to load segment history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate summary metrics
  const totalSegments = segmentHistory.length;
  const totalCustomers = segmentHistory.reduce((sum, item) => 
    sum + (item.fileMetadata?.totalRows || 0), 0);
  const avgSegmentSize = totalSegments > 0 ? Math.round(totalCustomers / totalSegments) : 0;
  const avgAccuracy = segmentHistory.length > 0 
    ? (segmentHistory.reduce((sum, item) => 
        sum + (item.qualityMetrics?.modelAccuracy || 0), 0) / segmentHistory.length).toFixed(1)
    : 0;
  
  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <h1>Analytics</h1>
            <p>Advanced insights and performance metrics across all customer segments</p>
          </div>
          
          <div className="header-actions">
            <div className="time-selector">
              <button className="btn-selector">
                <Calendar size={16} />
                <span>Last {timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '12 months'}</span>
                <ChevronDown size={14} />
              </button>
              <div className="time-dropdown">
                {['7d', '30d', '90d', '12m'].map(period => (
                  <button 
                    key={period} 
                    className={`time-option ${timeRange === period ? 'active' : ''}`}
                    onClick={() => setTimeRange(period)}
                  >
                    {period === '7d' ? 'Last 7 days' : 
                     period === '30d' ? 'Last 30 days' : 
                     period === '90d' ? 'Last 90 days' : 'Last 12 months'}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="btn-secondary">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-value">{totalSegments}</div>
            <div className="stat-label">Total Segments</div>
            <div className="stat-change positive">+{Math.round(totalSegments * 0.1)}</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{totalCustomers.toLocaleString()}</div>
            <div className="stat-label">Customers Analyzed</div>
            <div className="stat-change positive">+12.5%</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{avgSegmentSize}</div>
            <div className="stat-label">Avg Segment Size</div>
            <div className="stat-change neutral">Stable</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{avgAccuracy}%</div>
            <div className="stat-label">ML Accuracy</div>
            <div className="stat-change positive">+2.1%</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-content">
        {/* Tab Navigation */}
        <div className="content-tabs">
          {['overview', 'segments', 'customers', 'predictions'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && <BarChart3 size={16} />}
              {tab === 'segments' && <Target size={16} />}
              {tab === 'customers' && <Users size={16} />}
              {tab === 'predictions' && <TrendingUp size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Overview Content */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="chart-row">
              <Card 
                title="Segment Growth"
                subtitle="New segments created over time"
                icon={<Target size={20} />}
                variant="primary"
                className="chart-card"
              >
                <AreaChart color="#635bff" />
                <div className="chart-stats">
                  <div className="stat">
                    <div className="stat-value">+12</div>
                    <div className="stat-label">New Segments</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">32%</div>
                    <div className="stat-label">Growth Rate</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">8.2</div>
                    <div className="stat-label">Segments / Month</div>
                  </div>
                </div>
              </Card>
              
              <Card 
                title="Customer Acquisition"
                subtitle="Total customers analyzed"
                icon={<Users size={20} />}
                variant="accent"
                className="chart-card"
              >
                <AreaChart color="#5ce1e6" />
                <div className="chart-stats">
                  <div className="stat">
                    <div className="stat-value">+1.2k</div>
                    <div className="stat-label">New Customers</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">18%</div>
                    <div className="stat-label">Growth Rate</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">$4.8k</div>
                    <div className="stat-label">Avg. Value</div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="chart-row">
              <Card 
                title="Segmentation Performance"
                subtitle="Model accuracy and prediction quality"
                icon={<Zap size={20} />}
                className="chart-card half"
              >
                <div className="accuracy-gauge">
                  <div className="gauge-value">{avgAccuracy}%</div>
                  <div className="gauge-label">Average Accuracy</div>
                </div>
                <div className="performance-metrics">
                  <div className="metric">
                    <div className="metric-label">Silhouette Score</div>
                    <div className="metric-value">0.82</div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Cluster Separation</div>
                    <div className="metric-value">0.76</div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Feature Importance</div>
                    <div className="metric-value">0.91</div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card 
                title="Value Distribution"
                subtitle="Customer value by segment"
                icon={<DollarSign size={20} />}
                className="chart-card half"
              >
                <div className="segment-distribution">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="segment-bar">
                      <div className="bar-label">Segment {i}</div>
                      <div className="bar-container">
                        <div 
                          className={`bar-fill segment-${i}`} 
                          style={{ width: `${Math.round(40 + Math.random() * 50)}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">${Math.round((1 + Math.random() * 8)) * 1000}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            <div className="insights-section">
              <div className="section-header">
                <h2>AI-Generated Insights</h2>
                <p>Automated analysis and recommendations based on your customer segments</p>
              </div>
              
              <div className="insights-grid">
                {[...Array(3)].map((_, i) => (
                  <Card 
                    key={i}
                    variant={i === 0 ? 'primary' : ''}
                    className="insight-card"
                  >
                    <div className="insight-header">
                      <div className={`insight-icon priority-${['high', 'medium', 'low'][i]}`}>
                        {i === 0 ? <Zap size={20} /> : 
                         i === 1 ? <Target size={20} /> : 
                         <PieChart size={20} />}
                      </div>
                      <div className="insight-title">
                        {i === 0 ? 'High-Value Customer Opportunity' : 
                        i === 1 ? 'Segment Growth Potential' : 
                        'Customer Behavior Pattern'}
                     </div>
                     <div className="insight-date">Generated today</div>
                   </div>
                   <div className="insight-content">
                     {i === 0 ? 
                       'Segment 2 shows 28% higher average purchase value than other segments. Consider targeted premium product offerings to increase revenue.' : 
                      i === 1 ? 
                       'Segment 1 has grown by 32% in the last 30 days, indicating strong market resonance. Increase marketing allocation to maximize growth potential.' : 
                       'Customers in Segment 3 show strong preference for mobile purchases during evening hours (6-10pm). Optimize mobile experiences for this timeframe.'}
                   </div>
                   <div className="insight-actions">
                     <button className="btn-text">Dismiss</button>
                     <button className="btn-primary-sm">Apply Insight</button>
                   </div>
                 </Card>
               ))}
             </div>
           </div>
         </div>
       )}
       
       {/* Segments Content */}
       {activeTab === 'segments' && (
         <div className="segments-content">
           <div className="section-header">
             <h2>Segment Analysis</h2>
             <p>Detailed performance metrics for each customer segment</p>
           </div>
           
           <div className="segment-filters">
             <div className="filter-group">
               <div className="filter-label">Sort by:</div>
               <select className="filter-select">
                 <option>Size (Largest first)</option>
                 <option>Growth Rate</option>
                 <option>Value (Highest first)</option>
                 <option>Recent Activity</option>
               </select>
             </div>
             
             <div className="filter-group">
               <div className="filter-label">Metric:</div>
               <div className="metric-tabs">
                 <button className="metric-tab active">Growth</button>
                 <button className="metric-tab">Value</button>
                 <button className="metric-tab">Engagement</button>
                 <button className="metric-tab">Conversion</button>
               </div>
             </div>
             
             <button className="btn-secondary">
               <Filter size={16} />
               Advanced Filters
             </button>
           </div>
           
           <div className="segments-grid">
             {[...Array(5)].map((_, i) => (
               <Card
                 key={i}
                 className={`segment-analysis-card segment-${i}`}
               >
                 <div className="segment-header">
                   <div className="segment-dot"></div>
                   <div className="segment-name">Segment {i}</div>
                   <div className="segment-size">{Math.round((i + 1) * 100 + Math.random() * 200)} customers</div>
                 </div>
                 
                 <div className="segment-metric">
                   <div className="metric-chart">
                     {/* Chart would go here */}
                     <div 
                       className="growth-line"
                       style={{
                         '--growth-start': `${20 + Math.random() * 30}%`,
                         '--growth-end': `${50 + Math.random() * 40}%`
                       }}
                     ></div>
                   </div>
                   <div className="metric-value">
                     <div className="value">+{Math.round(10 + Math.random() * 25)}%</div>
                     <div className="label">30-day Growth</div>
                   </div>
                 </div>
                 
                 <div className="segment-stats">
                   <div className="stat">
                     <div className="stat-value">${Math.round((2 + i + Math.random() * 3)) * 1000}</div>
                     <div className="stat-label">Avg Value</div>
                   </div>
                   <div className="stat">
                     <div className="stat-value">{Math.round(60 + Math.random() * 30)}%</div>
                     <div className="stat-label">Engagement</div>
                   </div>
                   <div className="stat">
                     <div className="stat-value">{Math.round(20 + Math.random() * 15)}%</div>
                     <div className="stat-label">Conversion</div>
                   </div>
                 </div>
                 
                 <button className="btn-text-icon">
                   View Details
                   <ChevronDown size={16} />
                 </button>
               </Card>
             ))}
           </div>
         </div>
       )}
       
       {/* Customers Content */}
       {activeTab === 'customers' && (
         <div className="customers-content">
           <div className="section-header">
             <h2>Customer Analytics</h2>
             <p>Behavior patterns and metrics across your customer base</p>
           </div>
           
           <div className="kpi-cards">
             <Card 
               className="kpi-card"
               icon={<DollarSign size={20} />}
               variant="primary"
               compact
             >
               <div className="kpi-value">$4,285</div>
               <div className="kpi-label">Average Customer Value</div>
               <div className="kpi-change positive">+12.3% vs prev. period</div>
             </Card>
             
             <Card 
               className="kpi-card"
               icon={<Users size={20} />}
               variant="primary"
               compact
             >
               <div className="kpi-value">3.2</div>
               <div className="kpi-label">Avg. Purchase Frequency</div>
               <div className="kpi-change positive">+0.5 vs prev. period</div>
             </Card>
             
             <Card 
               className="kpi-card"
               icon={<TrendingUp size={20} />}
               variant="primary"
               compact
             >
               <div className="kpi-value">86%</div>
               <div className="kpi-label">Customer Retention Rate</div>
               <div className="kpi-change positive">+2.1% vs prev. period</div>
             </Card>
             
             <Card 
               className="kpi-card"
               icon={<Zap size={20} />}
               variant="primary"
               compact
             >
               <div className="kpi-value">68%</div>
               <div className="kpi-label">Customer Engagement Score</div>
               <div className="kpi-change positive">+5.3% vs prev. period</div>
             </Card>
           </div>
           
           <Card className="customer-trends-card">
             <div className="card-title">Customer Lifetime Value Progression</div>
             <div className="customer-chart">
               {/* Advanced chart would go here */}
               <div className="chart-placeholder" style={{ height: '300px' }}></div>
             </div>
             <div className="chart-legend">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`legend-item segment-${i}`}>
                   <div className="legend-dot"></div>
                   <div className="legend-label">Segment {i}</div>
                 </div>
               ))}
             </div>
           </Card>
           
           <div className="customer-insights">
             <Card className="patterns-card">
               <div className="card-title">Key Behavior Patterns</div>
               <div className="patterns-list">
                 {[
                   'High-value customers show 2.4x higher mobile app usage',
                   '72% of repeat purchases occur within 14 days of previous order',
                   'Evening shoppers (6-10pm) spend 32% more per transaction',
                   'Customers engaging with email campaigns have 45% higher retention',
                   'Social media referrals convert at 2.1x the rate of search traffic'
                 ].map((pattern, i) => (
                   <div key={i} className="pattern-item">
                     <div className="pattern-bullet">{i + 1}</div>
                     <div className="pattern-text">{pattern}</div>
                   </div>
                 ))}
               </div>
             </Card>
             
             <Card className="segments-radar-card">
               <div className="card-title">Segment Attribute Comparison</div>
               <div className="radar-chart-container">
                 {/* Radar chart would go here */}
                 <div className="chart-placeholder radar" style={{ height: '300px' }}></div>
               </div>
             </Card>
           </div>
         </div>
       )}
       
       {/* Predictions Content */}
       {activeTab === 'predictions' && (
         <div className="predictions-content">
           <div className="section-header">
             <h2>Predictive Analytics</h2>
             <p>AI-powered forecasts and trend predictions</p>
           </div>
           
           <div className="predictions-grid">
             <Card
               title="Customer Growth Forecast"
               subtitle="Projected growth over the next 90 days"
               icon={<TrendingUp size={20} />}
               className="prediction-card"
               footer={
                 <div className="prediction-accuracy">
                   <div className="accuracy-label">Model Confidence:</div>
                   <div className="accuracy-value">92%</div>
                 </div>
               }
             >
               <div className="prediction-chart">
                 {/* Forecast chart would go here */}
                 <div className="chart-placeholder" style={{ height: '220px' }}></div>
               </div>
               
               <div className="prediction-insight">
                 <Zap size={16} />
                 <span>Projected 22% growth in high-value segment over next quarter</span>
               </div>
             </Card>
             
             <Card
               title="Churn Risk Analysis"
               subtitle="Customers at risk of churn by segment"
               icon={<Users size={20} />}
               className="prediction-card"
               footer={
                 <div className="prediction-accuracy">
                   <div className="accuracy-label">Model Confidence:</div>
                   <div className="accuracy-value">88%</div>
                 </div>
               }
             >
               <div className="churn-segments">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="churn-segment">
                     <div className="segment-info">
                       <div className={`segment-marker segment-${i}`}></div>
                       <div className="segment-name">Segment {i}</div>
                     </div>
                     <div className="churn-bar-container">
                       <div 
                         className="churn-bar" 
                         style={{ width: `${Math.round(5 + Math.random() * 20)}%` }}
                       ></div>
                       <div className="churn-value">
                         {Math.round(5 + Math.random() * 20)}%
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="prediction-insight">
                 <Zap size={16} />
                 <span>Segment 2 shows highest risk. Recommended: implement retention campaign.</span>
               </div>
             </Card>
             
             <Card
               title="Revenue Forecast"
               subtitle="Projected revenue by segment"
               icon={<DollarSign size={20} />}
               className="prediction-card"
               footer={
                 <div className="prediction-accuracy">
                   <div className="accuracy-label">Model Confidence:</div>
                   <div className="accuracy-value">85%</div>
                 </div>
               }
             >
               <div className="prediction-chart">
                 {/* Revenue forecast chart would go here */}
                 <div className="chart-placeholder" style={{ height: '220px' }}></div>
               </div>
               
               <div className="prediction-insight">
                 <Zap size={16} />
                 <span>Highest growth potential: Segment 3 with projected 28% revenue increase</span>
               </div>
             </Card>
             
             <Card
               title="Segment Evolution"
               subtitle="How segments are projected to evolve"
               icon={<RefreshCw size={20} />}
               className="prediction-card"
               footer={
                 <div className="prediction-accuracy">
                   <div className="accuracy-label">Model Confidence:</div>
                   <div className="accuracy-value">81%</div>
                 </div>
               }
             >
               <div className="evolution-chart">
                 {/* Segment evolution chart would go here */}
                 <div className="chart-placeholder" style={{ height: '220px' }}></div>
               </div>
               
               <div className="prediction-insight">
                 <Zap size={16} />
                 <span>Segments 1 and 4 showing convergence. Consider merging for targeting efficiency.</span>
               </div>
             </Card>
           </div>
         </div>
       )}
     </div>
   </div>
 );
};

export default Analytics;