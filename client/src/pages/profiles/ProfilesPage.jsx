// pages/profiles/ProfilesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import styles from './profiles.module.scss';
import axios from 'axios';
import ProfileDetailModal from './ProfileDetailModal';

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedProfiles, setSelectedProfiles] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortDir,
        ...(search && { search })
      };
      
      const response = await axios.get('/api/profiles', { params });
      setProfiles(response.data.profiles);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch profiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortDir, search]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [sortBy]);

  // Handle select profile
  const handleSelectProfile = useCallback((profileId) => {
    setSelectedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedProfiles.size === profiles.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(profiles.map(p => p._id)));
    }
  }, [profiles, selectedProfiles.size]);

  // Handle delete
  const handleDelete = async (profileId) => {
    try {
      await axios.delete(`/api/profiles/${profileId}`);
      await fetchProfiles();
      setShowDeleteModal(false);
      setProfileToDelete(null);
    } catch (err) {
      setError('Failed to delete profile');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedProfiles).map(id => 
          axios.delete(`/api/profiles/${id}`)
        )
      );
      setSelectedProfiles(new Set());
      await fetchProfiles();
    } catch (err) {
      setError('Failed to delete profiles');
    }
  };

  // Profile detail modal handlers
  const handleViewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProfile(null);
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfiles(prev => 
      prev.map(p => p._id === updatedProfile._id ? updatedProfile : p)
    );
  };

  const handleDeleteFromModal = (profileId) => {
    setProfiles(prev => prev.filter(p => p._id !== profileId));
  };

  return (
    <div className={styles.profilesContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.iconWrapper}>
              <Users size={24} />
              <div className={styles.iconGlow}></div>
            </div>
            <div>
              <h1 className={styles.pageTitle}>Profile Management</h1>
              <p className={styles.pageDescription}>
                Manage and analyze your user profiles
              </p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.refreshButton} onClick={fetchProfiles}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            
            {selectedProfiles.size > 0 && (
              <button 
                className={styles.bulkDeleteButton}
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                <span>Delete Selected ({selectedProfiles.size})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search profiles by name, email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        
        <div className={styles.filterActions}>
          <button className={styles.filterButton}>
            <Filter size={16} />
            <span>Filters</span>
          </button>
          
          <button className={styles.exportButton}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Total Profiles</h3>
            <Users size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{pagination.total.toLocaleString()}</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>
              <CheckCircle size={14} />
              Active profiles
            </span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Selected</h3>
            <CheckCircle size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{selectedProfiles.size}</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>
              {selectedProfiles.size > 0 ? 'Ready for action' : 'None selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {error && (
          <div className={styles.errorAlert}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <span>Loading profiles...</span>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.profilesTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedProfiles.size === profiles.length && profiles.length > 0}
                      onChange={handleSelectAll}
                      className={styles.checkbox}
                    />
                  </th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('data.name')}
                  >
                    Name
                    {sortBy === 'data.name' && (
                      <span className={styles.sortIndicator}>
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('data.email')}
                  >
                    Email
                    {sortBy === 'data.email' && (
                      <span className={styles.sortIndicator}>
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                    {sortBy === 'createdAt' && (
                      <span className={styles.sortIndicator}>
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Segments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr 
                    key={profile._id} 
                    className={`${styles.tableRow} ${selectedProfiles.has(profile._id) ? styles.selected : ''}`}
                  >
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={selectedProfiles.has(profile._id)}
                        onChange={() => handleSelectProfile(profile._id)}
                        className={styles.checkbox}
                      />
                    </td>
                    <td className={styles.nameCell}>
                      <div className={styles.profileInfo}>
                        <div className={styles.profileAvatar}>
                          {(profile.data.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.profileName}>
                          {profile.data.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.emailCell}>
                      {profile.data.email || 'No email'}
                    </td>
                    <td className={styles.dateCell}>
                      <div className={styles.dateInfo}>
                        <Calendar size={14} />
                        <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className={styles.segmentsCell}>
                      <div className={styles.segmentBadges}>
                        {profile.segmentIds?.length > 0 ? (
                          profile.segmentIds.map((segmentId, index) => (
                            <span key={index} className={styles.segmentBadge}>
                              Segment {index + 1}
                            </span>
                          ))
                        ) : (
                          <span className={styles.noSegments}>No segments</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.viewButton}
                          title="View Details"
                          onClick={() => handleViewProfile(profile)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className={styles.deleteButton}
                          title="Delete Profile"
                          onClick={() => {
                            setProfileToDelete(profile);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} profiles
            </div>
            <div className={styles.paginationControls}>
              <button 
                className={styles.pageButton}
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              
              {/* Page numbers */}
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
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && profileToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} className={styles.warningIcon} />
              <h3>Delete Profile</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete the profile for:</p>
              <div className={styles.profilePreview}>
                <strong>{profileToDelete.data.name || 'Unknown'}</strong>
                <span>{profileToDelete.data.email || 'No email'}</span>
              </div>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setProfileToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={() => handleDelete(profileToDelete._id)}
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        onUpdate={handleUpdateProfile}
        onDelete={handleDeleteFromModal}
      />
    </div>
  );
};

export default ProfilesPage;