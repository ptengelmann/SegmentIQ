import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import './Upload.scss';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Database,
  Users,
  BarChart3,
  Sparkles,
  RefreshCw,
  Download,
  Eye,
  ArrowRight,
  FileSpreadsheet,
  Trash2,
  Info,
  Target,
  Zap,
  Clock,
  Activity
} from 'lucide-react';

const Upload = () => {
  useAuth();
  
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState('select'); // select, preview, processing, complete
  const [dragOver, setDragOver] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setValidationErrors(['Please upload a CSV file']);
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setValidationErrors(['File size must be less than 50MB']);
      return;
    }

    setValidationErrors([]);
    setFileName(file.name);
    setFileSize(file.size);
    setUploadStep('processing');

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log('[CSV Parse Results]', {
          fields: results.meta.fields,
          dataLength: results.data.length,
          sampleRow: results.data[0],
          errors: results.errors
        });
        
        // Validate CSV structure
        const errors = [];
        if (!results.meta.fields || results.meta.fields.length === 0) {
          errors.push('CSV file appears to be empty or invalid');
        }
        if (results.data.length === 0) {
          errors.push('No data rows found in CSV');
        }
        if (results.data.length > 50000) {
          errors.push('File contains too many rows (max 50,000)');
        }
        
        if (errors.length > 0) {
          setValidationErrors(errors);
          setUploadStep('select');
          return;
        }
        
        const cleanData = results.data.filter(row => 
          Object.values(row).some(val => val !== null && val !== undefined && val !== '')
        );
        
        console.log('[Cleaned Data]', {
          originalLength: results.data.length,
          cleanedLength: cleanData.length,
          sampleCleanRow: cleanData[0]
        });
        
        setHeaders(results.meta.fields);
        setRows(cleanData);
        setUploadStep('preview');
      },
      error: function(error) {
        console.error('CSV Parse Error:', error);
        setValidationErrors(['Failed to parse CSV file. Please check the file format.']);
        setUploadStep('select');
      }
    });
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const resetUpload = () => {
    setRows([]);
    setHeaders([]);
    setFileName(null);
    setFileSize(0);
    setUploadStep('select');
    setValidationErrors([]);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setUploadStep('processing');
    setProcessingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await fetch('http://localhost:5000/api/segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: rows })
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const contentType = res.headers.get('content-type');
      const result = contentType?.includes('application/json')
        ? await res.json()
        : { error: await res.text() };

      console.log('[AI Response]', result);

      if (!res.ok || result.error) {
        setValidationErrors([result.error || 'Server error occurred']);
        setUploadStep('preview');
        return;
      }

      localStorage.setItem('segments', JSON.stringify(result));
      
      // Show success state briefly before redirecting
      setUploadStep('complete');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Upload error:', err);
      setValidationErrors(['Failed to process data. Please try again.']);
      setUploadStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileStats = () => {
    if (!rows.length) return null;
    
    const numericColumns = headers.filter(header => {
      const sampleValues = rows.slice(0, 10).map(row => row[header]);
      return sampleValues.some(val => typeof val === 'number');
    });
    
    const textColumns = headers.filter(header => {
      const sampleValues = rows.slice(0, 10).map(row => row[header]);
      return sampleValues.some(val => typeof val === 'string');
    });

    return {
      totalRows: rows.length,
      totalColumns: headers.length,
      numericColumns: numericColumns.length,
      textColumns: textColumns.length,
      fileSize: (fileSize / 1024).toFixed(1) + ' KB'
    };
  };

  const renderUploadArea = () => (
    <div className="upload-section">
      <div 
        className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">
          <UploadIcon size={48} />
        </div>
        <div className="upload-content">
          <h3>Drop your CSV file here</h3>
          <p>or click to browse and select a file</p>
          <div className="upload-requirements">
            <span><FileSpreadsheet size={16} /> CSV format only</span>
            <span><Database size={16} /> Max 50MB, 50K rows</span>
            <span><Users size={16} /> Customer data preferred</span>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {validationErrors.length > 0 && (
        <div className="error-messages">
          {validationErrors.map((error, index) => (
            <div key={index} className="error-message">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreview = () => {
    const stats = getFileStats();
    
    return (
      <div className="preview-section">
        <div className="file-info-card">
          <div className="file-header">
            <div className="file-details">
              <div className="file-icon">
                <FileText size={24} />
              </div>
              <div className="file-meta">
                <h3>{fileName}</h3>
                <p>{stats?.fileSize} • {stats?.totalRows.toLocaleString()} rows • {stats?.totalColumns} columns</p>
              </div>
            </div>
            <div className="file-actions">
              <button className="btn-secondary" onClick={resetUpload}>
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>

          <div className="file-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <Database size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats?.totalRows.toLocaleString()}</span>
                <span className="stat-label">Data Rows</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <BarChart3 size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats?.numericColumns}</span>
                <span className="stat-label">Numeric Columns</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FileText size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats?.textColumns}</span>
                <span className="stat-label">Text Columns</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <Target size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">Auto</span>
                <span className="stat-label">Segments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-table-container">
          <div className="table-header">
            <h4>Data Preview</h4>
            <span className="preview-note">Showing first 10 rows</span>
          </div>
          
          <div className="table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>
                      <div className="header-content">
                        <span>{header}</span>
                        <div className="column-type">
                          {typeof rows[0]?.[header] === 'number' ? 'NUM' : 'TEXT'}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    {headers.map((header, j) => (
                      <td key={j}>
                        <span className="cell-value">{String(row[header] || '')}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="action-section">
          <div className="processing-info">
            <Info size={16} />
            <span>Our AI will automatically analyze your data and create optimal customer segments</span>
          </div>
          
          <div className="action-buttons">
            <button className="btn-secondary" onClick={resetUpload}>
              <X size={16} />
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              <Sparkles size={16} />
              Start AI Analysis
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProcessing = () => (
    <div className="processing-section">
      <div className="processing-card">
        <div className="processing-header">
          <div className="processing-icon">
            <Zap size={32} />
          </div>
          <h3>AI Analysis in Progress</h3>
          <p>Our machine learning algorithms are analyzing your customer data</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(processingProgress)}% Complete</span>
        </div>

        <div className="processing-steps">
          <div className={`step ${processingProgress > 20 ? 'completed' : 'active'}`}>
            <CheckCircle size={16} />
            <span>Data validation & cleaning</span>
          </div>
          <div className={`step ${processingProgress > 50 ? 'completed' : processingProgress > 20 ? 'active' : ''}`}>
            <Activity size={16} />
            <span>Feature extraction & analysis</span>
          </div>
          <div className={`step ${processingProgress > 80 ? 'completed' : processingProgress > 50 ? 'active' : ''}`}>
            <Target size={16} />
            <span>Intelligent segmentation</span>
          </div>
          <div className={`step ${processingProgress === 100 ? 'completed' : processingProgress > 80 ? 'active' : ''}`}>
            <Sparkles size={16} />
            <span>Generating insights</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="complete-section">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={48} />
        </div>
        <h3>Analysis Complete!</h3>
        <p>Your customer segments have been successfully generated</p>
        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            <Eye size={16} />
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="upload-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <UploadIcon size={28} />
            <div>
              <h1>Data Upload</h1>
              <p>Upload your customer data to generate intelligent segments</p>
            </div>
          </div>
          
          {uploadStep === 'preview' && (
            <div className="header-actions">
              <button className="btn-info">
                <Info size={16} />
                Upload Guide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="steps-container">
        <div className="steps-track">
          <div className={`step ${uploadStep !== 'select' ? 'completed' : 'active'}`}>
            <div className="step-icon">
              {uploadStep !== 'select' ? <CheckCircle size={16} /> : <UploadIcon size={16} />}
            </div>
            <span>Upload File</span>
          </div>
          
          <div className={`step ${uploadStep === 'preview' ? 'active' : uploadStep === 'processing' || uploadStep === 'complete' ? 'completed' : ''}`}>
            <div className="step-icon">
              {uploadStep === 'processing' || uploadStep === 'complete' ? <CheckCircle size={16} /> : <Eye size={16} />}
            </div>
            <span>Preview Data</span>
          </div>
          
          <div className={`step ${uploadStep === 'processing' ? 'active' : uploadStep === 'complete' ? 'completed' : ''}`}>
            <div className="step-icon">
              {uploadStep === 'complete' ? <CheckCircle size={16} /> : <RefreshCw size={16} />}
            </div>
            <span>AI Analysis</span>
          </div>
          
          <div className={`step ${uploadStep === 'complete' ? 'active' : ''}`}>
            <div className="step-icon">
              <Target size={16} />
            </div>
            <span>View Results</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="upload-content">
        {uploadStep === 'select' && renderUploadArea()}
        {uploadStep === 'preview' && renderPreview()}
        {uploadStep === 'processing' && renderProcessing()}
        {uploadStep === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default Upload;