// pages/home/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Layers, 
  Upload, 
  BarChart3,
  TrendingUp,
  ArrowRight,
  Zap,
  Target,
  Database,
  Filter,
  Eye,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Sparkles,
  Globe,
  Shield
} from 'lucide-react';
import axios from 'axios';
import styles from './HomePage.module.scss';

const HomePage = () => {
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard overview data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [dashboardRes] = await Promise.all([
          axios.get('/api/dashboard?timeRange=week')
        ]);
        
        setQuickStats(dashboardRes.data);
        
        // Mock recent activity - replace with real API call
        setRecentActivity([
          { type: 'segment', action: 'created', name: 'High-Value Customers', time: '2 hours ago' },
          { type: 'profile', action: 'uploaded', name: '1,250 profiles', time: '5 hours ago' },
          { type: 'segment', action: 'updated', name: 'Active Users', time: '1 day ago' },
          { type: 'analysis', action: 'completed', name: 'Weekly Report', time: '2 days ago' }
        ]);
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // Navigation handlers
  const handleQuickAction = useCallback((action) => {
    switch(action) {
      case 'create-segment':
        navigate('/segments/create');
        break;
      case 'upload-profiles':
        navigate('/upload');
        break;
      case 'view-dashboard':
        navigate('/dashboard');
        break;
      case 'view-segments':
        navigate('/segments');
        break;
      case 'view-profiles':
        navigate('/profiles');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading overview...</p>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Welcome to <span className={styles.brandName}>SegmentIQ</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Intelligent customer segmentation and profile management platform. 
              Build targeted segments, analyze customer data, and drive insights with ease.
            </p>
            <div className={styles.heroStats}>
              {quickStats && (
                <>
                  <div className={styles.heroStat}>
                    <div className={styles.statNumber}>{quickStats.totalProfiles?.toLocaleString() || 0}</div>
                    <div className={styles.statLabel}>Customer Profiles</div>
                  </div>
                  <div className={styles.heroStat}>
                    <div className={styles.statNumber}>{quickStats.totalSegments?.toLocaleString() || 0}</div>
                    <div className={styles.statLabel}>Active Segments</div>
                  </div>
                  <div className={styles.heroStat}>
                    <div className={styles.statNumber}>94%</div>
                    <div className={styles.statLabel}>Data Quality</div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={styles.heroActions}>
            <button 
              className={styles.primaryAction}
              onClick={() => handleQuickAction('create-segment')}
            >
              <Plus size={20} />
              <span>Create Segment</span>
              <ArrowRight size={16} className={styles.actionArrow} />
            </button>
            <button 
              className={styles.secondaryAction}
              onClick={() => handleQuickAction('view-dashboard')}
            >
              <BarChart3 size={20} />
              <span>View Dashboard</span>
            </button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            <div className={styles.visualHeader}>
              <Filter size={16} />
              <span>Live Segmentation</span>
            </div>
            <div className={styles.visualContent}>
              <div className={styles.segmentPreview}>
                <div className={styles.segmentItem}>
                  <div className={styles.segmentColor} style={{backgroundColor: '#7b61ff'}}></div>
                  <span>High-Value Customers</span>
                  <span className={styles.segmentCount}>2,341</span>
                </div>
                <div className={styles.segmentItem}>
                  <div className={styles.segmentColor} style={{backgroundColor: '#06d6a0'}}></div>
                  <span>Active Users</span>
                  <span className={styles.segmentCount}>5,892</span>
                </div>
                <div className={styles.segmentItem}>
                  <div className={styles.segmentColor} style={{backgroundColor: '#4cc9f0'}}></div>
                  <span>New Customers</span>
                  <span className={styles.segmentCount}>1,247</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className={styles.quickActionsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Zap size={24} />
            Quick Actions
          </h2>
          <p className={styles.sectionSubtitle}>
            Jump right into your most common tasks
          </p>
        </div>
        
        <div className={styles.actionsGrid}>
          <div 
            className={`${styles.actionCard} ${styles.primaryCard}`}
            onClick={() => handleQuickAction('create-segment')}
          >
            <div className={styles.cardIcon}>
              <Layers size={32} />
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Create Segment</h3>
              <p className={styles.cardDescription}>
                Build targeted customer segments with advanced filtering
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardCta}>Get Started</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          <div 
            className={`${styles.actionCard} ${styles.accentCard}`}
            onClick={() => handleQuickAction('upload-profiles')}
          >
            <div className={styles.cardIcon}>
              <Upload size={32} />
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Upload Profiles</h3>
              <p className={styles.cardDescription}>
                Import customer data from CSV files with validation
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardCta}>Upload Data</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          <div 
            className={`${styles.actionCard} ${styles.infoCard}`}
            onClick={() => handleQuickAction('view-dashboard')}
          >
            <div className={styles.cardIcon}>
              <BarChart3 size={32} />
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Analytics Dashboard</h3>
              <p className={styles.cardDescription}>
                View real-time metrics and performance insights
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardCta}>View Metrics</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          <div 
            className={`${styles.actionCard} ${styles.successCard}`}
            onClick={() => handleQuickAction('view-segments')}
          >
            <div className={styles.cardIcon}>
              <Target size={32} />
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Manage Segments</h3>
              <p className={styles.cardDescription}>
                View, edit, and analyze your existing segments
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardCta}>Browse Segments</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={24} />
            Platform Features
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything you need for intelligent customer segmentation
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Filter size={24} />
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>Advanced Filtering</h4>
              <p className={styles.featureDescription}>
                Create complex segments with multiple conditions, operators, and data types
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Activity size={24} />
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>Real-time Analytics</h4>
              <p className={styles.featureDescription}>
                Monitor segment performance and customer behavior with live dashboards
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Database size={24} />
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>Data Management</h4>
              <p className={styles.featureDescription}>
                Upload, validate, and manage customer profiles with data quality checks
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Eye size={24} />
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>Segment Preview</h4>
              <p className={styles.featureDescription}>
                Preview segment results before creation with real-time profile matching
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Globe size={24} />
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>Scalable Platform</h4>
              <p className={styles.featureDescription}>
                Handle millions of profiles with enterprise-grade performance
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Shield size={24} />
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>Data Security</h4>
              <p className={styles.featureDescription}>
                Enterprise security with data validation and quality monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className={styles.overviewSection}>
        <div className={styles.recentActivity}>
          <div className={styles.activityHeader}>
            <h3 className={styles.activityTitle}>
              <Clock size={20} />
              Recent Activity
            </h3>
            <button 
              className={styles.viewAllButton}
              onClick={() => handleQuickAction('view-dashboard')}
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>
          <div className={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.type === 'segment' && <Layers size={16} />}
                  {activity.type === 'profile' && <Users size={16} />}
                  {activity.type === 'analysis' && <TrendingUp size={16} />}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <strong>{activity.action}</strong> {activity.name}
                  </div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
                <CheckCircle size={14} className={styles.activityStatus} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.quickInsights}>
          <div className={styles.insightsHeader}>
            <h3 className={styles.insightsTitle}>
              <TrendingUp size={20} />
              Quick Insights
            </h3>
          </div>
          <div className={styles.insightsList}>
            <div className={styles.insightItem}>
              <div className={styles.insightIcon}>
                <ArrowUpRight size={16} />
              </div>
              <div className={styles.insightContent}>
                <div className={styles.insightValue}>+12.5%</div>
                <div className={styles.insightLabel}>Profile Growth</div>
              </div>
            </div>
            <div className={styles.insightItem}>
              <div className={styles.insightIcon}>
                <Target size={16} />
              </div>
              <div className={styles.insightContent}>
                <div className={styles.insightValue}>
                  {quickStats?.totalSegments ? Math.round(quickStats.totalProfiles / quickStats.totalSegments) : 0}
                </div>
                <div className={styles.insightLabel}>Avg. Segment Size</div>
              </div>
            </div>
            <div className={styles.insightItem}>
              <div className={styles.insightIcon}>
                <Shield size={16} />
              </div>
              <div className={styles.insightContent}>
                <div className={styles.insightValue}>94%</div>
                <div className={styles.insightLabel}>Data Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;