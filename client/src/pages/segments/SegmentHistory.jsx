// pages/segments/SegmentHistory.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  History, Clock, User, Eye, RotateCcw, GitBranch, FileText,
  Calendar, Filter, Search, RefreshCw, Download, ArrowRight,
  ChevronDown, ChevronRight, Edit, Trash2, Plus, Minus,
  AlertTriangle, CheckCircle, Info, Activity, TrendingUp,
  Database, Layers, Target, Users, Settings, Code, Diff
} from 'lucide-react';
import axios from 'axios';
import styles from './SegmentHistory.module.scss';

const SegmentHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const segmentId = searchParams.get('segmentId');
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Mock history data - replace with real API calls
  const generateMockHistory = useCallback(() => {
    const actions = ['created', 'updated', 'filter_added', 'filter_removed', 'filter_modified', 'renamed', 'activated', 'deactivated'];
    const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Chen'];
    
    const mockData = [];
    const now = new Date();
    
    for (let i = 0; i < 25; i++) {
      const date = new Date(now.getTime() - (i * 2 * 24 * 60 * 60 * 1000)); // Every 2 days
      const action = actions[Math.floor(Math.random() * actions.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      let changes = {};
      let details = '';
      
      switch (action) {
        case 'created':
          details = 'Initial segment creation';
          changes = {
            name: 'High-Value Customers',
            filters: [
              { field: 'revenue', operator: '>', value: 1000 }
            ]
          };
          break;
        case 'updated':
          details = 'Segment configuration updated';
          changes = {
            filters: [
              { field: 'revenue', operator: '>', value: 1500 },
              { field: 'region', operator: '=', value: 'North America' }
            ]
          };
          break;
        case 'filter_added':
          details = 'Added new filter criteria';
          changes = {
            added: { field: 'engagement_score', operator: '>', value: 75 }
          };
          break;
        case 'filter_removed':
          details = 'Removed filter criteria';
          changes = {
            removed: { field: 'last_purchase', operator: '<', value: '30 days' }
          };
          break;
        case 'filter_modified':
          details = 'Modified existing filter';
          changes = {
            modified: {
              field: 'revenue',
              from: { operator: '>', value: 1000 },
              to: { operator: '>', value: 1200 }
            }
          };
          break;
        case 'renamed':
          details = 'Segment name changed';
          changes = {
            name: {
              from: 'High Value Customers',
              to: 'Premium Customers'
            }
          };
          break;
        case 'activated':
          details = 'Segment activated';
          changes = { status: { from: 'inactive', to: 'active' } };
          break;
        case 'deactivated':
          details = 'Segment deactivated';
          changes = { status: { from: 'active', to: 'inactive' } };
          break;
        default:
          details = 'Segment modified';
      }
      
      mockData.push({
        id: `version_${i + 1}`,
        version: `v1.${i}`,
        action,
        timestamp: date,
        user: user,
        details,
        changes,
        profileCount: 1000 + Math.floor(Math.random() * 500),
        size: Math.floor(Math.random() * 1000) + 500 // KB
      });
    }
    
    return mockData.reverse(); // Most recent first
  }, []);

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // If segmentId is provided, fetch specific segment history
        if (segmentId) {
          // const response = await axios.get(`/api/segments/${segmentId}/history`);
          // setHistory(response.data.history || []);
          
          // For now, use mock data
          const mockHistory = generateMockHistory();
          setHistory(mockHistory);
        } else {
          // Fetch global segment history
          // const response = await axios.get('/api/segments/history');
          // setHistory(response.data.history || []);
          
          // For now, use mock data
          const mockHistory = generateMockHistory();
          setHistory(mockHistory);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch segment history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [segmentId, generateMockHistory]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      const mockHistory = generateMockHistory();
      setHistory(mockHistory);
      setRefreshing(false);
    }, 1000);
  }, [generateMockHistory]);

  // Filter history based on search and filters
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = !searchTerm || 
        item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || item.action === filterType;
      
      const matchesDate = dateRange === 'all' || (() => {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        const daysAgo = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
        
        switch (dateRange) {
          case 'today': return daysAgo === 0;
          case 'week': return daysAgo <= 7;
          case 'month': return daysAgo <= 30;
          case 'quarter': return daysAgo <= 90;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesType && matchesDate;
    });
  }, [history, searchTerm, filterType, dateRange]);

  // Version comparison
  const handleCompareVersions = useCallback((version1, version2) => {
    setCompareVersions([version1, version2]);
    setComparisonMode(true);
  }, []);

  // Revert to version
  const handleRevertToVersion = useCallback(async (version) => {
    if (window.confirm(`Are you sure you want to revert to ${version.version}? This will create a new version with the previous configuration.`)) {
      try {
        // await axios.post(`/api/segments/${segmentId}/revert`, { versionId: version.id });
        console.log('Reverting to version:', version);
        // Refresh history after revert
        handleRefresh();
      } catch (err) {
        setError('Failed to revert to version');
      }
    }
  }, [segmentId, handleRefresh]);

  // Export history
  const handleExportHistory = useCallback(() => {
    const exportData = {
      segmentId,
      exportDate: new Date().toISOString(),
      history: filteredHistory
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segment-history-${segmentId || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [segmentId, filteredHistory]);

  // Toggle expansion
  const toggleExpanded = useCallback((itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Get action icon
  const getActionIcon = useCallback((action) => {
    switch (action) {
      case 'created': return <Plus size={16} />;
      case 'updated': return <Edit size={16} />;
      case 'filter_added': return <Plus size={16} />;
      case 'filter_removed': return <Minus size={16} />;
      case 'filter_modified': return <Edit size={16} />;
      case 'renamed': return <FileText size={16} />;
      case 'activated': return <CheckCircle size={16} />;
      case 'deactivated': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  }, []);

  // Get action color
  const getActionColor = useCallback((action) => {
    switch (action) {
      case 'created': return '#06d6a0';
      case 'updated': return '#7b61ff';
      case 'filter_added': return '#06d6a0';
      case 'filter_removed': return '#ff5a5a';
      case 'filter_modified': return '#ffaa5a';
      case 'renamed': return '#4cc9f0';
      case 'activated': return '#1ce8b5';
      case 'deactivated': return '#ff5a5a';
      default: return '#7b61ff';
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading segment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertTriangle size={48} />
        <h2>History Unavailable</h2>
        <p>{error}</p>
        <button onClick={handleRefresh} className={styles.retryButton}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      {/* Header */}
      <div className={styles.historyHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <History size={28} />
            Segment History
          </h1>
          <p className={styles.pageSubtitle}>
            {segmentId ? 'Track changes and version history for this segment' : 'View all segment changes across your organization'}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
            Refresh
          </button>
          
          <button className={styles.exportButton} onClick={handleExportHistory}>
            <Download size={16} />
            Export
          </button>
          
          {segmentId && (
            <button 
              className={styles.viewSegmentButton}
              onClick={() => navigate(`/segments/${segmentId}`)}
            >
              <Eye size={16} />
              View Segment
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <History size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{history.length}</div>
            <div className={styles.statLabel}>Total Changes</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {new Set(history.map(h => h.user)).size}
            </div>
            <div className={styles.statLabel}>Contributors</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Activity size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {history.filter(h => {
                const daysAgo = Math.floor((new Date() - new Date(h.timestamp)) / (1000 * 60 * 60 * 24));
                return daysAgo <= 7;
              }).length}
            </div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {history.length > 0 ? history[0].version : 'N/A'}
            </div>
            <div className={styles.statLabel}>Latest Version</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controlsSection}>
        <div className={styles.searchAndFilters}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterControls}>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.typeFilter}
            >
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="filter_added">Filter Added</option>
              <option value="filter_removed">Filter Removed</option>
              <option value="filter_modified">Filter Modified</option>
              <option value="renamed">Renamed</option>
              <option value="activated">Activated</option>
              <option value="deactivated">Deactivated</option>
            </select>
            
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.dateFilter}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
        
        <div className={styles.viewControls}>
          <button 
            className={`${styles.compareButton} ${comparisonMode ? styles.active : ''}`}
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <Diff size={16} />
            Compare Mode
          </button>
        </div>
      </div>

      {/* Comparison Mode Instructions */}
      {comparisonMode && (
        <div className={styles.comparisonBanner}>
          <Info size={16} />
          <span>Select two versions to compare their differences</span>
          {compareVersions.length === 2 && (
            <button 
              className={styles.viewComparisonButton}
              onClick={() => {/* Show comparison modal */}}
            >
              View Comparison
            </button>
          )}
        </div>
      )}

      {/* History Timeline */}
      <div className={styles.historyTimeline}>
        {filteredHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No History Found</h3>
            <p className={styles.emptyText}>
              {searchTerm || filterType !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No changes have been recorded yet'
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <HistoryItem
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === filteredHistory.length - 1}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpanded={() => toggleExpanded(item.id)}
              onRevert={() => handleRevertToVersion(item)}
              onCompare={(version) => {
                if (comparisonMode) {
                  if (compareVersions.length < 2 && !compareVersions.includes(version)) {
                    setCompareVersions(prev => [...prev, version]);
                  }
                }
              }}
              actionIcon={getActionIcon(item.action)}
              actionColor={getActionColor(item.action)}
              isComparison={comparisonMode}
              isSelected={compareVersions.includes(item)}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {filteredHistory.length >= 20 && (
        <div className={styles.loadMoreSection}>
          <button className={styles.loadMoreButton}>
            <RefreshCw size={16} />
            Load More History
          </button>
        </div>
      )}
    </div>
  );
};

// History Item Component
const HistoryItem = ({ 
  item, 
  isFirst, 
  isLast, 
  isExpanded, 
  onToggleExpanded, 
  onRevert, 
  onCompare,
  actionIcon,
  actionColor,
  isComparison,
  isSelected
}) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return null;

    return (
      <div className={styles.changesDetails}>
        {changes.name && (
          <div className={styles.changeItem}>
            <strong>Name:</strong>
            {typeof changes.name === 'object' ? (
              <span>
                <span className={styles.oldValue}>{changes.name.from}</span>
                <ArrowRight size={12} className={styles.changeArrow} />
                <span className={styles.newValue}>{changes.name.to}</span>
              </span>
            ) : (
              <span>{changes.name}</span>
            )}
          </div>
        )}
        
        {changes.status && (
          <div className={styles.changeItem}>
            <strong>Status:</strong>
            <span className={styles.oldValue}>{changes.status.from}</span>
            <ArrowRight size={12} className={styles.changeArrow} />
            <span className={styles.newValue}>{changes.status.to}</span>
          </div>
        )}
        
        {changes.filters && (
          <div className={styles.changeItem}>
            <strong>Filters:</strong>
            <div className={styles.filtersList}>
              {changes.filters.map((filter, idx) => (
                <div key={idx} className={styles.filterItem}>
                  {filter.field} {filter.operator} {filter.value}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {changes.added && (
          <div className={styles.changeItem}>
            <strong>Added Filter:</strong>
            <span className={styles.addedValue}>
              {changes.added.field} {changes.added.operator} {changes.added.value}
            </span>
          </div>
        )}
        
        {changes.removed && (
          <div className={styles.changeItem}>
            <strong>Removed Filter:</strong>
            <span className={styles.removedValue}>
              {changes.removed.field} {changes.removed.operator} {changes.removed.value}
            </span>
          </div>
        )}
        
        {changes.modified && (
          <div className={styles.changeItem}>
            <strong>Modified Filter ({changes.modified.field}):</strong>
            <div className={styles.modificationDetails}>
              <span className={styles.oldValue}>
                {changes.modified.from.operator} {changes.modified.from.value}
              </span>
              <ArrowRight size={12} className={styles.changeArrow} />
              <span className={styles.newValue}>
                {changes.modified.to.operator} {changes.modified.to.value}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.historyItem} ${isComparison && isSelected ? styles.selected : ''}`}>
      <div className={styles.timelineConnector}>
        {!isFirst && <div className={styles.timelineLine}></div>}
        <div 
          className={styles.timelineNode}
          style={{ backgroundColor: actionColor }}
        >
          {actionIcon}
        </div>
        {!isLast && <div className={styles.timelineLine}></div>}
      </div>
      
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.itemTitle}>
              <span className={styles.version}>{item.version}</span>
              <span className={styles.action}>{item.action.replace('_', ' ')}</span>
            </div>
            <div className={styles.itemMeta}>
              <span className={styles.user}>
                <User size={12} />
                {item.user}
              </span>
              <span className={styles.timestamp}>
                <Clock size={12} />
                {formatTimestamp(item.timestamp)}
              </span>
              <span className={styles.size}>
                <Database size={12} />
                {item.profileCount?.toLocaleString()} profiles
              </span>
            </div>
          </div>
          
          <div className={styles.headerRight}>
            {isComparison && (
              <button 
                className={`${styles.selectButton} ${isSelected ? styles.selected : ''}`}
                onClick={() => onCompare(item)}
              >
                {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />}
              </button>
            )}
            
            <button 
              className={styles.expandButton}
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
        
        <div className={styles.itemDescription}>
          {item.details}
        </div>
        
        {isExpanded && (
          <div className={styles.expandedContent}>
            {renderChanges(item.changes)}
            
            <div className={styles.itemActions}>
              <button className={styles.actionButton} onClick={onRevert}>
                <RotateCcw size={14} />
                Revert to this version
              </button>
              <button className={styles.actionButton}>
                <Eye size={14} />
                View details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentHistory;