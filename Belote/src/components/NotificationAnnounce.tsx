'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Flame, Crown, BellRing, X } from 'lucide-react';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/belote/cards';
import { Suit } from '@/lib/belote/types';

export type NotificationType = 'turn' | 'announce' | 'trump' | 'belote' | 'quinch' | 'info';

export interface NotificationAnnounceProps {
  type?: NotificationType;
  title: string;
  subtitle?: string;
  suit?: Suit;
  points?: number;
  duration?: number; // en ms (ex: 3500)
  onClose?: () => void;
}

export const NotificationAnnounce: React.FC<NotificationAnnounceProps> = ({
  type = 'announce',
  title,
  subtitle,
  suit,
  points,
  duration = 3200,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!duration || duration <= 0) return;

    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 400);

    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  // Configuration par type
  const typeConfigs = {
    turn: {
      badge: "À VOUS DE JOUER",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
      containerClass: "border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.35)]",
      icon: <BellRing className="w-7 h-7 text-emerald-400 animate-bounce" />,
      accentColor: "from-emerald-600 via-teal-600 to-emerald-700",
    },
    announce: {
      badge: "ANNONCE DÉTECTÉE",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      containerClass: "border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.35)]",
      icon: <Sparkles className="w-7 h-7 text-purple-300 animate-pulse" />,
      accentColor: "from-purple-600 via-fuchsia-600 to-indigo-700",
    },
    trump: {
      badge: "CONTRAT & ATOUT",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      containerClass: "border-amber-400/60 shadow-[0_0_40px_rgba(251,191,36,0.45)]",
      icon: <Crown className="w-7 h-7 text-amber-400" />,
      accentColor: "from-amber-600 via-yellow-600 to-amber-700",
    },
    belote: {
      badge: "BELOTE-REBELOTE",
      badgeClass: "bg-red-500/20 text-red-300 border-red-400/40",
      containerClass: "border-red-400/60 shadow-[0_0_45px_rgba(239,68,68,0.45)]",
      icon: <Flame className="w-7 h-7 text-red-400 animate-pulse" />,
      accentColor: "from-red-600 via-rose-600 to-amber-600",
    },
    quinch: {
      badge: "QUINCH !",
      badgeClass: "bg-amber-400/25 text-amber-200 border-amber-300/60 font-black",
      containerClass: "border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.6)] ring-2 ring-amber-300/40",
      icon: <Trophy className="w-7 h-7 text-amber-300" />,
      accentColor: "from-amber-500 via-yellow-500 to-orange-600",
    },
    info: {
      badge: "INFO DE JEU",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      containerClass: "border-blue-400/40 shadow-[0_0_30px_rgba(59,130,246,0.25)]",
      icon: <Trophy className="w-7 h-7 text-blue-400" />,
      accentColor: "from-blue-600 via-sky-600 to-indigo-600",
    },
  }[type];

  return (
    <div className="fixed inset-x-0 top-1/4 z-50 flex items-center justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto relative max-w-md w-full bg-slate-950/85 backdrop-blur-xl border-2 rounded-2xl p-5 text-white overflow-hidden ${
          typeConfigs.containerClass
        } ${isLeaving ? 'animate-bounce-leave' : 'animate-bounce-drop'}`}
      >
        {/* Liseré lumineux supérieur dégradé */}
        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${typeConfigs.accentColor}`} />

        {/* Bouton fermeture manuelle */}
        {onClose && (
          <button
            onClick={() => {
              setIsLeaving(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 300);
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Contenu principal */}
        <div className="flex items-center gap-4">
          {/* Icône avec auréole */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            {typeConfigs.icon}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            {/* Badge type */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${typeConfigs.badgeClass}`}>
                {typeConfigs.badge}
              </span>
              {points !== undefined && (
                <span className="text-[11px] font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                  +{points} pts
                </span>
              )}
            </div>

            {/* Titre avec rebond */}
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
                {title}
              </h2>

              {/* Si symbole d'atout présent */}
              {suit && (
                <span
                  className={`text-2xl sm:text-3xl font-black filter drop-shadow-lg ${
                    SUIT_COLORS[suit] === 'red' ? 'text-red-500' : 'text-slate-100'
                  }`}
                >
                  {SUIT_SYMBOLS[suit]}
                </span>
              )}
            </div>

            {/* Sous-titre explicatif */}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Jauge temporelle de disparition */}
        {duration > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
            <div
              className={`h-full bg-gradient-to-r ${typeConfigs.accentColor} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrinkWidth ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
