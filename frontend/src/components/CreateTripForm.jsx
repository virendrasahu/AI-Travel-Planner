import React, { useState, useEffect } from 'react';
import { X, Loader2, Minus, Plus } from 'lucide-react';

const INTEREST_OPTIONS = [
  { emoji: '🏛️', label: 'Culture' },
  { emoji: '🍜', label: 'Food & Dining' },
  { emoji: '🌿', label: 'Nature' },
  { emoji: '🧗', label: 'Adventure' },
  { emoji: '😌', label: 'Relaxation' },
  { emoji: '🎉', label: 'Nightlife' },
  { emoji: '🛍️', label: 'Shopping' },
  { emoji: '📸', label: 'Photography' },
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '⛰️', label: 'Trekking' },
  { emoji: '🎭', label: 'Art & Music' },
  { emoji: '🕌', label: 'Heritage' },
  { emoji: '🚴', label: 'Cycling' },
  { emoji: '🍷', label: 'Wine & Dine' },
  { emoji: '💆', label: 'Wellness & Spa' },
];

const TRAVEL_TYPES = [
  { value: 'solo', emoji: '🧍', label: 'Solo' },
  { value: 'couple', emoji: '👫', label: 'Couple' },
  { value: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { value: 'friends', emoji: '👯', label: 'Friends' },
];

function Stepper({ value, min, max, onChange, label }) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</label>
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="px-3 py-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center text-sm font-bold text-slate-900 py-3 select-none">
          {value}
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="px-3 py-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function IconInput({ icon, value, onChange, onBlur, placeholder, hasError, errorMessage, label }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none select-none">
          {icon}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 transition ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
      </div>
      {hasError && errorMessage && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}

export default function CreateTripForm({ isOpen, onClose, onSubmit, loading }) {
  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState('Medium');
  const [interests, setInterests] = useState([]);
  const [travelType, setTravelType] = useState('solo');
  const [travelers, setTravelers] = useState(1);
  const [fieldTouched, setFieldTouched] = useState({ from: false, destination: false, interests: false });

  const resetForm = () => {
    setFrom('');
    setDestination('');
    setDurationDays(3);
    setBudgetTier('Medium');
    setInterests([]);
    setTravelType('solo');
    setTravelers(1);
    setFieldTouched({ from: false, destination: false, interests: false });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleInterest = (label) => {
    setFieldTouched((prev) => ({ ...prev, interests: true }));
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const errors = {
    from: !from.trim() ? 'Departure city is required' : '',
    destination: !destination.trim() ? 'Destination is required' : '',
    interests: interests.length === 0 ? 'Select at least one interest' : '',
  };

  const isValid = !errors.from && !errors.destination && !errors.interests;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldTouched({ from: true, destination: true, interests: true });
    if (!isValid) return;

    onSubmit({
      from: from.trim(),
      destination: destination.trim(),
      durationDays,
      budgetTier,
      interests,
      travelType,
      travelers,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setFrom('');
      setDestination('');
      setDurationDays(3);
      setBudgetTier('Medium');
      setInterests([]);
      setTravelType('solo');
      setTravelers(1);
      setFieldTouched({ from: false, destination: false, interests: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const durationLabel = durationDays === 1 ? '1 Day' : `${durationDays} Days`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose} />

      <div className="relative w-full max-w-xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-zoom-in">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Build New Trip</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Enter preferences and let Gemini create your customized planner.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <IconInput
            label="Departing From"
            icon="✈️"
            value={from}
            onChange={setFrom}
            onBlur={() => setFieldTouched((prev) => ({ ...prev, from: true }))}
            placeholder="e.g. Mumbai, India or Delhi, India"
            hasError={fieldTouched.from && !!errors.from}
            errorMessage={errors.from}
          />

          <IconInput
            label="Destination"
            icon="📍"
            value={destination}
            onChange={setDestination}
            onBlur={() => setFieldTouched((prev) => ({ ...prev, destination: true }))}
            placeholder="e.g. Goa, India or Paris, France"
            hasError={fieldTouched.destination && !!errors.destination}
            errorMessage={errors.destination}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Duration
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDurationDays((d) => Math.max(1, d - 1))}
                  disabled={durationDays <= 1}
                  className="px-3 py-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 text-center text-sm font-bold text-slate-900 py-3 select-none">
                  {durationLabel}
                </div>
                <button
                  type="button"
                  onClick={() => setDurationDays((d) => Math.min(30, d + 1))}
                  disabled={durationDays >= 30}
                  className="px-3 py-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Budget Profile
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Budget (Low Cost)</option>
                <option value="Medium">Standard (Mid-Tier)</option>
                <option value="High">Premium (High End)</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed -mt-2">
            <span className="font-semibold text-slate-600">Low</span> = hostels &amp; street food &nbsp;•&nbsp;
            <span className="font-semibold text-slate-600">Medium</span> = 3-star hotels &amp; restaurants &nbsp;•&nbsp;
            <span className="font-semibold text-slate-600">High</span> = 5-star hotels &amp; fine dining
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Trip Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TRAVEL_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTravelType(type.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition ${
                    travelType === type.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Stepper
            label="Travelers"
            value={travelers}
            min={1}
            max={20}
            onChange={setTravelers}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Hobbies &amp; Interests
            </label>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl border transition ${
                fieldTouched.interests && errors.interests
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {INTEREST_OPTIONS.map((option) => {
                const selected = interests.includes(option.label);
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleInterest(option.label)}
                    className={`text-left text-xs px-3 py-2 rounded-lg border font-medium transition ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    {option.emoji} {option.label}
                  </button>
                );
              })}
            </div>
            {fieldTouched.interests && errors.interests && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.interests}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 px-6 rounded-xl border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-600/15"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                'Build Itinerary'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
