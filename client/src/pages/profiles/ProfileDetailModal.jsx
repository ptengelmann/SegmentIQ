// pages/profiles/ProfileDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Trash2, 
  Save, 
  Layers,
  Clock,
  MapPin,
  Phone,
  Building,
  Tag
} from 'lucide-react';
import styles from './profileDetail.module.scss';
import axios from 'axios';

const ProfileDetailModal = ({ profile, isOpen, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);

  // Initialize edited data when profile changes
  useEffect(() => {
    if (profile) {
      setEditedData({ ...profile.data });
    }
  }, [profile]);

  // Fetch segments that this profile belongs to
  useEffect(() => {
    const fetchSegments = async () => {
      if (profile?.segmentIds?.length > 0) {
        try {
          // You might want to add a batch endpoint later
          const segmentPromises = profile.segmentIds.map(id => 
            axios.get(`/api/segments/${id}`)
          );
          const segmentResponses = await Promise.all(segmentPromises);
          setSegments(segmentResponses.map(res => res.data));
        } catch (error) {
          console.error('Failed to fetch segments:', error);
        }
      }
    };

    fetchSegments();
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // You'll need to add an update endpoint to your backend
      await axios.put(`/api/profiles/${profile._id}`, {
        data: editedData
      });
      
      onUpdate({ ...profile, data: editedData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/profiles/${profile._id}`);
        onDelete(profile._id);
        onClose();
      } catch (error) {
        console.error('Failed to delete profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !profile) return null;

  // Get common fields with icons
  const getFieldIcon = (fieldName) => {
    const iconMap = {
      email: Mail,
      name: User,
      phone: Phone,
      address: MapPin,
      city: MapPin,
      company: Building,
      age: Calendar,
      location: MapPin
    };
    
    return iconMap[fieldName.toLowerCase()] || Tag;
  };

  // Organize fields into categories
  const personalFields = ['name', 'email', 'phone', 'age'];
  const locationFields = ['address', 'city', 'location', 'country', 'state'];
  const workFields = ['company', 'position', 'department', 'salary'];
  
  const otherFields = Object.keys(profile.data).filter(field => 
    ![...personalFields, ...locationFields, ...workFields].includes(field)
  );

  const renderFieldSection = (title, fields, icon) => {
    const hasFields = fields.some(field => profile.data[field]);
    if (!hasFields) return null;

    return (
      <div className={styles.fieldSection}>
        <div className={styles.sectionHeader}>
          {React.createElement(icon, { size: 16 })}
          <h4>{title}</h4>
        </div>
        <div className={styles.fieldGrid}>
          {fields.map(field => {
            if (!profile.data[field] && !isEditing) return null;
            
            const FieldIcon = getFieldIcon(field);
            
            return (
              <div key={field} className={styles.fieldItem}>
                <div className={styles.fieldLabel}>
                  <FieldIcon size={14} />
                  <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                </div>
                <div className={styles.fieldValue}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={styles.editInput}
                      placeholder={`Enter ${field}`}
                    />
                  ) : (
                    <span>{profile.data[field] || 'Not provided'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.profileHeaderInfo}>
            <div className={styles.profileAvatar}>
              {(profile.data.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileTitleInfo}>
              <h2 className={styles.profileName}>
                {profile.data.name || 'Unknown User'}
              </h2>
              <p className={styles.profileEmail}>
                {profile.data.email || 'No email provided'}
              </p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            {!isEditing ? (
              <>
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setEditedData({ ...profile.data });
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
            
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          {/* Profile Metadata */}
          <div className={styles.metadataSection}>
            <div className={styles.metadataItem}>
              <Calendar size={14} />
              <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.metadataItem}>
              <Clock size={14} />
              <span>Last Activity: {new Date(profile.lastActivity).toLocaleDateString()}</span>
            </div>
            <div className={styles.metadataItem}>
              <Layers size={14} />
              <span>Segments: {segments.length}</span>
            </div>
          </div>

          {/* Segments */}
          {segments.length > 0 && (
            <div className={styles.segmentsSection}>
              <h4 className={styles.sectionTitle}>
                <Layers size={16} />
                Segments
              </h4>
              <div className={styles.segmentsList}>
                {segments.map((segment, index) => (
                  <div key={segment._id || index} className={styles.segmentBadge}>
                    <span>{segment.name || `Segment ${index + 1}`}</span>
                    <span className={styles.segmentCount}>
                      {segment.previewCount || 0} profiles
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Sections */}
          <div className={styles.fieldsContainer}>
            {renderFieldSection('Personal Information', personalFields, User)}
            {renderFieldSection('Location', locationFields, MapPin)}
            {renderFieldSection('Work Information', workFields, Building)}
            
            {/* Other fields */}
            {otherFields.length > 0 && (
              <div className={styles.fieldSection}>
                <div className={styles.sectionHeader}>
                  <Tag size={16} />
                  <h4>Additional Information</h4>
                </div>
                <div className={styles.fieldGrid}>
                  {otherFields.map(field => {
                    if (!profile.data[field] && !isEditing) return null;
                    
                    return (
                      <div key={field} className={styles.fieldItem}>
                        <div className={styles.fieldLabel}>
                          <Tag size={14} />
                          <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                        </div>
                        <div className={styles.fieldValue}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedData[field] || ''}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                              className={styles.editInput}
                              placeholder={`Enter ${field}`}
                            />
                          ) : (
                            <span>{profile.data[field]}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailModal;