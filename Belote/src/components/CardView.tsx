'use client';

import React from 'react';
import { Card } from '@/lib/belote/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/belote/cards';

interface CardViewProps {
  card: Card;
  isTrump?: boolean;
  isPlayable?: boolean;
  disabledReason?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  hidden?: boolean;
  rotate?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isTrump = false,
  isPlayable = true,
  disabledReason,
  onClick,
  size = 'md',
  hidden = false,
  rotate = 0,
}) => {
  const isRed = SUIT_COLORS[card.suit] === 'red';
  const symbol = SUIT_SYMBOLS[card.suit];

  const sizeClasses = {
    sm: 'w-11 h-16 text-xs rounded-md',
    md: 'w-16 h-24 sm:w-20 sm:h-28 text-sm sm:text-base rounded-xl',
    lg: 'w-20 h-28 sm:w-24 sm:h-36 text-base sm:text-lg rounded-2xl',
  }[size];

  // Carte face cachée (dos de carte de casino avec motif géométrique chic)
  if (hidden) {
    return (
      <div
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
        className={`${sizeClasses} bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border-2 border-amber-500/40 shadow-xl flex items-center justify-center select-none overflow-hidden transition-transform duration-200`}
      >
        <div className="w-[86%] h-[88%] border border-amber-400/30 rounded-lg bg-blue-950/70 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:8px_8px] opacity-25" />
          <div className="w-6 h-6 rounded-full border border-amber-400/50 bg-amber-500/20 flex items-center justify-center shadow-inner">
            <span className="text-[10px] font-black text-amber-300">♣</span>
          </div>
        </div>
      </div>
    );
  }

  // Styles visuels précis demandés :
  // 1. Surbrillance Atout : ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]
  const trumpGlowClass = isTrump
    ? 'ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] border-amber-300'
    : 'border-slate-300/80 shadow-md';

  // 2. Cartes Grisées (Interdites) : opacity-40 grayscale cursor-not-allowed avec léger filtre sombre
  const playabilityClass = isPlayable
    ? 'cursor-pointer hover:-translate-y-4 hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-out active:scale-95'
    : 'opacity-40 grayscale cursor-not-allowed select-none relative after:absolute after:inset-0 after:bg-black/30 after:rounded-xl';

  return (
    <div
      onClick={() => {
        if (isPlayable && onClick) onClick();
      }}
      title={!isPlayable && disabledReason ? disabledReason : isTrump ? 'Carte d’Atout' : undefined}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      className={`relative ${sizeClasses} bg-white select-none transition-all flex flex-col justify-between p-1.5 sm:p-2 border ${trumpGlowClass} ${playabilityClass}`}
    >
      {/* Coin supérieur gauche */}
      <div className={`flex flex-col items-center leading-none font-black ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        <span className="tracking-tight text-xs sm:text-base font-extrabold">{card.rank}</span>
        <span className="text-xs sm:text-sm -mt-0.5">{symbol}</span>
      </div>

      {/* Centre : Grand symbole épuré */}
      <div className={`text-center my-auto text-2xl sm:text-3xl font-black ${isRed ? 'text-red-600' : 'text-slate-950'} drop-shadow-sm`}>
        {symbol}
      </div>

      {/* Coin inférieur droit inversé */}
      <div className={`flex flex-col items-center leading-none font-black rotate-180 ${isRed ? 'text-red-600' : 'text-slate-950'}`}>
        <span className="tracking-tight text-xs sm:text-base font-extrabold">{card.rank}</span>
        <span className="text-xs sm:text-sm -mt-0.5">{symbol}</span>
      </div>

      {/* Badge Atout Doré */}
      {isTrump && (
        <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-md border border-amber-200 flex items-center gap-0.5 z-10">
          ★
        </span>
      )}
    </div>
  );
};
