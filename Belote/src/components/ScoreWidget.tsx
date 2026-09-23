'use client';

import React from 'react';
import { BeloteGameState } from '@/lib/belote/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/belote/cards';
import { Trophy, Shield } from 'lucide-react';

interface ScoreWidgetProps {
  gameState: BeloteGameState;
  mySeat: number;
}

export const ScoreWidget: React.FC<ScoreWidgetProps> = ({ gameState, mySeat }) => {
  const myTeam = mySeat % 2 === 0 ? 1 : 2;
  const contract = gameState.contract;
  const target = gameState.targetScore || 501;

  // Calcul du pourcentage de progression vers la victoire
  const team1Percent = Math.min(100, Math.round((gameState.team1TotalScore / target) * 100));
  const team2Percent = Math.min(100, Math.round((gameState.team2TotalScore / target) * 100));

  return (
    <div className="fixed top-4 left-4 z-40 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white shadow-lg min-w-[250px] max-w-[310px] select-none transition-all duration-300 hover:bg-black/50 hover:border-white/20">
      {/* En-tête : Titre & Objectif */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Objectif {target} pts</span>
        </div>
        {gameState.withQuinch && (
          <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
            Quinch ✨
          </span>
        )}
      </div>

      {/* Lignes de score des 2 équipes avec barres de progression */}
      <div className="space-y-2.5 text-xs">
        {/* ÉQUIPE 1 */}
        <div className={`p-2 rounded-lg border transition-all ${
          myTeam === 1
            ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 ring-1 ring-emerald-400/20'
            : 'bg-white/5 border-white/10 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Shield className={`w-3.5 h-3.5 ${myTeam === 1 ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="font-semibold text-xs">
                Équipe 1 {myTeam === 1 ? '★ (Vous)' : ''}
              </span>
            </div>
            <span className="font-black text-base tabular-nums text-white">
              {gameState.team1TotalScore} <span className="text-[10px] text-white/50 font-normal">pts</span>
            </span>
          </div>
          {/* Barre de progression */}
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                myTeam === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-400'
              }`}
              style={{ width: `${team1Percent}%` }}
            />
          </div>
        </div>

        {/* ÉQUIPE 2 */}
        <div className={`p-2 rounded-lg border transition-all ${
          myTeam === 2
            ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 ring-1 ring-emerald-400/20'
            : 'bg-white/5 border-white/10 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Shield className={`w-3.5 h-3.5 ${myTeam === 2 ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="font-semibold text-xs">
                Équipe 2 {myTeam === 2 ? '★ (Vous)' : ''}
              </span>
            </div>
            <span className="font-black text-base tabular-nums text-white">
              {gameState.team2TotalScore} <span className="text-[10px] text-white/50 font-normal">pts</span>
            </span>
          </div>
          {/* Barre de progression */}
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                myTeam === 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-400'
              }`}
              style={{ width: `${team2Percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contrat & Atout en cours */}
      {contract && (
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/60">Atout en jeu :</span>
          <div className="flex items-center gap-1.5 font-bold">
            {contract.type === 'STANDARD' && contract.suit && (
              <span className={`text-lg font-black leading-none ${
                SUIT_COLORS[contract.suit] === 'red' ? 'text-red-500' : 'text-white'
              }`}>
                {SUIT_SYMBOLS[contract.suit]}
              </span>
            )}
            {contract.type === 'TOUT_ATOUT' && (
              <span className="text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/40 text-[10px] font-black">
                TA (Tout Atout)
              </span>
            )}
            {contract.type === 'SANS_ATOUT' && (
              <span className="text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-400/40 text-[10px] font-black">
                SA (Sans Atout)
              </span>
            )}
            <span className="text-white/50 text-[10px] font-normal truncate max-w-[90px]">
              ({gameState.players[contract.takerSeat]?.name || '?'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
