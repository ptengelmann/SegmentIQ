import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Plus, X, ChevronDown, Save, Database, AlertTriangle } from 'lucide-react';
import styles from './segmentBuilder.module.scss';

const SegmentBuilder = () => {
  const [name, setName] = useState('');
  const [filters, setFilters] = useState([{ field: '', operator: '=', value: '' }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [activeFilterIndex, setActiveFilterIndex] = useState(null);
  
  useEffect(() => {
    // Fetch available fields for dropdown
    const fetchFields = async () => {
      try {
        const res = await axios.get('/api/profiles/fields');
        // If your API doesn't support this, you can detect fields from a sample profile
        setAvailableFields(res.data || ['email', 'name', 'age', 'location', 'signupDate']);
      } catch (err) {
        console.error("Failed to fetch fields", err);
        // Fallback fields
        setAvailableFields(['email', 'name', 'age', 'location', 'signupDate']);
      }
    };
    
    fetchFields();
  }, []);

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '' }]);
  };

  const removeFilter = (index) => {
    const updated = [...filters];
    updated.splice(index, 1);
    setFilters(updated);
  };

  const updateFilter = (i, key, val) => {
    const updated = [...filters];
    updated[i][key] = val;
    setFilters(updated);
  };

  const toggleFieldDropdown = (index) => {
    setActiveFilterIndex(index);
    setShowFieldDropdown(!showFieldDropdown);
  };

  const selectField = (field) => {
    if (activeFilterIndex !== null) {
      updateFilter(activeFilterIndex, 'field', field);
    }
    setShowFieldDropdown(false);
  };

  const handleSubmit = async () => {
    if (!name) {
      setError("Please provide a segment name");
      return;
    }
    
    if (filters.some(f => !f.field || !f.value)) {
      setError("Please complete all filter criteria");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/api/segments', { name, filters });
      setResults(res.data.matchedProfiles);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create segment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div className={styles.iconContainer}>
            <Filter className={styles.icon} />
          </div>
          <h2 className={styles.cardTitle}>Create Segment</h2>
        </div>
        
        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <AlertTriangle className={styles.errorIcon} />
              <p className={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Segment Name</label>
          <input
            type="text"
            placeholder="E.g., High-Value Customers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.formInput}
          />
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Filter Criteria</h3>
            <button
              onClick={addFilter}
              className={styles.addButton}
            >
              <Plus className={styles.addIcon} />
              Add Filter
            </button>
          </div>
          
          {filters.map((filter, i) => (
            <div key={i} className={styles.filterCard}>
              <div className={styles.filterGrid}>
                <div className={styles.fieldContainer}>
                  <label className={styles.fieldLabel}>Field</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldDropdown(i)}
                    className={styles.fieldButton}
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
                          {field}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className={styles.fieldLabel}>Operator</label>
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(i, 'operator', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="=">Equals (=)</option>
                    <option value=">">Greater Than (&gt;)</option>
                    <option value="<">Less Than (&lt;)</option>
                    <option value="contains">Contains</option>
                    <option value="starts_with">Starts with</option>
                    <option value="ends_with">Ends with</option>
                  </select>
                </div>
                
                <div>
                  <label className={styles.fieldLabel}>Value</label>
                  <input
                    type="text"
                    placeholder="Enter value"
                    value={filter.value}
                    onChange={(e) => updateFilter(i, 'value', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              {filters.length > 1 && (
                <button
                  onClick={() => removeFilter(i)}
                  className={styles.removeButton}
                >
                  <X className={styles.removeIcon} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className={styles.formActions}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : ''}`}
          >
            {loading ? (
              <>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save className={styles.saveIcon} />
                Create Segment
              </>
            )}
          </button>
        </div>
      </div>
      
      {results.length > 0 && (
        <div className={styles.resultsCard}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsIconContainer}>
              <Database className={styles.resultsIcon} />
            </div>
            <div className={styles.resultsInfo}>
              <h2 className={styles.resultsTitle}>Matched Profiles</h2>
              <p className={styles.resultsSubtitle}>{results.length} profiles match your criteria</p>
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  {results.length > 0 && Object.keys(results[0].data).map((col) => (
                    <th key={col} className={styles.tableHeaderCell}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 10).map((profile, i) => (
                  <tr key={i} className={styles.tableRow}>
                    {Object.values(profile.data).map((val, j) => (
                      <td key={j} className={styles.tableCell}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.length > 10 && (
            <div className={styles.paginationInfo}>
              Showing 10 of {results.length} profiles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SegmentBuilder;