// pages/segments/SegmentBuilder.jsx
import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Plus, 
  X, 
  ChevronDown, 
  Save, 
  Database, 
  AlertTriangle, 
  Eye,
  RefreshCw,
  CheckCircle,
  Info,
  Zap,
  Users,
  Target
} from 'lucide-react';
import styles from './segmentBuilder.module.scss';
import axios from 'axios';

const SegmentBuilder = () => {
  const [name, setName] = useState('');
  const [filters, setFilters] = useState([{ field: '', operator: '=', value: '' }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [activeFilterIndex, setActiveFilterIndex] = useState(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [hasPreview, setHasPreview] = useState(false);
  
  // Enhanced operators with descriptions
  const operators = [
    { value: '=', label: 'Equals (=)', description: 'Exact match' },
    { value: '>', label: 'Greater Than (>)', description: 'Numeric comparison' },
    { value: '<', label: 'Less Than (<)', description: 'Numeric comparison' },
    { value: 'contains', label: 'Contains', description: 'Text contains substring' },
    { value: 'starts_with', label: 'Starts With', description: 'Text begins with' },
    { value: 'ends_with', label: 'Ends With', description: 'Text ends with' }
  ];

  // Fetch available fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get('/api/profiles/fields');
        setAvailableFields(res.data || ['email', 'name', 'age', 'location', 'company']);
      } catch (err) {
        console.error("Failed to fetch fields", err);
        setAvailableFields(['email', 'name', 'age', 'location', 'company', 'phone']);
      }
    };
    
    fetchFields();
  }, []);

  // Simple validation function (no useCallback, no useEffect)
  const isFormValid = () => {
    if (!name.trim()) return false;
    
    return filters.every(filter => 
      filter.field && 
      filter.value?.toString().trim() &&
      (filter.operator !== '>' && filter.operator !== '<' || !isNaN(filter.value))
    );
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '' }]);
  };

  const removeFilter = (index) => {
    const updated = [...filters];
    updated.splice(index, 1);
    setFilters(updated);
    setHasPreview(false);
    setResults([]);
    setTotalMatches(0);
  };

  const updateFilter = (i, key, val) => {
    const updated = [...filters];
    updated[i][key] = val;
    setFilters(updated);
    
    // Reset preview when filters change
    setHasPreview(false);
    setResults([]);
    setTotalMatches(0);
  };

  const toggleFieldDropdown = (index) => {
    setActiveFilterIndex(index);
    setShowFieldDropdown(!showFieldDropdown || activeFilterIndex !== index);
  };

  const selectField = (field) => {
    if (activeFilterIndex !== null) {
      updateFilter(activeFilterIndex, 'field', field);
    }
    setShowFieldDropdown(false);
  };

  // Preview functionality
  const handlePreview = async () => {
    if (!isFormValid()) {
      setError("Please complete all required fields before previewing");
      return;
    }

    setPreviewLoading(true);
    setError(null);
    
    try {
      // For now, we'll use the create endpoint and just show results
      // Later we can add a dedicated preview endpoint
      const res = await axios.post('/api/segments/preview', { filters });
      setResults(res.data.matchedProfiles || []);
      setTotalMatches(res.data.totalMatches || 0);
      setHasPreview(true);
    } catch (err) {
      console.error(err);
      // If preview endpoint doesn't exist, show a message
      setError("Preview feature will be available soon. Click 'Create Segment' to see results.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Please complete all required fields before creating segment");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await axios.post('/api/segments', { name, filters });
      setResults(res.data.matchedProfiles || []);
      setTotalMatches(res.data.totalMatches || 0);
      setHasPreview(true);
      setSuccess(`Successfully created segment "${name}" with ${res.data.totalMatches} matching profiles!`);
      
      // Reset form after successful creation
      setTimeout(() => {
        setName('');
        setFilters([{ field: '', operator: '=', value: '' }]);
        setResults([]);
        setTotalMatches(0);
        setHasPreview(false);
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create segment");
    } finally {
      setLoading(false);
    }
  };

  // Get field type for better UX
  const getFieldType = (fieldName) => {
    const numericFields = ['age', 'salary', 'score', 'count', 'number'];
    return numericFields.some(f => fieldName.toLowerCase().includes(f)) ? 'number' : 'text';
  };

  // Get validation errors for display
  const getValidationErrors = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Segment name is required';
    }

    filters.forEach((filter, index) => {
      const filterErrors = {};
      
      if (!filter.field) {
        filterErrors.field = 'Field is required';
      }
      
      if (!filter.value?.toString().trim()) {
        filterErrors.value = 'Value is required';
      } else if (['>', '<'].includes(filter.operator) && isNaN(filter.value)) {
        filterErrors.value = 'Numeric value required for this operator';
      }

      if (Object.keys(filterErrors).length > 0) {
        errors[`filter_${index}`] = filterErrors;
      }
    });

    return errors;
  };

  const validationErrors = getValidationErrors();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.iconWrapper}>
              <Filter size={24} />
              <div className={styles.iconGlow}></div>
            </div>
            <div>
              <h1 className={styles.pageTitle}>Segment Builder</h1>
              <p className={styles.pageDescription}>
                Create targeted segments with advanced filtering
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.builderLayout}>
        {/* Left Panel - Form */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconContainer}>
                <Target className={styles.cardIcon} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Segment Configuration</h2>
                <p className={styles.cardSubtitle}>Define your segment criteria</p>
              </div>
            </div>
            
            {/* Alerts */}
            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.alertContent}>
                  <AlertTriangle className={styles.alertIcon} />
                  <div className={styles.alertMessage}>
                    <h4 className={styles.alertTitle}>Error</h4>
                    <p className={styles.alertText}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className={styles.successAlert}>
                <div className={styles.alertContent}>
                  <CheckCircle className={styles.alertIcon} />
                  <div className={styles.alertMessage}>
                    <h4 className={styles.alertTitle}>Success</h4>
                    <p className={styles.alertText}>{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Segment Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Segment Name
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="E.g., High-Value Customers, Active Users"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
              />
              {validationErrors.name && (
                <span className={styles.errorText}>{validationErrors.name}</span>
              )}
            </div>
            
            {/* Filter Section */}
            <div className={styles.filterSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <Filter size={16} />
                  Filter Criteria
                </h3>
                <button
                  onClick={addFilter}
                  className={styles.addButton}
                  type="button"
                >
                  <Plus className={styles.addIcon} />
                  Add Filter
                </button>
              </div>
              
              {filters.map((filter, i) => (
                <div key={i} className={styles.filterCard}>
                  <div className={styles.filterHeader}>
                    <span className={styles.filterNumber}>Filter {i + 1}</span>
                    {filters.length > 1 && (
                      <button
                        onClick={() => removeFilter(i)}
                        className={styles.removeButton}
                        type="button"
                      >
                        <X className={styles.removeIcon} />
                      </button>
                    )}
                  </div>

                  <div className={styles.filterGrid}>
                    {/* Field Selection */}
                    <div className={styles.fieldContainer}>
                      <label className={styles.fieldLabel}>
                        Field <span className={styles.required}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleFieldDropdown(i)}
                        className={`${styles.fieldButton} ${validationErrors[`filter_${i}`]?.field ? styles.inputError : ''}`}
                      >
                        {filter.field || 'Select field'}
                        <ChevronDown className={styles.dropdownIcon} />
                      </button>
                      
                      {showFieldDropdown && activeFilterIndex === i && (
                        <div className={styles.dropdown}>
                          {availableFields.map((field) => (
                            <button
                              key={field}
                              type="button"
                              onClick={() => selectField(field)}
                              className={styles.dropdownItem}
                            >
                              <span className={styles.fieldName}>{field}</span>
                              <span className={styles.fieldType}>
                                {getFieldType(field)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {validationErrors[`filter_${i}`]?.field && (
                        <span className={styles.errorText}>{validationErrors[`filter_${i}`].field}</span>
                      )}
                    </div>
                    
                    {/* Operator Selection */}
                    <div className={styles.operatorContainer}>
                      <label className={styles.fieldLabel}>Operator</label>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(i, 'operator', e.target.value)}
                        className={styles.formSelect}
                      >
                        {operators.map(op => (
                          <option key={op.value} value={op.value} title={op.description}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Value Input */}
                    <div className={styles.valueContainer}>
                      <label className={styles.fieldLabel}>
                        Value <span className={styles.required}>*</span>
                      </label>
                      <input
                        type={getFieldType(filter.field)}
                        placeholder={getFieldType(filter.field) === 'number' ? 'Enter number' : 'Enter value'}
                        value={filter.value}
                        onChange={(e) => updateFilter(i, 'value', e.target.value)}
                        className={`${styles.formInput} ${validationErrors[`filter_${i}`]?.value ? styles.inputError : ''}`}
                      />
                      {validationErrors[`filter_${i}`]?.value && (
                        <span className={styles.errorText}>{validationErrors[`filter_${i}`].value}</span>
                      )}
                    </div>
                  </div>

                  {/* Filter Preview */}
                  {filter.field && filter.value && (
                    <div className={styles.filterPreview}>
                      <Info size={14} />
                      <span>
                        Show profiles where <strong>{filter.field}</strong> {filter.operator === '=' ? 'equals' : 
                        filter.operator === '>' ? 'is greater than' :
                        filter.operator === '<' ? 'is less than' :
                        filter.operator} <strong>"{filter.value}"</strong>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className={styles.formActions}>
              <button
                onClick={handlePreview}
                disabled={previewLoading || !isFormValid()}
                className={styles.previewButton}
                type="button"
              >
                {previewLoading ? (
                  <>
                    <RefreshCw className={styles.spinningIcon} size={16} />
                    Previewing...
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Preview Results
                  </>
                )}
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className={styles.submitButton}
                type="button"
              >
                {loading ? (
                  <>
                    <RefreshCw className={styles.spinningIcon} size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Create Segment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className={styles.resultsPanel}>
          {/* Stats Card */}
          <div className={styles.statsCard}>
            <div className={styles.statsHeader}>
              <div className={styles.statsIconContainer}>
                <Users className={styles.statsIcon} />
              </div>
              <div>
                <h3 className={styles.statsTitle}>Matching Profiles</h3>
                <p className={styles.statsSubtitle}>
                  {hasPreview ? 'Preview results' : 'Click preview to see results'}
                </p>
              </div>
            </div>
            
            <div className={styles.statsValue}>
              <span className={styles.statsNumber}>
                {totalMatches.toLocaleString()}
              </span>
              <span className={styles.statsLabel}>profiles</span>
            </div>

            {hasPreview && (
              <div className={styles.statsFooter}>
                <div className={styles.statsIndicator}>
                  <Zap size={12} />
                  <span>Live preview</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Table */}
          {(results.length > 0 || hasPreview) && (
            <div className={styles.resultsCard}>
              <div className={styles.resultsHeader}>
                <div className={styles.resultsIconContainer}>
                  <Database className={styles.resultsIcon} />
                </div>
                <div className={styles.resultsInfo}>
                  <h3 className={styles.resultsTitle}>Sample Profiles</h3>
                  <p className={styles.resultsSubtitle}>
                    {results.length > 0 
                      ? `Showing ${results.length} of ${totalMatches} profiles`
                      : 'No profiles match your criteria'
                    }
                  </p>
                </div>
              </div>
              
              {results.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        {results.length > 0 && Object.keys(results[0].data).map((col) => (
                          <th key={col} className={styles.tableHeaderCell}>
                            {col.charAt(0).toUpperCase() + col.slice(1)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 10).map((profile, i) => (
                        <tr key={i} className={styles.tableRow}>
                          {Object.values(profile.data).map((val, j) => (
                            <td key={j} className={styles.tableCell}>
                              {val?.toString() || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {totalMatches > 10 && (
                    <div className={styles.tablePagination}>
                      <span className={styles.paginationText}>
                        Showing 10 of {totalMatches.toLocaleString()} matching profiles
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyResults}>
                  <div className={styles.emptyIcon}>
                    <Users size={48} />
                  </div>
                  <h4 className={styles.emptyTitle}>No Matching Profiles</h4>
                  <p className={styles.emptyText}>
                    Try adjusting your filter criteria to find matching profiles.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegmentBuilder;