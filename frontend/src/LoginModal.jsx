import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const LoginModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle, setUser } = useAuth();
  
  const [view, setView] = useState('login'); // login, signup, verify-otp, forgot-password, reset-password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setView('login');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setError('');
      setMessage('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      onClose();
    } else {
      setError('Google Login failed. Please try again.');
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setMessage('');
    if (newView !== 'verify-otp' && newView !== 'reset-password') {
      setOtp('');
    }
    if (newView === 'login' || newView === 'signup' || newView === 'forgot-password') {
       setPassword('');
       setConfirmPassword('');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, { name, email, password }, { withCredentials: true });
      switchView('verify-otp');
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
      setUser(res.data.user);
      onClose();
    } catch (err) {
      if (err.response?.data?.unverified) {
        switchView('verify-otp');
      } else {
        setError(err.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('OTP must be exactly 6 digits');
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
      setUser(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, { email }, { withCredentials: true });
      setResendTimer(60);
      setMessage('A new OTP has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email }, { withCredentials: true });
      switchView('reset-password');
      setResendTimer(60);
      setMessage('If the email is registered, a reset OTP has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('OTP must be exactly 6 digits');
    if (password.length < 8) return setError('New password must be at least 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { email, otp, newPassword: password }, { withCredentials: true });
      switchView('login');
      setMessage('Password reset successful. Please log in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
  const btnClass = "w-full py-3 rounded-xl bg-cyan-300 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-300/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl leading-none z-10 cursor-pointer"
          aria-label="Close"
        >&times;</button>

        <div className="text-center mb-6">
          <p className="text-[11px] tracking-[0.38em] uppercase text-cyan-400/90 mb-2">ParthRahi</p>
          <h2 className="text-2xl font-semibold text-white">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'verify-otp' && 'Verify Email'}
            {view === 'forgot-password' && 'Reset Password'}
            {view === 'reset-password' && 'New Password'}
          </h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm text-center">{message}</div>}

        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer">
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => switchView('forgot-password')} className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-700/50"></div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-slate-700/50"></div>
            </div>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login failed. Please try again.')}
                useOneTap={false}
                theme="filled_black"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            <p className="text-center text-sm text-slate-400">
              Don't have an account? <button onClick={() => switchView('signup')} className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer">Sign Up</button>
            </p>
          </>
        )}

        {/* --- SIGNUP VIEW --- */}
        {view === 'signup' && (
          <>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password (min 8 chars)" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer">
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer">
                  {showConfirmPassword ? "hide" : "show"}
                </button>
              </div>
              
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="my-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login failed.')}
                theme="filled_black"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <p className="text-center text-sm text-slate-400 mt-4">
              Already have an account? <button onClick={() => switchView('login')} className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer">Login</button>
            </p>
          </>
        )}

        {/* --- VERIFY OTP VIEW --- */}
        {view === 'verify-otp' && (
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-6">
              We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  required 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white text-2xl text-center tracking-[0.5em] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all" 
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className={btnClass}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            <div className="mt-6">
              <button 
                onClick={handleResendOtp} 
                disabled={resendTimer > 0 || loading} 
                className="text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
            <button onClick={() => switchView('login')} className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">Back to Login</button>
          </div>
        )}

        {/* --- FORGOT PASSWORD VIEW --- */}
        {view === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <p className="text-sm text-slate-400 text-center mb-2">Enter your email address to receive a password reset OTP.</p>
            <div>
              <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => switchView('login')} className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer">Back to Login</button>
            </div>
          </form>
        )}

        {/* --- RESET PASSWORD VIEW --- */}
        {view === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-slate-400 text-center mb-4">Enter the OTP sent to your email and your new password.</p>
            <div>
              <input 
                type="text" 
                maxLength={6}
                placeholder="6-digit OTP" 
                required 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                className={`${inputClass} tracking-widest text-center`} 
              />
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="New Password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer">
                {showPassword ? "hide" : "show"}
              </button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer">
                {showConfirmPassword ? "hide" : "show"}
              </button>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className={btnClass}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => switchView('login')} className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer">Cancel</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginModal;
