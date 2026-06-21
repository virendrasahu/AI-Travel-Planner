import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Plus, Trash2, RefreshCw, Check, CheckSquare, Square,
  DollarSign, MapPin, Calendar, Briefcase, CloudRain,
  Menu, X, Loader2, Info, ListChecks, Award, Train, Utensils,
  Shield, Globe, Phone, ExternalLink, Navigation
} from 'lucide-react';

import { useCurrency } from './CurrencyToggle';
import CreateTripForm from './CreateTripForm';
import Navbar from './Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currency, toggleCurrency, convert } = useCurrency();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);

  // New trip form state
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Inline activity forms state
  const [newActivityName, setNewActivityName] = useState('');
  const [targetDay, setTargetDay] = useState(1);

  // Day Regeneration modal state
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenDayNumber, setRegenDayNumber] = useState(1);
  const [regenInstructions, setRegenInstructions] = useState('');

  // Mobile menu / sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  // Authenticate user check and retrieve User Isolated Saved Trips
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    } else {
      const fetchUserProfile = async () => {
        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
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
    }

    fetchUserTrips();
  }, [navigate]);

  const fetchUserTrips = async (selectId = null) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
        if (data.length > 0) {
          if (selectId) {
            const found = data.find(t => t._id === selectId);
            setSelectedTrip(found || data[0]);
          } else {
            setSelectedTrip(data[0]);
          }
        } else {
          setSelectedTrip(null);
        }
      }
    } catch (err) {
      console.error('Failed to query user records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (formData) => {
    setGenerateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newTrip = await res.json();
        setShowCreateForm(false);
        await fetchUserTrips(newTrip._id);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to create trip:', err.message || res.statusText);
      }
    } catch (err) {
      console.error('Failed to create trip', err);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const nextTrips = trips.filter(t => t._id !== tripId);
        setTrips(nextTrips);
        if (selectedTrip?._id === tripId) {
          setSelectedTrip(nextTrips.length > 0 ? nextTrips[0] : null);
        }
      }
    } catch (err) {
      console.error('Failed to delete trip', err);
    }
  };

  const handleAddActivity = async (dayNum) => {
    if (!newActivityName.trim() || !selectedTrip) return;

    const updatedItinerary = selectedTrip.itinerary.map(day => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          activities: [
            ...day.activities,
            {
              title: newActivityName,
              description: 'Added by traveler',
              estimatedCostUSD: selectedTrip.budgetTier === 'Low' ? 10 : selectedTrip.budgetTier === 'High' ? 45 : 20,
              timeOfDay: 'Afternoon'
            }
          ]
        };
      }
      return day;
    });

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itinerary: updatedItinerary })
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
        setTrips(trips.map(t => t._id === updatedData._id ? updatedData : t));
        setNewActivityName('');
      }
    } catch (err) {
      console.error('Dynamic update failed', err);
    }
  };

  const handleRemoveActivity = async (dayNum, actIndex) => {
    if (!selectedTrip) return;

    const updatedItinerary = selectedTrip.itinerary.map(day => {
      if (day.dayNumber === dayNum) {
        const activities = [...day.activities];
        activities.splice(actIndex, 1);
        return { ...day, activities };
      }
      return day;
    });

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itinerary: updatedItinerary })
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
        setTrips(trips.map(t => t._id === updatedData._id ? updatedData : t));
      }
    } catch (err) {
      console.error('Activity removal failed', err);
    }
  };

  const togglePackingItem = async (itemId) => {
    if (!selectedTrip) return;

    const updatedPacking = selectedTrip.packingList.map(item => {
      if (item._id === itemId) {
        return { ...item, isPacked: !item.isPacked };
      }
      return item;
    });

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packingList: updatedPacking })
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
        setTrips(trips.map(t => t._id === updatedData._id ? updatedData : t));
      }
    } catch (err) {
      console.error('Checkbox updates failed', err);
    }
  };

  const handleRegenerateDay = async (e) => {
    e.preventDefault();
    if (!regenInstructions.trim() || !selectedTrip) return;

    setRegenerateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/trips/${selectedTrip._id}/regenerate-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dayNumber: regenDayNumber,
          prompt: regenInstructions
        })
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
        setTrips(trips.map(t => t._id === updatedData._id ? updatedData : t));
        setShowRegenModal(false);
        setRegenInstructions('');
      }
    } catch (err) {
      console.error('Day regeneration failed', err);
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const tripRate = selectedTrip?.usdToInrRate ?? 83;
  const priceSymbol = currency === 'INR' ? '₹' : '$';
  const fmt = (amount) => `${priceSymbol}${convert(amount, tripRate)}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-55 text-slate-800 flex-col gap-4">
        <Loader2 className="h-10 w-10 text-indigo-650 animate-spin" />
        <p className="text-xl animate-pulse text-slate-500">Loading secure user vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      <Navbar
        userName={userName}
        currency={currency}
        toggleCurrency={toggleCurrency}
        onSignOut={handleSignOut}
      />

      {/* Main Grid Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left column: Sidebar containing Trip List & Ledger - Hidden on mobile */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-24">
          <SidebarContent
            trips={trips}
            selectedTrip={selectedTrip}
            setSelectedTrip={setSelectedTrip}
            setShowCreateForm={setShowCreateForm}
            handleDeleteTrip={handleDeleteTrip}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] bg-white border-r border-slate-205 p-6 flex flex-col justify-between h-full shadow-2xl z-10 animate-slide-in">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex-1 flex flex-col gap-6 mt-6 overflow-y-auto">
                <SidebarContent
                  trips={trips}
                  selectedTrip={selectedTrip}
                  setSelectedTrip={(trip) => {
                    setSelectedTrip(trip);
                    setMobileSidebarOpen(false);
                  }}
                  setShowCreateForm={() => {
                    setShowCreateForm(true);
                    setMobileSidebarOpen(false);
                  }}
                  handleDeleteTrip={(id) => {
                    handleDeleteTrip(id);
                    setMobileSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right column: Main Dashboard content area */}
        <div className="lg:col-span-2 space-y-6">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Menu className="h-4 w-4" /> My Trips
          </button>

          {selectedTrip ? (
            <>
              {/* Trip Metadata Header Card - Dark accent */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/10 text-xs font-semibold text-indigo-300">
                    <MapPin className="h-3 w-3 text-indigo-400" /> Selected Target
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    {selectedTrip.from ? `${selectedTrip.from} → ${selectedTrip.destination}` : selectedTrip.destination}
                  </h2>
                  <p className="text-sm text-slate-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400" /> {selectedTrip.durationDays} Days • <Briefcase className="h-4 w-4 text-blue-400" /> {selectedTrip.budgetTier} Budget
                  </p>
                </div>

                {/* Estimated Total Card */}
                <div className="flex flex-col gap-1 text-right bg-slate-100/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 self-stretch sm:self-auto justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated Total</span>
                  <span className="text-2xl font-black text-slate-900">{fmt(selectedTrip.estimatedBudget?.total ?? 0)}</span>
                </div>
              </div>

              {/* Trip Summary */}
              {selectedTrip.tripSummary && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-600" /> Trip Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedTrip.tripSummary.bestTimeToVisit && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                        <span className="text-xs text-slate-500 font-semibold">Best Time to Visit</span>
                        <p className="text-sm font-bold mt-1 text-slate-800">{selectedTrip.tripSummary.bestTimeToVisit}</p>
                      </div>
                    )}
                    {selectedTrip.tripSummary.language && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                        <span className="text-xs text-slate-500 font-semibold">Language</span>
                        <p className="text-sm font-bold mt-1 text-slate-800">{selectedTrip.tripSummary.language}</p>
                      </div>
                    )}
                    {selectedTrip.tripSummary.currency && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                        <span className="text-xs text-slate-500 font-semibold">Currency</span>
                        <p className="text-sm font-bold mt-1 text-slate-800">{selectedTrip.tripSummary.currency}</p>
                      </div>
                    )}
                    {selectedTrip.tripSummary.timeZone && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                        <span className="text-xs text-slate-500 font-semibold">Time Zone</span>
                        <p className="text-sm font-bold mt-1 text-slate-800">{selectedTrip.tripSummary.timeZone}</p>
                      </div>
                    )}
                  </div>
                  {selectedTrip.tripSummary.emergencyNumbers && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Emergency Numbers
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(selectedTrip.tripSummary.emergencyNumbers).map(([key, value]) => (
                          <span key={key} className="text-xs bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-lg font-semibold capitalize">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Financial Cost Ledger Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-600" /> Financial Cost Ledger
                </h3>

                {currency === 'INR' && (
                  <p className="text-xs text-indigo-600 font-semibold mb-3">
                    1 USD = ₹{tripRate}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Transport', value: selectedTrip.estimatedBudget?.transport },
                    { label: 'Lodging', value: selectedTrip.estimatedBudget?.accommodation },
                    { label: 'Food', value: selectedTrip.estimatedBudget?.food },
                    { label: 'Activities', value: selectedTrip.estimatedBudget?.activities },
                    { label: 'Shopping', value: selectedTrip.estimatedBudget?.shopping },
                    { label: 'Misc', value: selectedTrip.estimatedBudget?.misc },
                  ].filter((item) => item.value != null).map((item) => (
                    <div key={item.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col justify-between shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold">{item.label}</span>
                      <span className="text-xl font-bold mt-2 text-slate-800">{fmt(item.value)}</span>
                    </div>
                  ))}
                </div>

                {selectedTrip.estimatedBudget?.budgetTips?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Budget Tips</p>
                    <ul className="space-y-1.5">
                      {selectedTrip.estimatedBudget.budgetTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-indigo-500 font-bold shrink-0">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Transportation */}
              {selectedTrip.transportation && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Train className="h-5 w-5 text-indigo-600" /> Transportation
                  </h3>

                  {selectedTrip.transportation.fromToDestination?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        {selectedTrip.from || 'Origin'} → {selectedTrip.destination}
                      </p>
                      <div className="space-y-3">
                        {selectedTrip.transportation.fromToDestination.map((leg, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-bold text-sm text-slate-900">{leg.mode} — {leg.operator}</span>
                                <p className="text-xs text-slate-500 mt-1">Duration: {leg.duration}</p>
                                {leg.bookingTip && <p className="text-xs text-indigo-600 mt-1">{leg.bookingTip}</p>}
                              </div>
                              <span className="text-sm font-bold text-slate-800 shrink-0">{fmt(leg.estimatedCostUSD)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTrip.transportation.localTransport?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Local Transport</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTrip.transportation.localTransport.map((local, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-sm text-slate-900">{local.mode}</span>
                              <span className="text-xs font-bold text-slate-700">{fmt(local.estimatedCostPerDayUSD)}/day</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{local.usedFor}</p>
                            {local.tip && <p className="text-xs text-indigo-600 mt-1">{local.tip}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Day-by-Day Timeline Board */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3 flex justify-between items-center">
                  <span>Day-by-Day Timeline</span>
                  <span className="text-xs font-bold text-slate-405">INJECT OR CUSTOMIZE</span>
                </h3>

                <div className="space-y-8">
                  {selectedTrip.itinerary.map((day) => (
                    <div key={day.dayNumber} className="border-l-2 border-indigo-400/40 pl-6 relative pb-2">
                      {/* Timeline dot */}
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white rounded-full border-4 border-indigo-600 shadow-sm" />

                      {/* Day Header with Regeneration Action */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-800">Day {day.dayNumber}</h4>
                          {day.dayTheme && (
                            <p className="text-xs text-indigo-600 font-semibold mt-0.5">{day.dayTheme}</p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setRegenDayNumber(day.dayNumber);
                            setShowRegenModal(true);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border border-indigo-100 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="h-3 w-3" /> Regenerate Day
                        </button>
                      </div>

                      {/* Activities stack */}
                      <div className="space-y-3 mb-4">
                        {day.activities && day.activities.length > 0 ? (
                          day.activities.map((act, index) => (
                            <div key={index} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-150 flex justify-between items-start group hover:border-slate-300 hover:bg-slate-50 transition shadow-xs">
                              <div className="space-y-1 pr-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900">{act.title}</span>
                                  <span className="text-[10px] bg-white border border-slate-205 text-slate-500 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    {act.timeOfDay}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-505 leading-relaxed font-light">{act.description}</p>
                                {(act.location || act.duration) && (
                                  <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                                    {act.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {act.location}</span>}
                                    {act.duration && <span>• {act.duration}</span>}
                                  </p>
                                )}
                                {act.tips && (
                                  <p className="text-[11px] text-indigo-600 mt-1 italic">{act.tips}</p>
                                )}
                                {act.mapsSearchQuery && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.mapsSearchQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 mt-1 font-semibold"
                                  >
                                    <Navigation className="h-3 w-3" /> Open in Maps <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {act.estimatedCostUSD > 0 && (
                                  <span className="text-xs font-bold text-slate-650 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                    {fmt(act.estimatedCostUSD)}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleRemoveActivity(day.dayNumber, index)}
                                  className="text-slate-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-slate-105 transition md:opacity-0 md:group-hover:opacity-100"
                                  title="Delete Activity"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No scheduled activities for this day. Append one below!</p>
                        )}
                      </div>

                      {/* Meals for the day */}
                      {day.meals && day.meals.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <Utensils className="h-3.5 w-3.5" /> Meal Recommendations
                          </p>
                          <div className="space-y-2">
                            {day.meals.map((meal, mealIdx) => (
                              <div key={mealIdx} className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex justify-between items-start gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                      {meal.mealTime}
                                    </span>
                                    <span className="font-bold text-sm text-slate-900">{meal.restaurantName}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{meal.cuisine}{meal.mustTry ? ` • Must try: ${meal.mustTry}` : ''}</p>
                                  {meal.location && <p className="text-[11px] text-slate-400 mt-0.5">{meal.location}</p>}
                                </div>
                                {meal.estimatedCostUSD > 0 && (
                                  <span className="text-xs font-bold text-slate-700 shrink-0">{fmt(meal.estimatedCostUSD)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Daily cost breakdown */}
                      {day.dailyCostBreakdown && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {[
                            { label: 'Activities', value: day.dailyCostBreakdown.activities },
                            { label: 'Meals', value: day.dailyCostBreakdown.meals },
                            { label: 'Transport', value: day.dailyCostBreakdown.transport },
                            { label: 'Misc', value: day.dailyCostBreakdown.misc },
                          ].filter((item) => item.value != null).map((item) => (
                            <span key={item.label} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
                              {item.label}: {fmt(item.value)}
                            </span>
                          ))}
                          {day.dailyCostBreakdown.dayTotal != null && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                              Day Total: {fmt(day.dailyCostBreakdown.dayTotal)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Add Activity Inline Form */}
                      <div className="flex items-center gap-2 max-w-md mt-3 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          placeholder="Inject new activity title..."
                          value={targetDay === day.dayNumber ? newActivityName : ''}
                          onChange={(e) => {
                            setTargetDay(day.dayNumber);
                            setNewActivityName(e.target.value);
                          }}
                          className="bg-transparent text-xs px-3 py-2 focus:outline-none w-full text-slate-800 placeholder-slate-400"
                        />
                        <button
                          onClick={() => handleAddActivity(day.dayNumber)}
                          className="bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 text-xs font-semibold transition shrink-0 shadow-sm"
                        >
                          Add Activity
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather-Aware Packing Checklist Assistant */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-650 border border-emerald-255/20 shadow-xs">
                    <CloudRain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Weather-Aware Packing Assistant</h3>
                    <p className="text-xs text-slate-500">Smart clothing, documents, and gear auto-checklist</p>
                  </div>
                </div>

                <div className="border-t border-slate-150 pt-6 mt-4">
                  {selectedTrip.packingList && selectedTrip.packingList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTrip.packingList.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => togglePackingItem(item._id)}
                          className="flex items-center gap-3.5 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-350 hover:bg-slate-100/40 transition shadow-xs"
                        >
                          <button className="text-slate-400 hover:text-emerald-600 focus:outline-none shrink-0">
                            {item.isPacked ? (
                              <CheckSquare className="h-5 w-5 text-emerald-605" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400" />
                            )}
                          </button>

                          <span className={`text-sm select-none ${item.isPacked ? 'line-through text-slate-405 font-light' : 'text-slate-800'}`}>
                            {item.item}
                            {item.isEssential && (
                              <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Essential</span>
                            )}
                          </span>

                          <span className={`ml-auto text-[9px] uppercase px-2 py-0.5 rounded font-bold font-mono tracking-wider ${item.category === 'Documents' ? 'bg-blue-100 text-blue-700' :
                              item.category === 'Clothing' ? 'bg-amber-100 text-amber-700' :
                                item.category === 'Gear' ? 'bg-purple-100 text-purple-700' :
                                  item.category === 'Medicine' ? 'bg-red-100 text-red-700' :
                                    item.category === 'Electronics' ? 'bg-cyan-100 text-cyan-700' :
                                      'bg-slate-200 text-slate-650'
                            }`}>
                            {item.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450 italic">Generating packing assistant guidelines...</p>
                  )}
                </div>
              </div>

              {/* Important Tips */}
              {selectedTrip.importantTips && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" /> Important Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedTrip.importantTips)
                      .filter(([, tips]) => tips?.length > 0)
                      .map(([category, tips]) => (
                        <div key={category} className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 capitalize">{category}</p>
                          <ul className="space-y-1.5">
                            {tips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-indigo-500 shrink-0">•</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Nearby Attractions */}
              {selectedTrip.nearbyAttractions?.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-600" /> Nearby Attractions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTrip.nearbyAttractions.map((attr, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-sm text-slate-900">{attr.name}</span>
                          {attr.estimatedCostUSD != null && (
                            <span className="text-xs font-bold text-slate-700 shrink-0">{fmt(attr.estimatedCostUSD)}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{attr.distanceFromMain}</p>
                        {attr.bestFor && <p className="text-xs text-indigo-600 mt-1">Best for: {attr.bestFor}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accommodation / Hotel Recommendations */}
              {((selectedTrip.accommodation && selectedTrip.accommodation.length > 0) || (selectedTrip.hotels && selectedTrip.hotels.length > 0)) && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600" /> Accommodation Recommendations
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedTrip.accommodation?.length > 0 ? selectedTrip.accommodation : selectedTrip.hotels).map((hotel, idx) => (
                      <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 shadow-xs">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-sm text-slate-850">{hotel.name}</span>
                            {hotel.rating && (
                              <span className="text-[10px] bg-white text-indigo-600 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold shadow-2xs shrink-0">
                                {hotel.rating}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {hotel.type || hotel.tier}
                            {hotel.area ? ` • ${hotel.area}` : ''}
                          </p>
                          {hotel.whyRecommended && (
                            <p className="text-xs text-slate-600 mt-2">{hotel.whyRecommended}</p>
                          )}
                          {hotel.bookingTip && (
                            <p className="text-xs text-indigo-600 mt-1">{hotel.bookingTip}</p>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-150">
                          <span className="text-slate-500">Est. Price / Night</span>
                          <span className="font-extrabold text-slate-800">
                            {fmt(hotel.estimatedCostPerNightUSD ?? hotel.estimatedCostNightUSD)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-[60vh] bg-white border border-slate-200 rounded-3xl p-8 text-center relative overflow-hidden shadow-xs">
              <div className="relative z-10 space-y-4 max-w-md">
                <div className="mx-auto bg-slate-50 border border-slate-150 p-4 rounded-3xl w-fit">
                  <Compass className="h-12 w-12 text-indigo-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">No Trips Registered</h3>
                <p className="text-sm text-slate-505 font-light">You haven't scheduled any travel plans yet. Tap below to build your custom itinerary.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-md shadow-blue-900/25"
                >
                  Create Your First Trip
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <CreateTripForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateTrip}
        loading={generateLoading}
      />

      {/* Target Day Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-905/65 backdrop-blur-md" onClick={() => setShowRegenModal(false)} />

          <div className="relative w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl z-10 animate-zoom-in">
            <button
              onClick={() => setShowRegenModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-55 hover:text-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-indigo-600" /> Customize Day {regenDayNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Provide instructions to rebuild the activity schedule for this specific day.</p>

            <form onSubmit={handleRegenerateDay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Regeneration Directives</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Focus on outdoor hiking in nature, or replace shopping slots with historical museums."
                  value={regenInstructions}
                  onChange={(e) => setRegenInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-905 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg text-xs transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regenerateLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                >
                  {regenerateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Regenerating...
                    </>
                  ) : (
                    <>
                      Apply Updates
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component: Sidebar Content
function SidebarContent({ trips, selectedTrip, setSelectedTrip, setShowCreateForm, handleDeleteTrip }) {
  return (
    <>
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-600" /> Active Trips
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-505 text-white transition shadow-sm"
            title="Create New Trip"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-400">No itineraries found. Create one to begin!</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-1">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className={`group flex items-center justify-between p-4 rounded-2xl border transition duration-200 shadow-2xs ${selectedTrip?._id === trip._id
                    ? 'bg-indigo-50/70 border-indigo-305 text-indigo-955 font-medium'
                    : 'bg-slate-55 border-slate-150 text-slate-600 hover:bg-slate-100/50 hover:border-slate-300'
                  }`}
              >
                <div
                  className="flex-1 cursor-pointer pr-3"
                  onClick={() => setSelectedTrip(trip)}
                >
                  <p className="font-bold text-sm truncate">
                    {trip.from ? `${trip.from} → ${trip.destination}` : trip.destination}
                  </p>
                  <p className="text-[10px] opacity-85 mt-1 font-semibold">
                    {trip.durationDays} Days • {trip.budgetTier} Budget
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteTrip(trip._id)}
                  className="text-slate-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition md:opacity-0 md:group-hover:opacity-100 shadow-2xs"
                  title="Delete Trip"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-100/60 border border-slate-200 rounded-3xl p-5 shadow-2xs flex items-start gap-3.5">
        <Info className="h-5 w-5 text-indigo-650 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-805 uppercase">Vault Security</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-light">
            Your travel database queries are isolated by user context. Each API request checks matching token parameters pre-retrieval.
          </p>
        </div>
      </div>
    </>
  );
}
