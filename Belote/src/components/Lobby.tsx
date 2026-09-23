'use client';

import React, { useState, useEffect } from 'react';
import { BeloteGameState } from '@/lib/belote/types';
import { Trophy, Sparkles, Users, Copy, Check, Play, LogIn, PlusCircle, Share2 } from 'lucide-react';

interface LobbyProps {
  onGameJoined: (code: string, seat: number, playerName: string, game?: BeloteGameState, pid?: string) => void;
  existingGameState?: BeloteGameState | null;
  onStartGame?: () => void;
  mySeat?: number;
}

export const Lobby: React.FC<LobbyProps> = ({
  onGameJoined,
  existingGameState,
  onStartGame,
  mySeat = 0,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [targetScore, setTargetScore] = useState<501 | 1001>(501);
  const [withQuinch, setWithQuinch] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Détection automatique du paramètre ?code=XXXX dans l'URL pour les invités
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode) {
        setRoomCode(urlCode.toUpperCase().trim());
        setTab('join');
      }
    }
  }, []);

  // Si on est déjà dans un salon en attente
  if (existingGameState && existingGameState.phase === 'WAITING_PLAYERS') {
    const isHost = mySeat === 0;
    const canStart = existingGameState.players.length === 4;

    const copyCodeOnly = () => {
      navigator.clipboard.writeText(existingGameState.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const shareInviteLink = () => {
      if (typeof window === 'undefined') return;
      const shareUrl = `${window.location.origin}/?code=${existingGameState.code}`;
      if (navigator.share) {
        navigator.share({
          title: 'Rejoins ma partie de Belote !',
          text: `Clique pour rejoindre notre table de Belote (Code: ${existingGameState.code}) :`,
          url: shareUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl backdrop-blur-md text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Salon d'Attente • Belote Multijoueur
          </span>

          <h1 className="text-2xl sm:text-3xl font-black mt-3 text-slate-100">
            Code : <span className="text-amber-400 tracking-wider">{existingGameState.code}</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={copyCodeOnly}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier le code'}</span>
            </button>

            <button
              type="button"
              onClick={shareInviteLink}
              className="text-xs bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-500/40 inline-flex items-center gap-1.5 transition-colors font-bold"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Partager le lien (SMS / WhatsApp)</span>
            </button>
          </div>

          {/* Rappel des options */}
          <div className="flex justify-center gap-3 my-4 text-xs">
            <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
              🏆 Objectif : <strong>{existingGameState.targetScore} pts</strong>
            </span>
            <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
              ✨ Quinch : <strong>{existingGameState.withQuinch ? 'Activé' : 'Désactivé'}</strong>
            </span>
          </div>

          <hr className="border-slate-800 my-5" />

          {/* Les 4 sièges */}
          <div className="text-left mb-6">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400">
              <span>Joueurs connectés ({existingGameState.players.length}/4)</span>
              <span>2 Équipes de 2</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1, 2, 3].map((seatIdx) => {
                const player = existingGameState.players.find(p => p.seat === seatIdx);
                const teamNum = seatIdx % 2 === 0 ? 1 : 2;
                const isMe = seatIdx === mySeat;

                return (
                  <div
                    key={seatIdx}
                    className={`p-3 rounded-xl border flex flex-col justify-between min-h-[75px] transition-all ${
                      player
                        ? 'bg-slate-800/80 border-emerald-500/40 text-slate-100 shadow-sm'
                        : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>
                        Siège {seatIdx + 1} ({seatIdx === 0 ? 'Sud' : seatIdx === 1 ? 'Ouest' : seatIdx === 2 ? 'Nord' : 'Est'})
                      </span>
                      <span className={`text-[10px] px-1 rounded font-bold ${teamNum === 1 ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'}`}>
                        Équipe {teamNum}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {player ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-sm truncate">
                            {player.name} {isMe ? '★ (Moi)' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="italic text-xs text-slate-600">En attente...</span>
                      )}

                      {player?.isHost && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-black">
                          HÔTE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Lancer */}
          {isHost ? (
            <div>
              <button
                type="button"
                disabled={!canStart}
                onClick={onStartGame}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-xl transition-all ${
                  canStart
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{canStart ? 'Distribuer et Lancer la Partie 🚀' : 'En attente de 4 joueurs...'}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-2">
              En attente que l'hôte lance la partie dès que les 4 joueurs sont réunis...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Écran d'accueil (Créer ou Rejoindre)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return setError('Veuillez renseigner un pseudo.');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          playerName: playerName.trim(),
          targetScore,
          withQuinch,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création.');

      onGameJoined(data.code, data.seat, playerName.trim(), data.game, data.playerId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return setError('Veuillez renseigner un pseudo.');
    if (!roomCode.trim()) return setError('Veuillez renseigner un code de salon.');
    setLoading(true);
    setError(null);

    const cleanCode = roomCode.toUpperCase().trim();

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'JOIN',
          playerName: playerName.trim(),
          code: cleanCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // En cas d'instance serverless Vercel différente (404), rejoindre directement via le broker WebSocket
        console.warn('Instance serveur 404, connexion en direct via WebSocket:', data.error);
        const pid = 'p_' + Math.random().toString(36).substring(2, 9);
        onGameJoined(cleanCode, 1, playerName.trim(), undefined, pid);
        return;
      }

      onGameJoined(data.code, data.seat, playerName.trim(), data.game, data.playerId);
    } catch (err: any) {
      console.warn('Erreur API, connexion WebSocket de secours:', err);
      const pid = 'p_' + Math.random().toString(36).substring(2, 9);
      onGameJoined(cleanCode, 1, playerName.trim(), undefined, pid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl backdrop-blur-md">
        {/* Titre */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Belote Officielle FFB & Quinch</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-100">
            BELOTE <span className="text-amber-400">MULTILINGUE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Parties en direct à 4 joueurs sur vos téléphones ou PC
          </p>
        </div>

        {/* Onglets Créer / Rejoindre */}
        <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'create' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer une table</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('join')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'join' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Rejoindre</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulaire Création */}
        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Votre Pseudo
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex: Louis"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            {/* Objectif de points */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Objectif de points
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetScore(501)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetScore === 501
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  ⚡ 501 points (Rapide)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScore(1001)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetScore === 1001
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  🏆 1001 points (Standard)
                </button>
              </div>
            </div>

            {/* Option Quinch */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Variante Quinch (Annonces)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tierce, Quarte, Quinte, Carrés d'As/Valets/10/R/D
                </p>
              </div>
              <input
                type="checkbox"
                checked={withQuinch}
                onChange={(e) => setWithQuinch(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-700 border-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? 'Création de la table...' : 'Créer la table (Hôte) 👑'}
            </button>
          </form>
        ) : (
          /* Formulaire Rejoindre */
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Votre Pseudo
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex: Sophie"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Code du salon (4 lettres)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABCD"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-center tracking-widest font-mono text-lg font-black uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? 'Connexion au salon...' : 'Rejoindre la table 🎮'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
