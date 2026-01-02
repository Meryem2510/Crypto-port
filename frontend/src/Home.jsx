import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from './services/api';

const LoginModal = ({ 
  onClose, 
  loginEmail, 
  setLoginEmail, 
  loginPassword, 
  setLoginPassword, 
  loginError, 
  loginLoading, 
  handleLoginSubmit,
  onSwitchToRegister 
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
      </div>
      
      {loginError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
          {loginError}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input 
            type="email" 
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input 
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button 
          onClick={handleLoginSubmit}
          disabled={loginLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
        >
          {loginLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
      
      <p className="text-center text-slate-400 mt-6">
        Don't have an account? 
        <button 
          onClick={onSwitchToRegister}
          className="text-purple-400 hover:text-purple-300 ml-1 font-semibold"
        >
          Sign Up
        </button>
      </p>
    </div>
  </div>
);

// Move the RegisterModal component OUTSIDE
const RegisterModal = ({ 
  onClose, 
  registerName,
  setRegisterName,
  registerEmail, 
  setRegisterEmail, 
  registerPassword, 
  setRegisterPassword,
  registerConfirmPassword,
  setRegisterConfirmPassword,
  registerError, 
  registerLoading, 
  handleRegisterSubmit,
  onSwitchToLogin 
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create Account</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
      </div>
      
      {registerError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
          {registerError}
        </div>
      )}
      
      <div className="space-y-4">
        {/* <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input 
            type="text"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div> */}
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input 
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input 
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
          <input 
            type="password"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button 
          onClick={handleRegisterSubmit}
          disabled={registerLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
        >
          {registerLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
      
      <p className="text-center text-slate-400 mt-6">
        Already have an account? 
        <button 
          onClick={onSwitchToLogin}
          className="text-purple-400 hover:text-purple-300 ml-1 font-semibold"
        >
          Sign In
        </button>
      </p>
    </div>
  </div>
);

export default function CryptoLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const data = await login(loginEmail, loginPassword);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem('user_email', loginEmail); // Store email

      navigate('/dashboard');
    } catch (error) {
      setLoginError(error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  setRegisterError('');

  if (registerPassword !== registerConfirmPassword) {
    setRegisterError('Passwords do not match');
    return;
  }

  setRegisterLoading(true);

  try {
    // Only register, don't auto-login
    await register(registerEmail, registerPassword);
    
    // Close register modal and open login modal
    setShowRegister(false);
    setShowLogin(true);
    
    // Pre-fill the email in login form
    setLoginEmail(registerEmail);
    setRegisterError('');
    
  } catch (error) {
    setRegisterError(error);
  } finally {
    setRegisterLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
            ₿
          </div>
          <span className="text-2xl font-bold">CryptoFolio</span>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowLogin(true)}
            className="px-6 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all font-semibold"
          >
            Login
          </button>
          <button 
            onClick={() => setShowRegister(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
          Track Your Crypto
          <br />
          Portfolio in Real-Time
        </h1>
        
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          Monitor your investments, analyze trends, and make informed decisions with our powerful crypto portfolio management platform.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button 
            onClick={() => setShowRegister(true)}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-semibold text-lg shadow-lg shadow-purple-500/50"
          >
            Get Started Free
          </button>
          <button className="px-8 py-4 rounded-lg border border-white/20 hover:bg-white/10 transition-all font-semibold text-lg">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl mb-4">
              📊
            </div>
            <h3 className="text-2xl font-bold mb-3">Real-Time Tracking</h3>
            <p className="text-slate-400">
              Monitor your portfolio value and individual asset performance with live price updates and interactive charts.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl mb-4">
              🔔
            </div>
            <h3 className="text-2xl font-bold mb-3">Price Alerts</h3>
            <p className="text-slate-400">
              Set custom price alerts and get notified instantly when your favorite cryptocurrencies hit your target prices.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl mb-4">
              🔒
            </div>
            <h3 className="text-2xl font-bold mb-3">Secure & Private</h3>
            <p className="text-slate-400">
              Your data is encrypted and secured with industry-leading security protocols. Your privacy is our priority.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2.5B+</div>
              <div className="text-slate-400">Assets Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-slate-400">Cryptocurrencies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-slate-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Ready to Start Trading Smarter?
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          Join thousands of traders who trust CryptoFolio to manage their digital assets.
        </p>
        <button 
          onClick={() => setShowRegister(true)}
          className="px-12 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-semibold text-lg shadow-lg shadow-purple-500/50"
        >
          Create Free Account
        </button>
      </div>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginError={loginError}
          loginLoading={loginLoading}
          handleLoginSubmit={handleLoginSubmit}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
        />
      )}
      
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          registerName={registerName}
          setRegisterName={setRegisterName}
          registerEmail={registerEmail}
          setRegisterEmail={setRegisterEmail}
          registerPassword={registerPassword}
          setRegisterPassword={setRegisterPassword}
          registerConfirmPassword={registerConfirmPassword}
          setRegisterConfirmPassword={setRegisterConfirmPassword}
          registerError={registerError}
          registerLoading={registerLoading}
          handleRegisterSubmit={handleRegisterSubmit}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      )}
    </div>
  );
}