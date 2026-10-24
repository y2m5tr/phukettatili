import React from 'react';
import { Compass, PlusCircle, CreditCard, ShieldCheck } from 'lucide-react';

export interface FieldBottomNavProps {
  activeTab: 'schedule' | 'new_booking' | 'cash' | 'settings';
  setActiveTab: (tab: 'schedule' | 'new_booking' | 'cash' | 'settings') => void;
  isDriverOnly: boolean;
}

export function FieldBottomNav({
  activeTab,
  setActiveTab,
  isDriverOnly,
}: FieldBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-md mx-auto px-3 py-2">
      <div className={`grid ${isDriverOnly ? 'grid-cols-2' : 'grid-cols-4'} gap-1`}>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
            activeTab === 'schedule'
              ? 'text-amber-400 font-bold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Manifesto</span>
        </button>

        {!isDriverOnly && (
          <button
            onClick={() => setActiveTab('new_booking')}
            className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
              activeTab === 'new_booking'
                ? 'text-amber-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-1" />
            <span className="text-[10px]">+ Satış</span>
          </button>
        )}

        {!isDriverOnly && (
          <button
            onClick={() => setActiveTab('cash')}
            className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
              activeTab === 'cash'
                ? 'text-amber-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Kasa</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
            activeTab === 'settings'
              ? 'text-amber-400 font-bold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Ekip</span>
        </button>
      </div>
    </nav>
  );
}
