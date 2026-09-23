'use client';

import React from 'react';
import { Card, Suit, TrumpType } from '@/lib/belote/types';
import { ALL_SUITS, SUIT_COLORS, SUIT_LABELS, SUIT_SYMBOLS } from '@/lib/belote/cards';
import { CardView } from './CardView';

interface BiddingPanelProps {
  phase: 'BIDDING_TOUR_1' | 'BIDDING_TOUR_2';
  faceUpCard: Card | null;
  isMyTurn: boolean;
  activePlayerName: string;
  onBidTour1: (action: 'TAKE' | 'PASS') => void;
  onBidTour2: (action: 'BID' | 'PASS', suit?: Suit, trumpType?: TrumpType) => void;
}

export const BiddingPanel: React.FC<BiddingPanelProps> = ({
  phase,
  faceUpCard,
  isMyTurn,
  activePlayerName,
  onBidTour1,
  onBidTour2
}) => {
  if (!faceUpCard) return null;

  return (
    <div className="bg-slate-900/95 border-2 border-amber-500/70 rounded-2xl p-5 shadow-2xl text-center max-w-md w-full mx-auto backdrop-blur-md text-white animate-pop-in">
      <div className="mb-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
          {phase === 'BIDDING_TOUR_1' ? 'Enchères • 1er Tour' : 'Enchères • 2ème Tour'}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
          {isMyTurn ? "C'est à vous de parler !" : `Tour de ${activePlayerName}...`}
        </h3>
      </div>

      {/* Carte retournée au centre */}
      <div className="flex flex-col items-center my-3">
        <div className="text-xs text-slate-400 mb-1">Carte proposée :</div>
        <CardView card={faceUpCard} isPlayable={false} size="md" />
      </div>

      {/* Actions si c'est le tour du joueur */}
      {isMyTurn ? (
        <div className="mt-4 space-y-3">
          {phase === 'BIDDING_TOUR_1' ? (
            /* TOUR 1 : Prendre la carte ou passer */
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onBidTour1('TAKE')}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Prendre à</span>
                <span className={`text-lg font-black ${
                  SUIT_COLORS[faceUpCard.suit] === 'red' ? 'text-red-300' : 'text-slate-100'
                }`}>
                  {SUIT_SYMBOLS[faceUpCard.suit]} {SUIT_LABELS[faceUpCard.suit]}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onBidTour1('PASS')}
                className="py-2.5 px-5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold rounded-xl transition-all"
              >
                Passer
              </button>
            </div>
          ) : (
            /* TOUR 2 : Choisir une autre couleur, Tout Atout, Sans Atout, ou Passer */
            <div className="space-y-3">
              <div className="text-xs text-slate-300 font-semibold">Choisir une autre couleur :</div>
              <div className="grid grid-cols-3 gap-2">
                {ALL_SUITS.filter(s => s !== faceUpCard.suit).map(suit => (
                  <button
                    key={suit}
                    type="button"
                    onClick={() => onBidTour2('BID', suit, 'STANDARD')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg border border-slate-600 flex items-center justify-center gap-1.5 font-bold transition-all"
                  >
                    <span className={`text-lg ${SUIT_COLORS[suit] === 'red' ? 'text-red-500' : 'text-white'}`}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className="text-xs">{SUIT_LABELS[suit]}</span>
                  </button>
                ))}
              </div>

              {/* Options Tout Atout (TA) et Sans Atout (SA) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onBidTour2('BID', undefined, 'TOUT_ATOUT')}
                  className="py-2 px-3 bg-amber-700/80 hover:bg-amber-600 active:scale-95 text-amber-100 rounded-lg border border-amber-500/50 font-bold text-xs transition-all"
                >
                  Tout Atout (TA) 🌟
                </button>
                <button
                  type="button"
                  onClick={() => onBidTour2('BID', undefined, 'SANS_ATOUT')}
                  className="py-2 px-3 bg-sky-700/80 hover:bg-sky-600 active:scale-95 text-sky-100 rounded-lg border border-sky-500/50 font-bold text-xs transition-all"
                >
                  Sans Atout (SA) 🛡️
                </button>
              </div>

              <button
                type="button"
                onClick={() => onBidTour2('PASS')}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-300 font-bold rounded-xl text-sm transition-all"
              >
                Passer
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 py-2 px-3 bg-slate-800/60 rounded-xl text-xs text-slate-400 italic">
          En attente de la décision de {activePlayerName}...
        </div>
      )}
    </div>
  );
};
