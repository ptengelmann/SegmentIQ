import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Signup.scss';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Database,
  Globe,
  Sparkles,
  Brain,
  Layers,
  Activity,
  User,
  Building,
  Check,
  X,
  Star,
  Crown,
  Rocket
} from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    company: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const navigate = useNavigate();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Password strength checker
  useEffect(() => {
    const checkPasswordStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };
    setPasswordStrength(checkPasswordStrength(form.password));
  }, [form.password]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const signupData = { ...form, plan: selectedPlan };
      const res = await axios.post('http://localhost:5000/api/auth/signup', signupData);
      
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response?.status === 409) {
        setError('An account with this email already exists');
      } else if (err.response?.status === 422) {
        setError('Please check your information and try again');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Signup failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return '#ef4444';
      case 1: return '#f97316';
      case 2: return '#eab308';
      case 3: return '#22c55e';
      case 4: return '#10b981';
      default: return '#e5e7eb';
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small teams',
      features: ['Up to 5K customers', 'Basic segmentation', 'Email support'],
      icon: <Rocket size={20} />,
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$99/mo',
      description: 'For growing businesses',
      features: ['Up to 100K customers', 'Advanced ML algorithms', 'Priority support', 'Custom integrations'],
      icon: <Star size={20} />,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Unlimited customers', 'White-label solution', 'Dedicated support', 'Custom ML training'],
      icon: <Crown size={20} />,
      popular: false
    }
  ];

  return (
    <div className="auth-page">
      {/* Enhanced Background */}
      <div className="auth-background">
        <div className="bg-gradient-primary"></div>
        <div className="bg-gradient-secondary"></div>
        <div className="bg-pattern-grid"></div>
        <div className="bg-pattern-dots"></div>
        
        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-icon" style={{top: '15%', left: '10%', animationDelay: '0s'}}>
            <Brain size={28} />
          </div>
          <div className="floating-icon" style={{top: '25%', right: '15%', animationDelay: '-1s'}}>
            <BarChart3 size={24} />
          </div>
          <div className="floating-icon" style={{top: '45%', left: '8%', animationDelay: '-2s'}}>
            <Target size={20} />
          </div>
          <div className="floating-icon" style={{top: '65%', right: '12%', animationDelay: '-3s'}}>
            <TrendingUp size={26} />
          </div>
          <div className="floating-icon" style={{top: '80%', left: '12%', animationDelay: '-4s'}}>
            <Users size={22} />
          </div>
          <div className="floating-icon" style={{top: '10%', right: '8%', animationDelay: '-5s'}}>
            <Database size={18} />
          </div>
        </div>

        {/* Animated Particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="auth-container">
        {/* Left Side - Enhanced Branding */}
        <div className="auth-brand">
          <div className="brand-content">
            {/* Premium Logo */}
            <div className="brand-logo">
              <div className="logo-icon">
                <Zap size={36} />
                <div className="logo-glow"></div>
              </div>
              <div className="logo-text">
                <h1>SegmentIQ</h1>
                <span>Enterprise AI Analytics Platform</span>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="brand-hero">
              <h2>Join 500+ Companies Driving Growth with AI</h2>
              <p>Start your free trial today and experience the power of advanced customer segmentation. No credit card required.</p>
            </div>

            {/* Success Stories */}
            <div className="success-stories">
              <div className="story-item">
                <div className="story-metric">+247%</div>
                <div className="story-description">Conversion Rate Increase</div>
                <div className="story-company">— Fortune 500 Retailer</div>
              </div>
              
              <div className="story-item">
                <div className="story-metric">$12M</div>
                <div className="story-description">Additional Revenue in Q1</div>
                <div className="story-company">— SaaS Company</div>
              </div>
              
              <div className="story-item">
                <div className="story-metric">89%</div>
                <div className="story-description">Reduction in Churn Rate</div>
                <div className="story-company">— E-commerce Platform</div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <Shield size={16} />
                <span>Enterprise Security</span>
              </div>
              <div className="trust-item">
                <Activity size={16} />
                <span>99.99% Uptime</span>
              </div>
              <div className="trust-item">
                <Globe size={16} />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Live Status */}
          <div className="system-status">
            <div className="status-header">
              <div className="status-indicator online"></div>
              <span>All Systems Operational</span>
              <div className="status-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {/* Right Side - Premium Signup Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {/* Form Header */}
            <div className="form-header">
              <div className="welcome-badge">
                <Sparkles size={14} />
                <span>Start Free Trial</span>
              </div>
              <h2>Create your account</h2>
              <p>Join thousands of companies using SegmentIQ to grow their business</p>
            </div>

            {/* Plan Selection */}
            <div className="plan-selection">
              <h3>Choose your plan</h3>
              <div className="plans-grid">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && <div className="popular-badge">Most Popular</div>}
                    <div className="plan-icon">{plan.icon}</div>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-price">{plan.price}</div>
                    <div className="plan-description">{plan.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <div className="error-content">
                    <span className="error-title">Registration Failed</span>
                    <span className="error-description">{error}</span>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-group">
                    <div className="input-icon">
                      <User size={20} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className={error ? 'error' : ''}
                    />
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <div className="input-group">
                    <div className="input-icon">
                      <Building size={20} />
                    </div>
                    <input
                      id="company"
                      type="text"
                      name="company"
                      placeholder="Company name"
                      value={form.company}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className={error ? 'error' : ''}
                    />
                    <div className="input-highlight"></div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Work Email</label>
                <div className="input-group">
                  <div className="input-icon">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your work email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={error ? 'error' : ''}
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <div className="input-group">
                  <div className="input-icon">
                    <Target size={20} />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={error ? 'error' : ''}
                  >
                    <option value="">Select your role</option>
                    <option value="ceo">CEO/Founder</option>
                    <option value="cmo">Chief Marketing Officer</option>
                    <option value="marketing-director">Marketing Director</option>
                    <option value="data-analyst">Data Analyst</option>
                    <option value="product-manager">Product Manager</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <div className="input-icon">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={error ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="input-highlight"></div>
                </div>
                
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${(passwordStrength / 4) * 100}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      ></div>
                    </div>
                    <div className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">
                    I agree to the <Link to="/terms" className="link">Terms of Service</Link> and <Link to="/privacy" className="link">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || !agreedToTerms}
              >
                <div className="button-content">
                  {isLoading ? (
                    <>
                      <RefreshCw size={20} className="spinning" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Free Trial</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </div>
                <div className="button-glow"></div>
              </button>

              <div className="form-divider">
                <span>or sign up with</span>
              </div>

              {/* Social Login */}
              <div className="social-login">
                <button type="button" className="social-btn google">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google Workspace</span>
                </button>

                <button type="button" className="social-btn microsoft">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#00BCF2" d="M0 0h11.5v11.5H0z"/>
                    <path fill="#00B04F" d="M12.5 0H24v11.5H12.5z"/>
                    <path fill="#FFB900" d="M0 12.5h11.5V24H0z"/>
                    <path fill="#F25022" d="M12.5 12.5H24V24H12.5z"/>
                  </svg>
                  <span>Microsoft 365</span>
                </button>
              </div>
            </form>

            {/* Form Footer */}
            <div className="form-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="signin-link">
                  Sign in here
                  <ArrowRight size={14} />
                </Link>
              </p>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <Shield size={18} />
              <div className="security-text">
                <span className="security-title">Enterprise Security</span>
                <span className="security-description">Your data is protected with bank-level encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;