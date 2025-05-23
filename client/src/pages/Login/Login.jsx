import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.scss';
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
  Activity
} from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              <h2>Transform Customer Intelligence Into Revenue Growth</h2>
              <p>Join 500+ Fortune companies leveraging AI-powered segmentation to drive 40% higher conversion rates and unlock $2.3B in incremental revenue.</p>
            </div>

            {/* Premium Features */}
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <Brain size={24} />
                </div>
                <div className="feature-content">
                  <h4>Advanced ML Engine</h4>
                  <p>Proprietary algorithms with 96.7% accuracy across 50+ behavioral vectors</p>
                  <div className="feature-badge">Enterprise</div>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <Layers size={24} />
                </div>
                <div className="feature-content">
                  <h4>Real-time Segmentation</h4>
                  <p>Process 10M+ customer profiles with sub-second latency</p>
                  <div className="feature-badge">Premium</div>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <Globe size={24} />
                </div>
                <div className="feature-content">
                  <h4>Global Scale</h4>
                  <p>Multi-region deployment with 99.99% uptime SLA</p>
                  <div className="feature-badge">Enterprise</div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="brand-stats">
              <div className="stat-item">
                <div className="stat-number">$2.3B+</div>
                <div className="stat-label">Revenue Generated</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Enterprise Clients</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">96.7%</div>
                <div className="stat-label">ML Accuracy</div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <Shield size={16} />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="trust-item">
                <Activity size={16} />
                <span>99.99% Uptime SLA</span>
              </div>
              <div className="trust-item">
                <Globe size={16} />
                <span>GDPR & CCPA Compliant</span>
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

        {/* Right Side - Premium Login Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {/* Form Header */}
            <div className="form-header">
              <div className="welcome-badge">
                <Sparkles size={14} />
                <span>Welcome Back</span>
              </div>
              <h2>Sign in to your account</h2>
              <p>Access your SegmentIQ dashboard and continue building intelligent customer segments</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <div className="error-content">
                    <span className="error-title">Authentication Failed</span>
                    <span className="error-description">{error}</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
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
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <div className="input-icon">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
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
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Keep me signed in for 30 days</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <div className="button-content">
                  {isLoading ? (
                    <>
                      <RefreshCw size={20} className="spinning" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </div>
                <div className="button-glow"></div>
              </button>

              <div className="form-divider">
                <span>or continue with</span>
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
                New to SegmentIQ?{' '}
                <Link to="/signup" className="signup-link">
                  Start your free trial
                  <ArrowRight size={14} />
                </Link>
              </p>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <Shield size={18} />
              <div className="security-text">
                <span className="security-title">Enterprise Security</span>
                <span className="security-description">256-bit SSL encryption & SOC 2 compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;