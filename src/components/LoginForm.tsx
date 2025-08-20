import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('📝 Form submitted with:', { email, password: password ? '***' : 'empty' });
    
    const success = await login(email, password);
    console.log('🎯 Login result:', success);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const demoAccounts = [
    { email: 'admin@usaii.org', role: 'Admin' },
    { email: 'creator@usaii.org', role: 'Creator' },
    { email: 'student@usaii.org', role: 'Student' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 rounded-2xl inline-block mb-6 backdrop-blur-sm border border-white/10">
            <BookOpen size={48} className="text-white drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">USAII Labs</h1>
          <p className="text-purple-100 text-lg font-medium">AI-Powered Learning Platform</p>
          <p className="text-blue-200 text-sm mt-2 opacity-90">Empowering the next generation of AI innovators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 z-10" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-300"
              placeholder="Email address"
              required
            />
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-300"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-blue-600 py-4 rounded-lg font-bold hover:bg-gray-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner w-5 h-5 mr-3"></div>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-sm text-blue-200 text-center mb-4">Demo Accounts (any password works):</p>
          <p className="text-xs text-blue-300 text-center mb-4">
            Note: Only verified and active users can login. New and disabled users cannot access the system.
          </p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('demo');
                }}
                className="w-full text-left px-4 py-3 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white border border-white/10 hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-200 text-xs uppercase">{account.role}</span>
                    <div className="text-white">{account.email}</div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;