import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Upload, Database, CheckCircle, AlertTriangle, File, X } from 'lucide-react';
import styles from './upload.module.scss';

const UploadPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSave = async () => {
    if (data.length === 0) {
      setError("No data to upload");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await axios.post('/api/profiles/upload', data);
      setSuccess(`Successfully uploaded ${res.data.inserted} profiles to the database.`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to upload data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setFileName(file.name);
    setError(null);
    setSuccess(null);
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        
        if (results.data.length === 0) {
          setError("CSV file is empty");
          return;
        }
        
        setColumns(Object.keys(results.data[0] || {}));
        setData(results.data);
      },
      error: function(error) {
        setError(`Failed to parse CSV: ${error}`);
      }
    });
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadCard}>
        <div className={styles.cardHeader}>
          <div className={styles.iconContainer}>
            <Upload className={styles.icon} />
          </div>
          <h2 className={styles.cardTitle}>Upload Profiles</h2>
        </div>
        
        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorContent}>
              <AlertTriangle className={styles.errorIcon} />
              <p className={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className={styles.successAlert}>
            <div className={styles.successContent}>
              <CheckCircle className={styles.successIcon} />
              <p className={styles.successMessage}>{success}</p>
            </div>
          </div>
        )}
        
        <div 
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : styles.dropZoneIdle}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {fileName ? (
            <div>
              <div className={styles.fileIconContainer}>
                <File className={styles.fileIcon} />
              </div>
              <div className={styles.selectedFileContainer}>
                <span className={styles.selectedFileName}>{fileName}</span>
                <button 
                  onClick={() => {
                    setFileName(null);
                    setData([]);
                    setColumns([]);
                  }}
                  className={styles.removeFileButton}
                >
                  <X className={styles.removeIcon} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.fileIconContainer}>
                <Upload className={styles.uploadIcon} />
              </div>
              <p className={styles.dropZoneText}>Drag and drop your CSV file here, or</p>
              <label className={styles.browseButton}>
                <span>Browse Files</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleInputChange} 
                  className={styles.fileInput} 
                />
              </label>
              <p className={styles.fileInfoText}>CSV files only</p>
            </>
          )}
        </div>
        
        {data.length > 0 && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <span className={styles.recordCount}>{data.length} records found</span>
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    {columns.map((col) => (
                      <th 
                        key={col} 
                        className={styles.tableHeaderCell}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i} className={styles.tableRow}>
                      {columns.map((col) => (
                        <td key={col} className={styles.tableCell}>
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data.length > 5 && (
              <p className={styles.previewInfo}>Showing 5 of {data.length} records</p>
            )}
          </div>
        )}
        
        <div className={styles.formActions}>
          <button
            onClick={handleSave}
            disabled={loading || data.length === 0}
            className={`${styles.submitButton} ${(loading || data.length === 0) ? styles.submitButtonDisabled : ''}`}
          >
            {loading ? (
              <>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Database className={styles.saveIcon} />
                Save to Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;