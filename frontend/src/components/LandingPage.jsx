import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Map, Sun, ArrowRight, DollarSign, Compass } from 'lucide-react';
import LandingNavbar from './LandingNavbar';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const token = localStorage.getItem('token');

  const bannerImg = "https://images.pexels.com/photos/15693280/pexels-photo-15693280.jpeg?_gl=1*z79qpe*_ga*MjQ0NzIwMzMwLjE3ODE5NjU1MzY.*_ga_8JE65Q40S6*czE3ODE5NjU1MzYkbzEkZzEkdDE3ODE5NjU2MzIkajQzJGwwJGgw";

  const scrollToSection = useCallback((e, sectionId) => {
    e.preventDefault();

    const section = document.getElementById(sectionId);
    if (!section) return;

    const headerOffset = 80;
    const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top, behavior: 'smooth' });
    setActiveSection(sectionId);

    section.classList.remove('section-nav-target');
    void section.offsetWidth;
    section.classList.add('section-nav-target');

    section.addEventListener(
      'animationend',
      () => section.classList.remove('section-nav-target'),
      { once: true }
    );
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('.landing-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-90px 0px -10% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!token) return;

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          const displayName = user.name || user.email?.split('@')[0];
          if (displayName) {
            localStorage.setItem('userName', displayName);
            setUserName(displayName);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-55 text-slate-800 flex flex-col justify-between">

      <LandingNavbar
        token={token}
        userName={userName}
        activeSection={activeSection}
        onScrollToSection={scrollToSection}
        onSignOut={handleSignOut}
      />

      {/* Spacer for fixed navbar height */}
      <div className="h-14 lg:h-16 shrink-0" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

        {/* Full-bleed background with overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImg}
            alt="Scenic Travel Banner"
            className="w-full h-full object-cover filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30" />
        </div>

        {/* Content Panel */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/90 border border-indigo-500/20 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Empowered by Google Gemini 2.5 Flash
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-md">
            Your Next Adventure, <br />
            <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Tailored by Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-white font-light leading-relaxed drop-shadow-md">
            Generate customized day-by-day itineraries, estimate budgets, discover hotels, and auto-generate weather-aware packing lists instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to={token ? "/dashboard" : "/register"}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2"
            >
              Start Planning Free <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-350 text-slate-705 hover:text-slate-900 font-semibold py-4 px-8 rounded-xl transition flex justify-center items-center hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="landing-section scroll-mt-24 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative bg-slate-50 overflow-x-hidden">

        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600">Core Services</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-slate-900">Smart Travel Framework</p>
          <p className="text-slate-550 text-base sm:text-lg">Everything you need to plan, structure, and modify your trips in a secure environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-indigo-200 transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden">
            <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-6 text-blue-600 group-hover:scale-110 transition duration-300">
              <Map className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Itinerary Generation</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
              Dynamically build deep day-by-day travel schedules based on destination, travel length, and specific hobbies or interests.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-indigo-200 transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden">
            <div className="bg-emerald-100 p-4 rounded-2xl w-fit mb-6 text-emerald-600 group-hover:scale-110 transition duration-300">
              <DollarSign className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Financial Cost Ledger</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
              Estimate accommodation, transport, food, and activities budgets. Recalculates in real-time as you add or remove plans.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-indigo-200 transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden">
            <div className="bg-purple-100 p-4 rounded-2xl w-fit mb-6 text-purple-605 group-hover:scale-110 transition duration-300">
              <Sun className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Weather-Aware Pack Assistant</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
              An intelligent assistant cross-referencing your travel destination season with the itinerary to checklist crucial gear, documents, and wear.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section id="destinations" className="landing-section scroll-mt-24 py-24 bg-slate-100/50 border-y border-slate-200/75 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-650 mb-2">Featured Enclaves</h2>
              <p className="text-3xl sm:text-5xl font-extrabold text-slate-900">Popular Destinations</p>
            </div>
            <p className="text-slate-550 max-w-md text-sm sm:text-base">
              Travelers are leveraging Trao AI to schedule trips to diverse historical, cultural, and tropical coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tokyo */}
            <div className="group rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition duration-305 flex flex-col justify-between">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Tokyo"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm border border-slate-100">
                  Asia
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="text-xl font-bold text-slate-905">Tokyo, Japan</h4>
                <p className="text-sm text-slate-550">Perfect for tech exploration, ancient temples, sushi tasting, and neon lights.</p>
              </div>
            </div>

            {/* Paris */}
            <div className="group rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition duration-305 flex flex-col justify-between">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Paris"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm border border-slate-100">
                  Europe
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="text-xl font-bold text-slate-905">Paris, France</h4>
                <p className="text-sm text-slate-550">Discover museum masterpieces, cozy patisseries, classical architecture, and the Eiffel Tower.</p>
              </div>
            </div>

            {/* Rome */}
            <div className="group rounded-3xl overflow-hidden border border-slate-205 bg-white shadow-sm hover:shadow-md transition duration-305 flex flex-col justify-between">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Rome"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-505"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm border border-slate-100">
                  Europe
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="text-xl font-bold text-slate-905">Rome, Italy</h4>
                <p className="text-sm text-slate-550">Walk inside colosseum paths, explore Vatican galleries, and taste world-class gelato.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="landing-section scroll-mt-24 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-x-hidden">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600">Workflow</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-slate-900">How It Works</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto bg-white border border-slate-202 shadow-sm rounded-2xl w-16 h-16 flex items-center justify-center text-xl font-bold text-indigo-600">1</div>
            <h4 className="text-lg font-bold text-slate-900">Sign Up</h4>
            <p className="text-sm text-slate-500 font-light">Create a secure profile that isolates your travel plans.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto bg-white border border-slate-202 shadow-sm rounded-2xl w-16 h-16 flex items-center justify-center text-xl font-bold text-indigo-600">2</div>
            <h4 className="text-lg font-bold text-slate-900">Set Preferences</h4>
            <p className="text-sm text-slate-500 font-light">Choose destination, duration, budget tier, and interests.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto bg-white border border-slate-202 shadow-sm rounded-2xl w-16 h-16 flex items-center justify-center text-xl font-bold text-indigo-600">3</div>
            <h4 className="text-lg font-bold text-slate-900">Review & Customize</h4>
            <p className="text-sm text-slate-500 font-light">Modify schedules, regenerate specific days, and view recommendations.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto bg-white border border-slate-202 shadow-sm rounded-2xl w-16 h-16 flex items-center justify-center text-xl font-bold text-indigo-600">4</div>
            <h4 className="text-lg font-bold text-slate-900">Pack & Travel</h4>
            <p className="text-sm text-slate-500 font-light">Check off your weather-aware packing list items as you prepare.</p>
          </div>
        </div>
      </section>

      {/* Premium Dark Accent Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-12 text-slate-350">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2 rounded-lg text-white">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white">Trao AI Travel Planner</span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm text-center">
            &copy; {new Date().getFullYear()} Trao AI. Developed for modern secure travel planning. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
