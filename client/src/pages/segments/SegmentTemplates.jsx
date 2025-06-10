// pages/segments/SegmentTemplates.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Search, Filter, Star, TrendingUp, Users, Target,
  ShoppingCart, Calendar, DollarSign, MapPin, Activity,
  Zap, Heart, Award, Clock, Eye, Plus, ArrowRight,
  CheckCircle, AlertTriangle, Info, Sparkles, Gift,
  Briefcase, Globe, Smartphone, Mail, MessageCircle,
  BarChart3, PieChart, LineChart, Database, Settings
} from 'lucide-react';
import axios from 'axios';
import styles from './SegmentTemplates.module.scss';

const SegmentTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Template categories
  const categories = [
    { id: 'all', label: 'All Templates', icon: <Layers size={16} /> },
    { id: 'behavioral', label: 'Behavioral', icon: <Activity size={16} /> },
    { id: 'demographic', label: 'Demographic', icon: <Users size={16} /> },
    { id: 'engagement', label: 'Engagement', icon: <Heart size={16} /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign size={16} /> },
    { id: 'geographic', label: 'Geographic', icon: <MapPin size={16} /> },
    { id: 'lifecycle', label: 'Lifecycle', icon: <Calendar size={16} /> },
    { id: 'product', label: 'Product Usage', icon: <Target size={16} /> }
  ];

  // Pre-defined segment templates
  const segmentTemplates = [
    // Behavioral Templates
    {
      id: 'high_value_customers',
      name: 'High-Value Customers',
      description: 'Customers with high lifetime value and frequent purchases',
      category: 'behavioral',
      icon: <Star size={20} />,
      color: '#7b61ff',
      popularity: 95,
      estimatedSize: '12-18%',
      useCase: 'VIP programs, exclusive offers, premium support',
      filters: [
        { field: 'total_purchase_amount', operator: '>', value: 1000 },
        { field: 'purchase_frequency', operator: '>', value: 5 },
        { field: 'last_purchase_days', operator: '<', value: 30 }
      ],
      tags: ['revenue', 'loyalty', 'premium']
    },
    {
      id: 'cart_abandoners',
      name: 'Cart Abandoners',
      description: 'Users who added items to cart but didn\'t complete purchase',
      category: 'behavioral',
      icon: <ShoppingCart size={20} />,
      color: '#ff5a5a',
      popularity: 88,
      estimatedSize: '25-35%',
      useCase: 'Retargeting campaigns, discount offers, reminder emails',
      filters: [
        { field: 'cart_items', operator: '>', value: 0 },
        { field: 'last_purchase_days', operator: '>', value: 7 },
        { field: 'cart_updated_days', operator: '<', value: 3 }
      ],
      tags: ['conversion', 'retargeting', 'email']
    },
    {
      id: 'power_users',
      name: 'Power Users',
      description: 'Highly engaged users with frequent app/platform usage',
      category: 'behavioral',
      icon: <Zap size={20} />,
      color: '#06d6a0',
      popularity: 82,
      estimatedSize: '8-15%',
      useCase: 'Beta testing, feature feedback, community building',
      filters: [
        { field: 'sessions_per_week', operator: '>', value: 10 },
        { field: 'avg_session_duration', operator: '>', value: 15 },
        { field: 'features_used', operator: '>', value: 8 }
      ],
      tags: ['engagement', 'beta', 'feedback']
    },

    // Demographic Templates
    {
      id: 'millennials',
      name: 'Millennials (25-40)',
      description: 'Users born between 1981-1996, tech-savvy generation',
      category: 'demographic',
      icon: <Users size={20} />,
      color: '#4cc9f0',
      popularity: 76,
      estimatedSize: '35-45%',
      useCase: 'Social media campaigns, mobile-first experiences',
      filters: [
        { field: 'age', operator: '>', value: 25 },
        { field: 'age', operator: '<', value: 40 },
        { field: 'device_type', operator: '=', value: 'mobile' }
      ],
      tags: ['age', 'mobile', 'social']
    },
    {
      id: 'enterprise_users',
      name: 'Enterprise Users',
      description: 'Users from large companies with business email domains',
      category: 'demographic',
      icon: <Briefcase size={20} />,
      color: '#9a85ff',
      popularity: 71,
      estimatedSize: '15-25%',
      useCase: 'B2B campaigns, enterprise features, bulk discounts',
      filters: [
        { field: 'company_size', operator: '>', value: 500 },
        { field: 'email', operator: 'contains', value: '@' },
        { field: 'account_type', operator: '=', value: 'business' }
      ],
      tags: ['b2b', 'enterprise', 'business']
    },

    // Engagement Templates
    {
      id: 'highly_engaged',
      name: 'Highly Engaged Users',
      description: 'Users with high interaction rates and long session times',
      category: 'engagement',
      icon: <Heart size={20} />,
      color: '#ff6b9d',
      popularity: 85,
      estimatedSize: '20-30%',
      useCase: 'Loyalty programs, advanced features, referral campaigns',
      filters: [
        { field: 'engagement_score', operator: '>', value: 80 },
        { field: 'avg_session_duration', operator: '>', value: 10 },
        { field: 'pages_per_session', operator: '>', value: 5 }
      ],
      tags: ['engagement', 'loyalty', 'retention']
    },
    {
      id: 'email_engaged',
      name: 'Email Engaged',
      description: 'Users who actively open and click email campaigns',
      category: 'engagement',
      icon: <Mail size={20} />,
      color: '#ffaa5a',
      popularity: 79,
      estimatedSize: '40-50%',
      useCase: 'Email marketing, newsletters, product updates',
      filters: [
        { field: 'email_open_rate', operator: '>', value: 25 },
        { field: 'email_click_rate', operator: '>', value: 3 },
        { field: 'email_unsubscribed', operator: '=', value: false }
      ],
      tags: ['email', 'marketing', 'communication']
    },

    // Revenue Templates
    {
      id: 'big_spenders',
      name: 'Big Spenders',
      description: 'Customers with high average order values',
      category: 'revenue',
      icon: <DollarSign size={20} />,
      color: '#1ce8b5',
      popularity: 83,
      estimatedSize: '10-15%',
      useCase: 'Premium products, upselling, exclusive collections',
      filters: [
        { field: 'avg_order_value', operator: '>', value: 250 },
        { field: 'total_orders', operator: '>', value: 3 },
        { field: 'refund_rate', operator: '<', value: 5 }
      ],
      tags: ['revenue', 'premium', 'upsell']
    },
    {
      id: 'discount_hunters',
      name: 'Discount Hunters',
      description: 'Price-sensitive customers who primarily buy on sale',
      category: 'revenue',
      icon: <Gift size={20} />,
      color: '#f72585',
      popularity: 74,
      estimatedSize: '30-40%',
      useCase: 'Sale notifications, coupon campaigns, clearance items',
      filters: [
        { field: 'discount_usage_rate', operator: '>', value: 70 },
        { field: 'full_price_purchases', operator: '<', value: 2 },
        { field: 'coupon_subscriber', operator: '=', value: true }
      ],
      tags: ['discounts', 'sales', 'price-sensitive']
    },

    // Geographic Templates
    {
      id: 'urban_users',
      name: 'Urban Users',
      description: 'Users located in major metropolitan areas',
      category: 'geographic',
      icon: <MapPin size={20} />,
      color: '#7209b7',
      popularity: 69,
      estimatedSize: '45-55%',
      useCase: 'Local events, city-specific offers, delivery services',
      filters: [
        { field: 'city_population', operator: '>', value: 500000 },
        { field: 'area_type', operator: '=', value: 'urban' },
        { field: 'delivery_available', operator: '=', value: true }
      ],
      tags: ['location', 'urban', 'delivery']
    },
    {
      id: 'international_users',
      name: 'International Users',
      description: 'Users from outside the primary market region',
      category: 'geographic',
      icon: <Globe size={20} />,
      color: '#480ca8',
      popularity: 65,
      estimatedSize: '20-30%',
      useCase: 'Localization, currency options, international shipping',
      filters: [
        { field: 'country', operator: '!=', value: 'US' },
        { field: 'language', operator: '!=', value: 'en' },
        { field: 'timezone_offset', operator: '!=', value: -5 }
      ],
      tags: ['international', 'localization', 'global']
    },

    // Lifecycle Templates
    {
      id: 'new_users',
      name: 'New Users (Last 30 Days)',
      description: 'Recently registered users in their onboarding phase',
      category: 'lifecycle',
      icon: <Sparkles size={20} />,
      color: '#06ffa5',
      popularity: 91,
      estimatedSize: '15-25%',
      useCase: 'Onboarding sequences, welcome offers, tutorial content',
      filters: [
        { field: 'registration_days', operator: '<', value: 30 },
        { field: 'onboarding_completed', operator: '=', value: false },
        { field: 'first_purchase', operator: '=', value: null }
      ],
      tags: ['onboarding', 'new', 'welcome']
    },
    {
      id: 'at_risk_churn',
      name: 'At-Risk of Churn',
      description: 'Previously active users showing declining engagement',
      category: 'lifecycle',
      icon: <AlertTriangle size={20} />,
      color: '#ff4081',
      popularity: 87,
      estimatedSize: '12-20%',
      useCase: 'Win-back campaigns, special offers, feedback surveys',
      filters: [
        { field: 'last_activity_days', operator: '>', value: 14 },
        { field: 'previous_engagement_score', operator: '>', value: 60 },
        { field: 'current_engagement_score', operator: '<', value: 30 }
      ],
      tags: ['churn', 'retention', 'win-back']
    },

    // Product Usage Templates
    {
      id: 'feature_adopters',
      name: 'Early Feature Adopters',
      description: 'Users who quickly adopt and use new product features',
      category: 'product',
      icon: <Target size={20} />,
      color: '#00b4d8',
      popularity: 68,
      estimatedSize: '18-25%',
      useCase: 'Beta testing, feature feedback, advanced tutorials',
      filters: [
        { field: 'new_features_used', operator: '>', value: 2 },
        { field: 'feature_adoption_speed', operator: '<', value: 7 },
        { field: 'feedback_provided', operator: '=', value: true }
      ],
      tags: ['features', 'adoption', 'innovation']
    },
    {
      id: 'mobile_only',
      name: 'Mobile-Only Users',
      description: 'Users who exclusively access via mobile devices',
      category: 'product',
      icon: <Smartphone size={20} />,
      color: '#ffd60a',
      popularity: 72,
      estimatedSize: '35-45%',
      useCase: 'Mobile app features, push notifications, mobile UX',
      filters: [
        { field: 'mobile_sessions', operator: '>', value: 10 },
        { field: 'desktop_sessions', operator: '=', value: 0 },
        { field: 'app_installed', operator: '=', value: true }
      ],
      tags: ['mobile', 'app', 'device']
    }
  ];

  // Initialize templates
  useEffect(() => {
    setTemplates(segmentTemplates);
    setLoading(false);
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, selectedCategory]);

  // Preview template
  const handlePreviewTemplate = useCallback(async (template) => {
    setPreviewingTemplate(template.id);
    setPreviewLoading(true);
    
    try {
      const response = await axios.post('/api/segments/preview', {
        filters: template.filters
      });
      
      setPreviewData({
        ...response.data,
        templateId: template.id
      });
    } catch (error) {
      console.error('Failed to preview template:', error);
      setPreviewData({
        error: 'Failed to load preview',
        templateId: template.id
      });
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Create segment from template
  const handleCreateFromTemplate = useCallback(async (template) => {
    try {
      const response = await axios.post('/api/segments', {
        name: template.name,
        filters: template.filters
      });
      
      if (response.data.segment) {
        navigate(`/segments/${response.data.segment._id}`);
      }
    } catch (error) {
      console.error('Failed to create segment from template:', error);
    }
  }, [navigate]);

  // Sort templates by popularity
  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => b.popularity - a.popularity);
  }, [filteredTemplates]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading segment templates...</p>
      </div>
    );
  }

  return (
    <div className={styles.templatesContainer}>
      {/* Header */}
      <div className={styles.templatesHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <Layers size={28} />
            Segment Templates
          </h1>
          <p className={styles.pageSubtitle}>
            Choose from pre-built segment templates to quickly target specific customer groups
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.customSegmentButton}
            onClick={() => navigate('/segments/create')}
          >
            <Plus size={16} />
            Create Custom Segment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Layers size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{templates.length}</div>
            <div className={styles.statLabel}>Templates Available</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{categories.length - 1}</div>
            <div className={styles.statLabel}>Categories</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {Math.round(templates.reduce((acc, t) => acc + t.popularity, 0) / templates.length)}%
            </div>
            <div className={styles.statLabel}>Avg Popularity</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {templates.filter(t => t.popularity > 80).length}
            </div>
            <div className={styles.statLabel}>Highly Rated</div>
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
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.categoryFilters}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className={styles.templatesGrid}>
        {sortedTemplates.length === 0 ? (
          <div className={styles.emptyState}>
            <Filter size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No Templates Found</h3>
            <p className={styles.emptyText}>
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No templates available at the moment'
              }
            </p>
          </div>
        ) : (
          sortedTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isPreviewingTemplate={previewingTemplate === template.id}
              previewData={previewData?.templateId === template.id ? previewData : null}
              previewLoading={previewLoading && previewingTemplate === template.id}
              onPreview={() => handlePreviewTemplate(template)}
              onCreate={() => handleCreateFromTemplate(template)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ 
  template, 
  isPreviewingTemplate, 
  previewData, 
  previewLoading,
  onPreview, 
  onCreate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`${styles.templateCard} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.cardHeader}>
        <div 
          className={styles.templateIcon}
          style={{ backgroundColor: template.color }}
        >
          {template.icon}
        </div>
        
        <div className={styles.templateInfo}>
          <h3 className={styles.templateName}>{template.name}</h3>
          <p className={styles.templateDescription}>{template.description}</p>
        </div>
        
        <div className={styles.templateMeta}>
          <div className={styles.popularity}>
            <Star size={12} />
            {template.popularity}%
          </div>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.templateStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Estimated Size</span>
            <span className={styles.statValue}>{template.estimatedSize}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Category</span>
            <span className={styles.statValue}>{template.category}</span>
          </div>
        </div>
        
        <div className={styles.templateTags}>
          {template.tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        
        <div className={styles.useCase}>
          <strong>Use Case:</strong> {template.useCase}
        </div>
        
        {isExpanded && (
          <div className={styles.expandedContent}>
            <div className={styles.filtersPreview}>
              <h4>Filter Criteria:</h4>
              <div className={styles.filtersList}>
                {template.filters.map((filter, index) => (
                  <div key={index} className={styles.filterItem}>
                    <code>{filter.field}</code> {filter.operator} <code>{filter.value}</code>
                  </div>
                ))}
              </div>
            </div>
            
            {previewData && !previewData.error && (
              <div className={styles.previewResults}>
                <h4>Preview Results:</h4>
                <div className={styles.previewStats}>
                  <span className={styles.matchCount}>
                    {previewData.totalMatches?.toLocaleString()} matches
                  </span>
                  {previewData.limitedResults && (
                    <span className={styles.limitedNote}>
                      (showing first {previewData.matchedProfiles?.length})
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {previewData?.error && (
              <div className={styles.previewError}>
                <AlertTriangle size={16} />
                {previewData.error}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.cardActions}>
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        
        <button 
          className={styles.previewButton}
          onClick={onPreview}
          disabled={previewLoading}
        >
          {previewLoading ? (
            <>
              <div className={styles.miniSpinner}></div>
              Previewing...
            </>
          ) : (
            <>
              <Eye size={16} />
              Preview
            </>
          )}
        </button>
        
        <button 
          className={styles.createButton}
          onClick={onCreate}
        >
          <Plus size={16} />
          Create Segment
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SegmentTemplates;