import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { 
  Upload as UploadIcon, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  File, 
  X, 
  FileText,
  Table, 
  Info,
  ArrowRight,
  RefreshCw,
  Trash2,
  Shield,
  Filter
} from 'lucide-react';
import styles from './upload.module.scss';

const UploadPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSize, setFileSize] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);

  // Simulate progress during upload
  useEffect(() => {
    let progressInterval;
    
    if (loading) {
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 5;
        });
      }, 300);
    } else if (uploadProgress > 0 && uploadProgress < 100) {
      setUploadProgress(100);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [loading, uploadProgress]);

  const resetState = useCallback(() => {
    setData([]);
    setColumns([]);
    setFileName(null);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    setFileSize(null);
    setValidationStatus(null);
    setIsValidating(false);
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const validateData = useCallback((parsedData) => {
    setIsValidating(true);
    
    // Simulate validation process
    setTimeout(() => {
      // Check for required fields (example validation)
      const requiredFields = ['id', 'email'];
      const headers = Object.keys(parsedData[0] || {});
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        setValidationStatus({
          status: 'warning',
          message: `Missing required fields: ${missingFields.join(', ')}`,
          details: {
            missingFields,
            duplicates: 0,
            invalidEmails: 0
          }
        });
      } else {
        // Check for duplicate IDs and invalid emails
        const ids = new Set();
        let duplicates = 0;
        let invalidEmails = 0;
        
        parsedData.forEach(row => {
          // Check for duplicate IDs
          if (row.id) {
            if (ids.has(row.id)) {
              duplicates++;
            } else {
              ids.add(row.id);
            }
          }
          
          // Simple email validation
          if (row.email && !row.email.includes('@')) {
            invalidEmails++;
          }
        });
        
        if (duplicates > 0 || invalidEmails > 0) {
          setValidationStatus({
            status: 'warning',
            message: 'Data validation completed with warnings',
            details: {
              missingFields: [],
              duplicates,
              invalidEmails
            }
          });
        } else {
          setValidationStatus({
            status: 'success',
            message: 'Data validation successful',
            details: {
              missingFields: [],
              duplicates: 0,
              invalidEmails: 0
            }
          });
        }
      }
      
      setIsValidating(false);
    }, 1200);
  }, []);

  const handleSave = async () => {
    if (data.length === 0) {
      setError("No data to upload");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(5); // Start progress
    
    try {
      // Add a delay to simulate larger file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await axios.post('/api/profiles/upload', data);
      setSuccess(`Successfully uploaded ${res.data.inserted} profiles to the database.`);
      setUploadProgress(100);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to upload data");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setFileName(file.name);
    setError(null);
    setSuccess(null);
    setFileSize(formatFileSize(file.size));
    setIsValidating(true);
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      setIsValidating(false);
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          setIsValidating(false);
          return;
        }
        
        if (results.data.length === 0) {
          setError("CSV file is empty");
          setIsValidating(false);
          return;
        }
        
        setColumns(Object.keys(results.data[0] || {}));
        setData(results.data);
        
        // Validate the data
        validateData(results.data);
      },
      error: function(error) {
        setError(`Failed to parse CSV: ${error}`);
        setIsValidating(false);
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
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Upload Profiles</h1>
          <p className={styles.pageDescription}>
            Import user profiles from CSV files to your database
          </p>
        </div>
      </div>
      
      <div className={styles.uploadContainer}>
        <div className={styles.uploadCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <UploadIcon size={20} />
              <div className={styles.iconGlow}></div>
            </div>
            <div>
              <h2 className={styles.cardTitle}>Upload CSV File</h2>
              <p className={styles.cardDescription}>
                Drag and drop your file or browse to upload
              </p>
            </div>
          </div>
          
          {error && (
            <div className={styles.alert + ' ' + styles.errorAlert}>
              <div className={styles.alertContent}>
                <div className={styles.alertIcon}>
                  <AlertTriangle size={20} />
                </div>
                <div className={styles.alertMessage}>
                  <h4 className={styles.alertTitle}>Error</h4>
                  <p className={styles.alertText}>{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className={styles.alert + ' ' + styles.successAlert}>
              <div className={styles.alertContent}>
                <div className={styles.alertIcon}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.alertMessage}>
                  <h4 className={styles.alertTitle}>Success</h4>
                  <p className={styles.alertText}>{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <div 
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''} ${fileName ? styles.dropZoneWithFile : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {fileName ? (
              <div className={styles.fileInfo}>
                <div className={styles.fileIconContainer}>
                  <div className={styles.fileIconWrapper}>
                    <FileText className={styles.fileIcon} />
                  </div>
                </div>
                <div className={styles.fileDetails}>
                  <div className={styles.fileNameRow}>
                    <span className={styles.fileName}>{fileName}</span>
                    <span className={styles.fileSize}>{fileSize}</span>
                  </div>
                  
                  {isValidating ? (
                    <div className={styles.validationStatus}>
                      <RefreshCw size={14} className={styles.spinningIcon} />
                      <span>Validating data...</span>
                    </div>
                  ) : validationStatus ? (
                    <div className={`${styles.validationStatus} ${styles[validationStatus.status]}`}>
                      {validationStatus.status === 'success' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      <span>{validationStatus.message}</span>
                    </div>
                  ) : null}
                  
                  <div className={styles.fileActions}>
                    <button 
                      className={styles.fileActionButton}
                      onClick={() => {
                        resetState();
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                    <button 
                      className={styles.fileActionButton}
                      onClick={() => {
                        setData([]);
                        setColumns([]);
                        setFileName(null);
                        setFileSize(null);
                        document.querySelector('input[type="file"]').click();
                      }}
                    >
                      <UploadIcon size={14} />
                      <span>Replace</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.dropZoneContent}>
                  <div className={styles.uploadIconContainer}>
                    <div className={styles.uploadIconWrapper}>
                      <UploadIcon className={styles.uploadIcon} />
                      <div className={styles.uploadIconGlow}></div>
                    </div>
                  </div>
                  <h3 className={styles.dropZoneTitle}>Drop your CSV file here</h3>
                  <p className={styles.dropZoneText}>or</p>
                  <label className={styles.browseButton}>
                    <span>Browse Files</span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleInputChange} 
                      className={styles.fileInput} 
                    />
                  </label>
                </div>
                <div className={styles.fileRequirements}>
                  <div className={styles.requirementItem}>
                    <FileText size={14} />
                    <span>CSV files only</span>
                  </div>
                  <div className={styles.requirementItem}>
                    <Database size={14} />
                    <span>Headers must include: id, email</span>
                  </div>
                  <div className={styles.requirementItem}>
                    <Shield size={14} />
                    <span>Data will be validated before upload</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {validationStatus && validationStatus.status === 'warning' && (
            <div className={styles.validationWarnings}>
              <h4 className={styles.warningsTitle}>
                <AlertTriangle size={16} />
                <span>Data Validation Warnings</span>
              </h4>
              <div className={styles.warningsList}>
                {validationStatus.details.missingFields.length > 0 && (
                  <div className={styles.warningItem}>
                    <span className={styles.warningLabel}>Missing Fields:</span>
                    <span className={styles.warningValue}>{validationStatus.details.missingFields.join(', ')}</span>
                  </div>
                )}
                {validationStatus.details.duplicates > 0 && (
                  <div className={styles.warningItem}>
                    <span className={styles.warningLabel}>Duplicate IDs:</span>
                    <span className={styles.warningValue}>{validationStatus.details.duplicates}</span>
                  </div>
                )}
                {validationStatus.details.invalidEmails > 0 && (
                  <div className={styles.warningItem}>
                    <span className={styles.warningLabel}>Invalid Emails:</span>
                    <span className={styles.warningValue}>{validationStatus.details.invalidEmails}</span>
                  </div>
                )}
              </div>
              <p className={styles.warningsNote}>
                You can still proceed with upload, but data quality may be affected.
              </p>
            </div>
          )}
          
          {data.length > 0 && (
            <div className={styles.previewSection}>
              <div className={styles.previewHeader}>
                <div className={styles.previewTitle}>
                  <Table size={16} />
                  <h3>Data Preview</h3>
                </div>
                <div className={styles.previewControls}>
                  <div className={styles.recordCount}>
                    <Database size={14} />
                    <span>{data.length} records found</span>
                  </div>
                  <button 
                    className={styles.togglePreviewButton}
                    onClick={() => setShowFullPreview(!showFullPreview)}
                  >
                    {showFullPreview ? 'Show Less' : 'Show More'}
                    <ArrowRight size={14} className={showFullPreview ? styles.rotateIcon : ''} />
                  </button>
                </div>
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
                    {data.slice(0, showFullPreview ? 10 : 5).map((row, i) => (
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
              
              <div className={styles.previewFooter}>
                <div className={styles.previewInfo}>
                  <Info size={14} />
                  <span>
                    {showFullPreview 
                      ? `Showing 10 of ${data.length} records` 
                      : `Showing 5 of ${data.length} records`}
                  </span>
                </div>
                
                <div className={styles.columnInfo}>
                  <Filter size={14} />
                  <span>{columns.length} columns detected</span>
                </div>
              </div>
            </div>
          )}
          
          {uploadProgress > 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressInfo}>
                <span className={styles.progressLabel}>
                  {uploadProgress < 100 ? 'Uploading...' : 'Upload complete'}
                </span>
                <span className={styles.progressPercentage}>{Math.round(uploadProgress)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className={styles.formActions}>
            <button
              onClick={handleSave}
              disabled={loading || data.length === 0 || isValidating}
              className={`${styles.submitButton} ${(loading || data.length === 0 || isValidating) ? styles.submitButtonDisabled : ''}`}
            >
              {loading ? (
                <>
                  <RefreshCw className={styles.spinningIcon} size={16} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Database size={16} />
                  <span>Save to Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;