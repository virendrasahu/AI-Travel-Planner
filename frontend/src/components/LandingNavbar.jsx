import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight } from 'lucide-react';
import NavUserGreeting from './NavUserGreeting';

const NAV_SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'how-it-works', label: 'How It Works' },
];

export default function LandingNavbar({
  token,
  userName,
  activeSection,
  onScrollToSection,
  onSignOut,
}) {
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

  const handleSectionClick = (e, sectionId) => {
    onScrollToSection(e, sectionId);
    closeMenu();
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/85 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center gap-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 lg:gap-3 cursor-pointer shrink-0 min-w-0"
          onClick={() => navigate('/')}
        >
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 lg:p-2.5 rounded-lg lg:rounded-xl shadow-md shadow-indigo-600/20">
            <Compass className="h-4 w-4 lg:h-6 lg:w-6 text-white animate-spin-slow" />
          </div>
          <span className="text-base lg:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Trao AI
          </span>
        </div>

        {/* Desktop center nav */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {token && (
            <>
              <Link
                to="/"
                className="text-sm font-bold text-indigo-600 bg-indigo-50/70 py-1.5 px-3 rounded-lg"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="text-sm text-slate-600 hover:text-slate-900 transition font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-100"
              >
                Dashboard
              </Link>
            </>
          )}
          {NAV_SECTIONS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => onScrollToSection(e, item.id)}
              className={`nav-section-link text-sm transition font-medium py-1.5 px-1 ${
                activeSection === item.id
                  ? 'nav-active text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          {token ? (
            <>
              <NavUserGreeting name={userName} className="text-sm" />
              <Link
                to="/dashboard"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-sm text-sm"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200 transition text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition flex items-center gap-2 shadow-sm text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile / tablet: username beside hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0 lg:hidden">
          {token && (
            <NavUserGreeting
              name={userName}
              className="text-xs sm:text-sm max-w-[88px] sm:max-w-[140px] md:max-w-[220px]"
            />
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
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
          mobileMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
        }`}
      >
        <div className={`px-4 sm:px-6 pb-4 ${mobileMenuOpen ? 'animate-slide-down' : ''}`}>
          {token && (
            <>
              <Link
                to="/"
                onClick={closeMenu}
                className="block py-3.5 text-sm font-bold text-indigo-600 border-b border-slate-100"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="block py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 border-b border-slate-100"
              >
                Dashboard
              </Link>
            </>
          )}

          {NAV_SECTIONS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleSectionClick(e, item.id)}
              className={`block py-3.5 text-sm font-medium border-b border-slate-100 transition ${
                activeSection === item.id
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </a>
          ))}

          {token ? (
            <>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="block w-full mt-3 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onSignOut();
                }}
                className="w-full mt-2 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl border border-slate-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="block py-3.5 text-sm font-semibold text-slate-600 hover:text-slate-900 border-b border-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="block w-full mt-3 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
