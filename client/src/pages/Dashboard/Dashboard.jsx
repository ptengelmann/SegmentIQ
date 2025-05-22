import React, { useEffect, useState } from 'react';
import './Dashboard.scss';
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
  Zap
} from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const Dashboard = () => {
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

  useEffect(() => {
    const raw = localStorage.getItem('segments');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setSegments(parsed.segments || []);
      setSummary(parsed.summary || '');
      setDetails(parsed.segment_details || {});
      setFeatures(parsed.features_used || []);
    } catch (err) {
      console.error('[Dashboard] Error parsing localStorage:', err);
    }
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
      if (!token) {
        alert('You must be logged in');
        return;
      }

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
      } else {
        setGptSummaries(prev => ({ ...prev, [segmentId]: 'No summary generated.' }));
      }
    } catch (err) {
      console.error('[Dashboard] GPT Summary Error:', err);
      setGptSummaries(prev => ({ ...prev, [segmentId]: 'Analysis temporarily unavailable.' }));
    } finally {
      setLoadingSeg(null);
    }
  };

  const exportSegment = (segmentId) => {
    const rows = segmentGroups[segmentId];
    if (!rows || rows.length === 0) {
      alert('No data to export for this segment');
      return;
    }

    try {
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `segment-${segmentId}-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('[Dashboard] Export error:', err);
      alert('Failed to export CSV');
    }
  };

  const getSegmentMetrics = (segmentId) => {
    const data = segmentGroups[segmentId];
    const detailKey = `Segment_${segmentId}`;
    const info = details[detailKey] || {};
    
    // Calculate some basic metrics
    const totalUsers = data?.length || 0;
    const percentage = info.percentage || 0;
    
    // Mock some advanced metrics for demo
    const avgValue = Math.round(Math.random() * 5000 + 1000);
    const growth = (Math.random() * 40 - 20).toFixed(1);
    const engagement = Math.round(Math.random() * 100);
    
    return {
      totalUsers,
      percentage,
      avgValue,
      growth: parseFloat(growth),
      engagement,
      ...info
    };
  };

  const renderOverviewStats = () => {
    const totalCustomers = segments.length;
    const totalSegments = Object.keys(segmentGroups).length;
    const avgSegmentSize = totalSegments > 0 ? Math.round(totalCustomers / totalSegments) : 0;
    
    return (
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalCustomers.toLocaleString()}</h3>
            <p>Total Customers</p>
            <span className="stat-trend positive">
              <ArrowUpRight size={16} />
              +12.5%
            </span>
          </div>
        </div>
        
        <div className="stat-card accent">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalSegments}</h3>
            <p>Active Segments</p>
            <span className="stat-trend positive">
              <ArrowUpRight size={16} />
              +2 new
            </span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{avgSegmentSize}</h3>
            <p>Avg Segment Size</p>
            <span className="stat-trend neutral">
              <Activity size={16} />
              Stable
            </span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <h3>94.2%</h3>
            <p>Model Accuracy</p>
            <span className="stat-trend positive">
              <ArrowUpRight size={16} />
              +2.1%
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSegmentCards = () => {
    const segmentIds = Object.keys(segmentGroups);
    
    if (segmentIds.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <PieChart size={48} />
          </div>
          <h3>No Segments Available</h3>
          <p>Upload customer data to generate intelligent segments</p>
          <button className="primary-btn">
            <Upload size={16} />
            Upload Data
          </button>
        </div>
      );
    }

    return (
      <div className="segments-grid">
        {segmentIds.map((segmentId) => {
          const metrics = getSegmentMetrics(segmentId);
          const isActive = selectedSegment === segmentId;
          
          return (
            <div 
              className={`segment-card ${isActive ? 'active' : ''}`} 
              key={segmentId}
              onClick={() => setSelectedSegment(selectedSegment === segmentId ? null : segmentId)}
            >
              <div className="segment-header">
                <div className="segment-title">
                  <div className={`segment-indicator segment-${segmentId}`}></div>
                  <h3>Segment {segmentId}</h3>
                </div>
                <div className="segment-actions">
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
                      <RefreshCw size={16} className="spinning" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </button>
                  <button 
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSegment(segmentId);
                    }}
                    title="Export Segment"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="segment-metrics">
                <div className="metric">
                  <Users size={16} />
                  <span>{metrics.totalUsers.toLocaleString()} users</span>
                </div>
                <div className="metric">
                  <BarChart3 size={16} />
                  <span>{metrics.percentage}% of total</span>
                </div>
                <div className="metric">
                  <DollarSign size={16} />
                  <span>${metrics.avgValue.toLocaleString()} avg value</span>
                </div>
                <div className="metric">
                  <Activity size={16} />
                  <span>{metrics.engagement}% engagement</span>
                </div>
              </div>

              <div className="segment-growth">
                <span className={`growth-indicator ${metrics.growth >= 0 ? 'positive' : 'negative'}`}>
                  {metrics.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(metrics.growth)}% growth
                </span>
              </div>

              {gptSummaries[segmentId] && (
                <div className="ai-insight">
                  <div className="insight-header">
                    <Sparkles size={14} />
                    <span>AI Insights</span>
                  </div>
                  <p>{gptSummaries[segmentId]}</p>
                </div>
              )}

              {isActive && (
                <div className="segment-details">
                  <div className="details-header">
                    <h4>Segment Analysis</h4>
                  </div>
                  <div className="details-content">
                    {Object.entries(metrics).map(([key, val]) =>
                      key.startsWith('avg_') ? (
                        <div key={key} className="detail-item">
                          <span className="detail-label">{key.replace('avg_', '').replace('_', ' ')}</span>
                          <span className="detail-value">{val}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
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
      <div className="data-section">
        <div className="data-header">
          <div className="data-title">
            <BarChart3 size={20} />
            <h3>Customer Data Analysis</h3>
          </div>
          
          <div className="data-controls">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Segments</option>
                {Object.keys(segmentGroups).map(id => (
                  <option key={id} value={id}>Segment {id}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {segments[0] && Object.keys(segments[0]).map((col) => (
                  <th key={col}>
                    <div className="th-content">
                      {col.replace('_', ' ').toUpperCase()}
                      <Filter size={12} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSegments.slice(0, 50).map((row, i) => (
                <tr key={i} className={`segment-row-${row.segment}`}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>
                      {j === Object.values(row).length - 1 ? (
                        <span className={`segment-badge segment-${val}`}>
                          Segment {val}
                        </span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSegments.length > 50 && (
            <div className="table-footer">
              <p>Showing 50 of {filteredSegments.length} customers</p>
              <button className="load-more-btn">Load More</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <PieChart size={32} />
            <div>
              <h1>Customer Intelligence Dashboard</h1>
              <p>Advanced segmentation and behavioral analytics</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="secondary-btn">
              <Calendar size={16} />
              Export Report
            </button>
            <button className="primary-btn">
              <Settings size={16} />
              Configure
            </button>
          </div>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <Eye size={16} />
            Overview
          </button>
          <button 
            className={`nav-tab ${activeView === 'segments' ? 'active' : ''}`}
            onClick={() => setActiveView('segments')}
          >
            <Target size={16} />
            Segments
          </button>
          <button 
            className={`nav-tab ${activeView === 'data' ? 'active' : ''}`}
            onClick={() => setActiveView('data')}
          >
            <BarChart3 size={16} />
            Data
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {summary && (
          <div className="insights-banner">
            <div className="banner-icon">
              <Sparkles size={20} />
            </div>
            <div className="banner-content">
              <h3>Analysis Summary</h3>
              <p>{summary}</p>
            </div>
          </div>
        )}

        {activeView === 'overview' && (
          <div className="overview-section">
            {renderOverviewStats()}
            <div className="quick-segments">
              <h3>Segment Performance</h3>
              {renderSegmentCards()}
            </div>
          </div>
        )}

        {activeView === 'segments' && (
          <div className="segments-section">
            {renderSegmentCards()}
          </div>
        )}

        {activeView === 'data' && renderDataTable()}
      </div>
    </div>
  );
};

export default Dashboard;