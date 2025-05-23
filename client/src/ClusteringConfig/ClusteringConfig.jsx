// src/components/ClusteringConfig/ClusteringConfig.jsx
import React, { useState, useEffect } from 'react';
import './ClusteringConfig.scss';
import {
  Settings,
  Sliders,
  Target,
  BarChart3,
  Check,
  X,
  Info,
  Zap,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

const ClusteringConfig = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  headers = [], 
  defaultConfig = {},
  isRerun = false 
}) => {
  const [config, setConfig] = useState({
    numberOfClusters: 0, // 0 = auto
    selectedFeatures: [],
    isAutoMode: true,
    algorithm: 'kmeans',
    scalingMethod: 'standard'
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig({
        numberOfClusters: defaultConfig.numberOfClusters || 0,
        selectedFeatures: defaultConfig.selectedFeatures || [],
        isAutoMode: defaultConfig.isAutoMode !== false,
        algorithm: defaultConfig.algorithm || 'kmeans',
        scalingMethod: defaultConfig.scalingMethod || 'standard'
      });
    }
  }, [isOpen, defaultConfig]);

  const handleFeatureToggle = (feature) => {
    setConfig(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature]
    }));
  };

  const handleSubmit = () => {
    const finalConfig = {
      ...config,
      selectedFeatures: config.selectedFeatures.length === 0 ? headers : config.selectedFeatures
    };
    onSubmit(finalConfig);
    onClose();
  };

  const getFeatureType = (header) => {
    // Simple heuristic - in real app, this would come from data analysis
    const numericKeywords = ['age', 'income', 'price', 'amount', 'count', 'value', 'score'];
    return numericKeywords.some(keyword => header.toLowerCase().includes(keyword)) ? 'numeric' : 'categorical';
  };

  if (!isOpen) return null;

  return (
    <div className="clustering-config-overlay">
      <div className="clustering-config-modal">
        <div className="config-header">
          <div className="header-content">
            <div className="header-icon">
              <Settings size={24} />
            </div>
            <div className="header-text">
              <h2>{isRerun ? 'Re-configure Analysis' : 'Configure Analysis'}</h2>
              <p>Customize your clustering parameters for optimal results</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="config-content">
          {/* Mode Selection */}
          <div className="config-section">
            <div className="section-header">
              <Zap size={20} />
              <h3>Analysis Mode</h3>
            </div>
            
            <div className="mode-selector">
              <button
                className={`mode-option ${config.isAutoMode ? 'active' : ''}`}
                onClick={() => setConfig(prev => ({ ...prev, isAutoMode: true }))}
              >
                <div className="mode-icon">
                  <Zap size={20} />
                </div>
                <div className="mode-content">
                  <h4>Auto Mode</h4>
                  <p>Let AI determine optimal settings automatically</p>
                </div>
                {config.isAutoMode && <Check size={16} className="check-icon" />}
              </button>

              <button
                className={`mode-option ${!config.isAutoMode ? 'active' : ''}`}
                onClick={() => setConfig(prev => ({ ...prev, isAutoMode: false }))}
              >
                <div className="mode-icon">
                  <Sliders size={20} />
                </div>
                <div className="mode-content">
                  <h4>Manual Mode</h4>
                  <p>Customize clustering parameters manually</p>
                </div>
                {!config.isAutoMode && <Check size={16} className="check-icon" />}
              </button>
            </div>
          </div>

          {/* Manual Configuration */}
          {!config.isAutoMode && (
            <>
              {/* Number of Clusters */}
              <div className="config-section">
                <div className="section-header">
                  <Target size={20} />
                  <h3>Number of Segments</h3>
                  <div className="info-tooltip">
                    <Info size={14} />
                    <span className="tooltip-text">
                      Choose 0 for automatic detection, or specify 2-10 segments
                    </span>
                  </div>
                </div>
                
                <div className="cluster-slider">
                  <div className="slider-header">
                    <span>Segments: {config.numberOfClusters === 0 ? 'Auto' : config.numberOfClusters}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={config.numberOfClusters}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      numberOfClusters: parseInt(e.target.value) 
                    }))}
                    className="cluster-range"
                  />
                  <div className="slider-labels">
                    <span>Auto</span>
                    <span>2</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              {/* Algorithm Selection */}
              <div className="config-section">
                <div className="section-header">
                  <BarChart3 size={20} />
                  <h3>Algorithm</h3>
                </div>
                
                <div className="algorithm-selector">
                  <select
                    value={config.algorithm}
                    onChange={(e) => setConfig(prev => ({ ...prev, algorithm: e.target.value }))}
                    className="algorithm-select"
                  >
                    <option value="kmeans">K-Means (Recommended)</option>
                    <option value="hierarchical">Hierarchical Clustering</option>
                    <option value="dbscan">DBSCAN (Density-based)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Feature Selection */}
          <div className="config-section">
            <div className="section-header">
              <Eye size={20} />
              <h3>Feature Selection</h3>
              <button
                className="preview-toggle"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                {previewMode ? 'Hide' : 'Preview'}
              </button>
            </div>
            
            <div className="features-grid">
              {headers.map((header, index) => {
                const isSelected = config.selectedFeatures.includes(header) || config.selectedFeatures.length === 0;
                const featureType = getFeatureType(header);
                
                return (
                  <div
                    key={index}
                    className={`feature-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleFeatureToggle(header)}
                  >
                    <div className="feature-content">
                      <div className="feature-name">{header}</div>
                      <div className={`feature-type ${featureType}`}>
                        {featureType}
                      </div>
                    </div>
                    <div className="feature-checkbox">
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="feature-actions">
              <button
                className="btn-secondary small"
                onClick={() => setConfig(prev => ({ ...prev, selectedFeatures: [] }))}
              >
                Select All
              </button>
              <button
                className="btn-secondary small"
                onClick={() => setConfig(prev => ({ ...prev, selectedFeatures: headers }))}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {previewMode && (
            <div className="config-section preview-section">
              <div className="section-header">
                <Eye size={20} />
                <h3>Configuration Preview</h3>
              </div>
              
              <div className="preview-content">
                <div className="preview-item">
                  <span className="preview-label">Mode:</span>
                  <span className="preview-value">
                    {config.isAutoMode ? 'Automatic' : 'Manual'}
                  </span>
                </div>
                
                {!config.isAutoMode && (
                  <>
                    <div className="preview-item">
                      <span className="preview-label">Segments:</span>
                      <span className="preview-value">
                        {config.numberOfClusters === 0 ? 'Auto-detect' : config.numberOfClusters}
                      </span>
                    </div>
                    
                    <div className="preview-item">
                      <span className="preview-label">Algorithm:</span>
                      <span className="preview-value">{config.algorithm}</span>
                    </div>
                  </>
                )}
                
                <div className="preview-item">
                  <span className="preview-label">Features:</span>
                  <span className="preview-value">
                    {config.selectedFeatures.length === 0 ? 'All features' : `${config.selectedFeatures.length} selected`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="config-footer">
          <div className="footer-info">
            <Info size={16} />
            <span>
              {isRerun ? 'Re-analysis will create a new version' : 'Analysis typically takes 30-60 seconds'}
            </span>
          </div>
          
          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              <RefreshCw size={16} />
              {isRerun ? 'Re-analyze Data' : 'Start Analysis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusteringConfig;