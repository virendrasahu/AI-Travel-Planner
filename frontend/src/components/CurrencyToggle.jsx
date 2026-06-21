import { useState, useCallback } from 'react';

const STORAGE_KEY = 'trao_currency';

export function useCurrency() {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'USD';
  });

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => {
      const next = prev === 'USD' ? 'INR' : 'USD';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const convert = useCallback((amountUSD, rate = 83) => {
    const amount = Number(amountUSD) || 0;
    if (currency === 'INR') {
      return Math.round(amount * rate);
    }
    return amount;
  }, [currency]);

  return { currency, toggleCurrency, convert };
}

export default function CurrencyToggle({ currency, toggleCurrency, showLabel = false }) {
  const buttons = (
    <div className="flex items-center rounded-full bg-slate-100 p-0.5 border border-slate-200">
      <button
        type="button"
        onClick={() => currency !== 'USD' && toggleCurrency()}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
          currency === 'USD'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        $ USD
      </button>
      <button
        type="button"
        onClick={() => currency !== 'INR' && toggleCurrency()}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
          currency === 'INR'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        ₹ INR
      </button>
    </div>
  );

  if (showLabel) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600 shrink-0">Currency:</span>
        {buttons}
      </div>
    );
  }

  return buttons;
}
