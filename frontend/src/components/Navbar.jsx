import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, LogOut } from 'lucide-react';
import CurrencyToggle from './CurrencyToggle';
import NavUserGreeting from './NavUserGreeting';

export default function Navbar({ userName, currency, toggleCurrency, onSignOut }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
    >
      {/* Main navbar bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center gap-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 lg:gap-3 cursor-pointer shrink-0 min-w-0"
          onClick={() => navigate('/')}
        >
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 lg:p-2 rounded-lg lg:rounded-xl text-white">
            <Compass className="h-4 w-4 lg:h-5 lg:w-5" />
          </div>
          <div>
            <h1 className="text-sm lg:text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Trao AI
            </h1>
            <p className="hidden sm:block text-[9px] text-slate-400 tracking-wider font-mono">
              ENCLAVE SECURE
            </p>
          </div>
        </div>

        {/* Desktop center nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition py-1.5 px-3 rounded-lg hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-bold text-indigo-600 bg-indigo-50/70 py-1.5 px-3 rounded-lg"
          >
            Dashboard
          </Link>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <NavUserGreeting name={userName} className="text-sm" />
          <CurrencyToggle currency={currency} toggleCurrency={toggleCurrency} />
          <button
            type="button"
            onClick={onSignOut}
            className="bg-slate-900 hover:bg-slate-800 text-white transition px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>

        {/* Mobile / tablet: username beside hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0 lg:hidden">
          <NavUserGreeting
            name={userName}
            className="text-xs sm:text-sm max-w-[88px] sm:max-w-[140px] md:max-w-[220px]"
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`lg:hidden overflow-hidden border-t border-slate-200/80 bg-white transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
        }`}
      >
        <nav
          className={`px-4 sm:px-6 pb-4 ${mobileMenuOpen ? 'animate-slide-down' : ''}`}
        >
          <Link
            to="/"
            onClick={closeMenu}
            className="block py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="block py-3.5 text-sm font-bold text-indigo-600 border-b border-slate-100"
          >
            Dashboard
          </Link>

          <div className="py-3.5 border-b border-slate-100">
            <CurrencyToggle
              currency={currency}
              toggleCurrency={toggleCurrency}
              showLabel
            />
          </div>

          <button
            type="button"
            onClick={() => {
              closeMenu();
              onSignOut();
            }}
            className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white transition py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
