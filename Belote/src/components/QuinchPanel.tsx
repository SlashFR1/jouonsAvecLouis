'use client';

import React from 'react';
import { PlayerAnnouncement } from '@/lib/belote/types';
import { SUIT_COLORS, SUIT_SYMBOLS } from '@/lib/belote/cards';
import { Sparkles } from 'lucide-react';

interface QuinchPanelProps {
  team1Announcements: PlayerAnnouncement[];
  team2Announcements: PlayerAnnouncement[];
  winningTeam: 1 | 2 | null;
  onClose?: () => void;
}

export const QuinchPanel: React.FC<QuinchPanelProps> = ({
  team1Announcements,
  team2Announcements,
  winningTeam
}) => {
  if (team1Announcements.length === 0 && team2Announcements.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border-2 border-purple-500/60 rounded-xl p-3 text-white max-w-sm w-full mx-auto my-2 text-xs shadow-xl">
      <div className="flex items-center justify-between pb-1.5 border-b border-purple-500/30 mb-2 font-bold text-purple-300">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Annonces (Quinch)</span>
        </div>
        {winningTeam && (
          <span className="bg-purple-600/80 px-2 py-0.5 rounded text-[10px] text-white">
            Gagnant : Équipe {winningTeam}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Équipe 1 */}
        {team1Announcements.length > 0 && (
          <div className="flex items-center justify-between bg-slate-800/60 px-2 py-1 rounded border border-slate-700">
            <span className="font-semibold text-slate-300">Équipe 1 :</span>
            <div className="flex flex-wrap gap-1.5">
              {team1Announcements.map((a, i) => (
                <span key={i} className="bg-slate-700 px-1.5 py-0.5 rounded text-[11px] font-bold text-purple-200">
                  {a.type} {a.suit && <span className={SUIT_COLORS[a.suit] === 'red' ? 'text-red-400' : 'text-slate-100'}>{SUIT_SYMBOLS[a.suit]}</span>} (+{a.points})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Équipe 2 */}
        {team2Announcements.length > 0 && (
          <div className="flex items-center justify-between bg-slate-800/60 px-2 py-1 rounded border border-slate-700">
            <span className="font-semibold text-slate-300">Équipe 2 :</span>
            <div className="flex flex-wrap gap-1.5">
              {team2Announcements.map((a, i) => (
                <span key={i} className="bg-slate-700 px-1.5 py-0.5 rounded text-[11px] font-bold text-purple-200">
                  {a.type} {a.suit && <span className={SUIT_COLORS[a.suit] === 'red' ? 'text-red-400' : 'text-slate-100'}>{SUIT_SYMBOLS[a.suit]}</span>} (+{a.points})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
