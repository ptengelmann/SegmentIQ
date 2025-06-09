// pages/segments/SegmentsList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Search, Filter, Plus, Eye, Edit, Trash2, MoreVertical,
  Calendar, Users, TrendingUp, ArrowUpRight, Download, RefreshCw,
  ChevronLeft, ChevronRight, Star, Copy, Archive, Settings,
  AlertTriangle, CheckCircle, Clock, Target, BarChart3, Grid, List
} from 'lucide-react';
import axios from 'axios';
import styles from './SegmentsList.module.scss';

const SegmentsList = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSegments, setSelectedSegments] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const COLORS = useMemo(() => [
    '#7b61ff', '#06d6a0', '#4cc9f0', '#f72585', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'
  ], []);

  // Fetch segments
  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortDir,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      };
      
      const response = await axios.get('/api/segments', { params });
      setSegments(response.data.segments || []);
      setPagination(response.data.pagination || pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch segments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortDir, searchTerm, filterStatus]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSegments();
    setRefreshing(false);
  }, [fetchSegments]);

  // Search handler
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Sort handler
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [sortBy]);

  // Selection handlers
  const handleSelectSegment = useCallback((segmentId) => {
    setSelectedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedSegments.size === segments.length) {
      setSelectedSegments(new Set());
    } else {
      setSelectedSegments(new Set(segments.map(s => s._id)));
    }
  }, [segments, selectedSegments.size]);

  // Navigation handlers
  const handleCreateSegment = useCallback(() => {
    navigate('/segments/create');
  }, [navigate]);

  const handleViewSegment = useCallback((segment) => {
    navigate(`/segments/${segment._id}`);
  }, [navigate]);

  const handleEditSegment = useCallback((segment) => {
    navigate(`/segments/create?edit=${segment._id}`);
  }, [navigate]);

  // Delete handlers
  const handleDeleteSegment = useCallback(async (segmentId) => {
    try {
      await axios.delete(`/api/segments/${segmentId}`);
      await fetchSegments();
      setShowDeleteModal(false);
      setSegmentToDelete(null);
    } catch (err) {
      setError('Failed to delete segment');
    }
  }, [fetchSegments]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        Array.from(selectedSegments).map(id => 
          axios.delete(`/api/segments/${id}`)
        )
      );
      setSelectedSegments(new Set());
      await fetchSegments();
    } catch (err) {
      setError('Failed to delete segments');
    }
  }, [selectedSegments, fetchSegments]);

  // Duplicate handler
  const handleDuplicateSegment = useCallback(async (segment) => {
    try {
      const duplicateData = {
        name: `${segment.name} (Copy)`,
        filters: segment.filters
      };
      await axios.post('/api/segments', duplicateData);
      await fetchSegments();
    } catch (err) {
      setError('Failed to duplicate segment');
    }
  }, [fetchSegments]);

  // Export handler
  const handleExportSegments = useCallback(() => {
    const exportData = selectedSegments.size > 0 
      ? segments.filter(s => selectedSegments.has(s._id))
      : segments;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segments-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [segments, selectedSegments]);

  // Filter segments based on search and status
  const filteredSegments = useMemo(() => {
    return segments.filter(segment => {
      const matchesSearch = !searchTerm || 
        segment.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && segment.isActive) ||
        (filterStatus === 'inactive' && !segment.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [segments, searchTerm, filterStatus]);

  // Get segment statistics
  const segmentStats = useMemo(() => {
    const total = segments.length;
    const active = segments.filter(s => s.isActive).length;
    const totalProfiles = segments.reduce((sum, s) => sum + (s.previewCount || 0), 0);
    const avgSize = total > 0 ? Math.round(totalProfiles / total) : 0;
    
    return { total, active, totalProfiles, avgSize };
  }, [segments]);

  if (loading && segments.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading segments...</p>
      </div>
    );
  }

  return (
    <div className={styles.segmentsContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <Layers size={28} />
            Segments
          </h1>
          <p className={styles.pageSubtitle}>
            Manage and analyze your customer segments
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
          
          <button className={styles.exportButton} onClick={handleExportSegments}>
            <Download size={16} />
            Export
          </button>
          
          <button className={styles.createButton} onClick={handleCreateSegment}>
            <Plus size={16} />
            Create Segment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Layers size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{segmentStats.total}</div>
            <div className={styles.statLabel}>Total Segments</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{segmentStats.active}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{segmentStats.totalProfiles.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Profiles</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Target size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{segmentStats.avgSize.toLocaleString()}</div>
            <div className={styles.statLabel}>Avg. Size</div>
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
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterControls}>
            <button 
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.statusFilter}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select 
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDir(direction);
              }}
              className={styles.sortSelect}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="previewCount-desc">Largest First</option>
              <option value="previewCount-asc">Smallest First</option>
            </select>
          </div>
        </div>
        
        <div className={styles.viewControls}>
          {selectedSegments.size > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                {selectedSegments.size} selected
              </span>
              <button 
                className={styles.bulkButton}
                onClick={handleBulkDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
          
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button 
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterSection}>
            <h4>Advanced Filters</h4>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>Profile Count</label>
                <div className={styles.rangeInputs}>
                  <input type="number" placeholder="Min" className={styles.rangeInput} />
                  <span>to</span>
                  <input type="number" placeholder="Max" className={styles.rangeInput} />
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Created Date</label>
                <div className={styles.dateInputs}>
                  <input type="date" className={styles.dateInput} />
                  <span>to</span>
                  <input type="date" className={styles.dateInput} />
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Performance</label>
                <select className={styles.performanceFilter}>
                  <option value="">Any Performance</option>
                  <option value="high">High Performing</option>
                  <option value="medium">Medium Performing</option>
                  <option value="low">Low Performing</option>
                </select>
              </div>
            </div>
            
            <div className={styles.filterActions}>
              <button className={styles.applyFilters}>Apply Filters</button>
              <button className={styles.clearFilters}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorAlert}>
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Segments Grid/List */}
      {viewMode === 'grid' ? (
        <div className={styles.segmentsGrid}>
          {filteredSegments.map((segment, index) => (
            <SegmentCard
              key={segment._id}
              segment={segment}
              color={COLORS[index % COLORS.length]}
              isSelected={selectedSegments.has(segment._id)}
              onSelect={() => handleSelectSegment(segment._id)}
              onView={() => handleViewSegment(segment)}
              onEdit={() => handleEditSegment(segment)}
              onDelete={() => {
                setSegmentToDelete(segment);
                setShowDeleteModal(true);
              }}
              onDuplicate={() => handleDuplicateSegment(segment)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.segmentsList}>
          <div className={styles.listHeader}>
            <div className={styles.listHeaderCell}>
              <input
                type="checkbox"
                checked={selectedSegments.size === filteredSegments.length && filteredSegments.length > 0}
                onChange={handleSelectAll}
                className={styles.checkbox}
              />
            </div>
            <div 
              className={`${styles.listHeaderCell} ${styles.sortable}`}
              onClick={() => handleSort('name')}
            >
              Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              className={`${styles.listHeaderCell} ${styles.sortable}`}
              onClick={() => handleSort('previewCount')}
            >
              Profiles {sortBy === 'previewCount' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.listHeaderCell}>Status</div>
            <div 
              className={`${styles.listHeaderCell} ${styles.sortable}`}
              onClick={() => handleSort('createdAt')}
            >
              Created {sortBy === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.listHeaderCell}>Actions</div>
          </div>
          
          {filteredSegments.map((segment, index) => (
            <SegmentListItem
              key={segment._id}
              segment={segment}
              color={COLORS[index % COLORS.length]}
              isSelected={selectedSegments.has(segment._id)}
              onSelect={() => handleSelectSegment(segment._id)}
              onView={() => handleViewSegment(segment)}
              onEdit={() => handleEditSegment(segment)}
              onDelete={() => {
                setSegmentToDelete(segment);
                setShowDeleteModal(true);
              }}
              onDuplicate={() => handleDuplicateSegment(segment)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredSegments.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Layers size={64} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>
            {searchTerm || filterStatus !== 'all' ? 'No segments found' : 'No segments yet'}
          </h3>
          <p className={styles.emptyText}>
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first segment to start organizing your customer data'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button className={styles.emptyAction} onClick={handleCreateSegment}>
              <Plus size={16} />
              Create Your First Segment
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} segments
          </div>
          
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageButton}
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`${styles.pageButton} ${pagination.page === page ? styles.active : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                >
                  {page}
                </button>
              );
            })}
            
            <button 
              className={styles.pageButton}
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && segmentToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} className={styles.warningIcon} />
              <h3>Delete Segment</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete "{segmentToDelete.name}"?</p>
              <p className={styles.warningText}>
                This will permanently remove the segment and cannot be undone.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSegmentToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteSegment(segmentToDelete._id)}
              >
                Delete Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Segment Card Component
const SegmentCard = ({ segment, color, isSelected, onSelect, onView, onEdit, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`${styles.segmentCard} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardSelect}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className={styles.checkbox}
          />
        </div>
        <div className={styles.cardMenu}>
          <button 
            className={styles.menuButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className={styles.menuDropdown}>
              <button onClick={onView} className={styles.menuItem}>
                <Eye size={14} />
                View Details
              </button>
              <button onClick={onEdit} className={styles.menuItem}>
                <Edit size={14} />
                Edit
              </button>
              <button onClick={onDuplicate} className={styles.menuItem}>
                <Copy size={14} />
                Duplicate
              </button>
              <button onClick={onDelete} className={`${styles.menuItem} ${styles.danger}`}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.cardBody} onClick={onView}>
        <div className={styles.segmentIcon} style={{ backgroundColor: color }}>
          <Layers size={20} />
        </div>
        
        <h3 className={styles.segmentName}>{segment.name}</h3>
        
        <div className={styles.segmentStats}>
          <div className={styles.statItem}>
            <Users size={14} />
            <span>{(segment.previewCount || 0).toLocaleString()} profiles</span>
          </div>
          <div className={styles.statItem}>
            <Filter size={14} />
            <span>{segment.filters?.length || 0} filters</span>
          </div>
        </div>
        
        <div className={styles.segmentMeta}>
          <div className={styles.statusBadge}>
            <div className={`${styles.statusDot} ${segment.isActive ? styles.active : styles.inactive}`}></div>
            <span>{segment.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className={styles.createdDate}>
            <Clock size={12} />
            <span>{new Date(segment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <button className={styles.viewButton} onClick={onView}>
          <Eye size={14} />
          View
        </button>
        <button className={styles.editButton} onClick={onEdit}>
          <Edit size={14} />
          Edit
        </button>
      </div>
    </div>
  );
};

// Segment List Item Component
const SegmentListItem = ({ segment, color, isSelected, onSelect, onView, onEdit, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.listCell}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className={styles.checkbox}
        />
      </div>
      
      <div className={styles.listCell} onClick={onView}>
        <div className={styles.segmentInfo}>
          <div className={styles.segmentIcon} style={{ backgroundColor: color }}>
            <Layers size={16} />
          </div>
          <div className={styles.segmentDetails}>
            <span className={styles.segmentName}>{segment.name}</span>
            <span className={styles.segmentFilters}>{segment.filters?.length || 0} filters</span>
          </div>
        </div>
      </div>
      
      <div className={styles.listCell}>
        <div className={styles.profileCount}>
          {(segment.previewCount || 0).toLocaleString()}
        </div>
      </div>
      
      <div className={styles.listCell}>
        <div className={styles.statusBadge}>
          <div className={`${styles.statusDot} ${segment.isActive ? styles.active : styles.inactive}`}></div>
          <span>{segment.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      
      <div className={styles.listCell}>
        <div className={styles.dateInfo}>
          <Clock size={12} />
          <span>{new Date(segment.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className={styles.listCell}>
        <div className={styles.listActions}>
          <button className={styles.actionButton} onClick={onView}>
            <Eye size={14} />
          </button>
          <button className={styles.actionButton} onClick={onEdit}>
            <Edit size={14} />
          </button>
          <div className={styles.actionMenu}>
            <button 
              className={styles.menuButton}
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <div className={styles.menuDropdown}>
                <button onClick={onDuplicate} className={styles.menuItem}>
                  <Copy size={12} />
                  Duplicate
                </button>
                <button onClick={onDelete} className={`${styles.menuItem} ${styles.danger}`}>
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentsList;