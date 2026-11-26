import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  User as UserIcon, 
  LogOut, 
  Calendar, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  Briefcase,
  Crown
} from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, logout, isManager, isSuperAdmin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  HEAVEN<span className="gradient-text">HOMES</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium">Luxury Stays & Hotels</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Browse Hotels
              </Link>
              {user && (
                <Link 
                  to="/my-bookings" 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === '/my-bookings' 
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
              )}
              {isManager && (
                <Link 
                  to="/manager" 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname.startsWith('/manager') 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  Manager Portal
                </Link>
              )}
              {isSuperAdmin && (
                <Link 
                  to="/admin" 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  Admin Portal
                </Link>
              )}
            </nav>

            {/* Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-slate-200 hover:text-white text-sm font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all duration-200"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openAuth('login')} 
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuth('signup')} 
                    className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-slate-800 px-4 py-6 space-y-4">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Browse Hotels
            </Link>
            {user && (
              <>
                <Link 
                  to="/my-bookings" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                >
                  My Bookings
                </Link>
                {isManager && (
                  <Link 
                    to="/manager" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-base font-medium text-amber-300 hover:bg-amber-500/10"
                  >
                    💼 Manager Portal
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                >
                  My Profile & Guests
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-base font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </>
            )}
            {!user && (
              <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={() => openAuth('login')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-center font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  className="w-full gradient-btn py-2.5 rounded-xl text-center font-medium"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Login & Signup Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
};

export default Navbar;
