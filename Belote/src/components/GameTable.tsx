'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BeloteGameState, Suit, TrumpType } from '@/lib/belote/types';
import { ScoreWidget } from './ScoreWidget';
import { CardView } from './CardView';
import { PlayerHand } from './PlayerHand';
import { BiddingPanel } from './BiddingPanel';
import { QuinchPanel } from './QuinchPanel';
import { NotificationAnnounce, NotificationType } from './NotificationAnnounce';
import { Crown, Sparkles, Users } from 'lucide-react';
import { SUIT_SYMBOLS } from '@/lib/belote/cards';

interface GameTableProps {
  gameState: BeloteGameState;
  mySeat: number;
  onPlayCard: (cardId: string) => void;
  onBidTour1: (action: 'TAKE' | 'PASS') => void;
  onBidTour2: (action: 'BID' | 'PASS', suit?: Suit, trumpType?: TrumpType) => void;
  onStartRound?: () => void;
  onNextRound?: () => void;
  boardImageUrl?: string; // Image personnalisée de plateau
}

interface NotificationState {
  id: number;
  type: NotificationType;
  title: string;
  subtitle?: string;
  suit?: Suit;
  points?: number;
}

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  mySeat,
  onPlayCard,
  onBidTour1,
  onBidTour2,
  onStartRound,
  onNextRound,
  boardImageUrl = '/board.jpg',
}) => {
  // Notification active avec animation de chute & rebond
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const prevTurnSeatRef = useRef<number | null>(null);
  const prevContractRef = useRef<string | null>(null);

  // Mapping des sièges relatifs : 0: Sud (Moi), 1: Ouest, 2: Nord (Partenaire), 3: Est
  const getPlayerAtRelativePos = (offset: number) => {
    const seat = (mySeat + offset) % 4;
    return gameState.players.find(p => p.seat === seat);
  };

  const southPlayer = getPlayerAtRelativePos(0); // Moi
  const westPlayer = getPlayerAtRelativePos(1);  // Gauche
  const northPlayer = getPlayerAtRelativePos(2); // Partenaire (Haut)
  const eastPlayer = getPlayerAtRelativePos(3);  // Droite

  const isMyTurn = gameState.currentTurnSeat === mySeat;
  const activePlayer = gameState.players.find(p => p.seat === gameState.currentTurnSeat);
  const contract = gameState.contract;

  // Détection automatique pour déclencher les notifications "Chute avec Rebond"
  useEffect(() => {
    // 1. Détection du tour de jeu
    if (gameState.currentTurnSeat === mySeat && prevTurnSeatRef.current !== mySeat) {
      if (gameState.phase === 'PLAYING_TRICK' || gameState.phase === 'BIDDING_TOUR_1' || gameState.phase === 'BIDDING_TOUR_2') {
        setNotification({
          id: Date.now(),
          type: 'turn',
          title: "C'est votre tour !",
          subtitle: gameState.phase === 'PLAYING_TRICK' ? 'Choisissez une carte autorisée à jouer' : 'À vous de parler pour le contrat',
        });
      }
    }
    prevTurnSeatRef.current = gameState.currentTurnSeat;

    // 2. Détection du contrat et de l'atout fixé
    const contractKey = contract ? `${contract.suit}_${contract.takerSeat}_${contract.type}` : null;
    if (contract && contractKey && contractKey !== prevContractRef.current) {
      const takerName = gameState.players[contract.takerSeat]?.name || 'Un joueur';
      const isMyTeamTaker = contract.takerSeat % 2 === mySeat % 2;
      
      let title = `Atout : ${contract.suit ? SUIT_SYMBOLS[contract.suit] : contract.type}`;
      if (contract.type === 'TOUT_ATOUT') title = 'Contrat : Tout Atout (TA)';
      if (contract.type === 'SANS_ATOUT') title = 'Contrat : Sans Atout (SA)';

      setNotification({
        id: Date.now(),
        type: 'trump',
        title,
        subtitle: `${takerName} (${isMyTeamTaker ? 'Votre équipe' : 'Adversaires'}) a pris le contrat !`,
        suit: contract.suit || undefined,
      });
    }
    prevContractRef.current = contractKey;
  }, [gameState.currentTurnSeat, contract, mySeat, gameState.phase, gameState.players]);

  // Détection Quinch ou annonces
  useEffect(() => {
    if (gameState.withQuinch && gameState.announcementsWinningTeam) {
      const teamNumber = gameState.announcementsWinningTeam;
      const isMyTeam = (mySeat % 2 === 0 && teamNumber === 1) || (mySeat % 2 === 1 && teamNumber === 2);
      setNotification({
        id: Date.now(),
        type: 'quinch',
        title: `Annonces Équipe ${teamNumber} validées !`,
        subtitle: isMyTeam ? 'Bravo ! Vos annonces l’emportent.' : 'Les annonces adverses sont maîtresses.',
      });
    }
  }, [gameState.announcementsWinningTeam, gameState.withQuinch, mySeat]);

  // Positionnement des cartes jouées dans le pli central
  const getTrickCardForSeat = (seat: number) => {
    return gameState.currentTrick.find(p => p.playedBySeat === seat)?.card;
  };

  const southCard = getTrickCardForSeat(southPlayer?.seat ?? 0);
  const westCard = getTrickCardForSeat(westPlayer?.seat ?? 1);
  const northCard = getTrickCardForSeat(northPlayer?.seat ?? 2);
  const eastCard = getTrickCardForSeat(eastPlayer?.seat ?? 3);

  const isRoundOver = gameState.phase === 'ROUND_SCORED';
  const isGameOver = gameState.phase === 'GAME_OVER';

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Notification de chute avec rebond élastique */}
      {notification && (
        <NotificationAnnounce
          key={notification.id}
          type={notification.type}
          title={notification.title}
          subtitle={notification.subtitle}
          suit={notification.suit}
          points={notification.points}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Widget Permanent des Scores (Haut Gauche) */}
      <ScoreWidget gameState={gameState} mySeat={mySeat} />

      {/* TAPIS DE JEU CENTRAL (Image de plateau avec bordures bois et mains des 4 joueurs) */}
      <main className="relative flex-1 m-2 sm:m-4 rounded-[2.5rem] border-4 border-amber-950/60 shadow-2xl overflow-hidden flex items-center justify-center p-4 bg-[#0d4f2b]">
        {/* Image officielle du plateau de jeu */}
        <img
          src={boardImageUrl || "/board.jpg"}
          alt="Plateau de Belote"
          className="absolute inset-0 w-full h-full object-fill sm:object-cover pointer-events-none select-none"
        />

        {/* Halo et profondeur pour faire ressortir les cartes et les joueurs */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(0,0,0,0.5)] bg-gradient-to-t from-black/20 via-transparent to-black/20" />

        {/* JOUEUR NORD (Partenaire) */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20">
          <PlayerBadge
            player={northPlayer}
            isTurn={gameState.currentTurnSeat === northPlayer?.seat}
            isDealer={gameState.dealerSeat === northPlayer?.seat}
            isTaker={contract?.takerSeat === northPlayer?.seat}
            roleLabel="Partenaire"
          />
          {northPlayer && (
            <div className="flex -space-x-8 sm:-space-x-10 scale-75 origin-top">
              {northPlayer.hand.map((_, i) => (
                <CardView key={i} card={{ id: `N_${i}`, suit: 'SPADE', rank: '7' }} hidden size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* JOUEUR OUEST (Adversaire Gauche) */}
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20">
          <PlayerBadge
            player={westPlayer}
            isTurn={gameState.currentTurnSeat === westPlayer?.seat}
            isDealer={gameState.dealerSeat === westPlayer?.seat}
            isTaker={contract?.takerSeat === westPlayer?.seat}
            roleLabel="Adversaire"
          />
          {westPlayer && (
            <div className="flex flex-col -space-y-12 scale-75 origin-left">
              {westPlayer.hand.map((_, i) => (
                <CardView key={i} card={{ id: `W_${i}`, suit: 'SPADE', rank: '7' }} hidden size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* JOUEUR EST (Adversaire Droite) */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20">
          <PlayerBadge
            player={eastPlayer}
            isTurn={gameState.currentTurnSeat === eastPlayer?.seat}
            isDealer={gameState.dealerSeat === eastPlayer?.seat}
            isTaker={contract?.takerSeat === eastPlayer?.seat}
            roleLabel="Adversaire"
          />
          {eastPlayer && (
            <div className="flex flex-col -space-y-12 scale-75 origin-right">
              {eastPlayer.hand.map((_, i) => (
                <CardView key={i} card={{ id: `E_${i}`, suit: 'SPADE', rank: '7' }} hidden size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* CENTRE DU TAPIS (Enchères ou Pli en cours) */}
        <div className="relative z-30 flex flex-col items-center justify-center">
          {/* Phase 1 & 2 : Panneau d'enchères */}
          {(gameState.phase === 'BIDDING_TOUR_1' || gameState.phase === 'BIDDING_TOUR_2') && (
            <BiddingPanel
              phase={gameState.phase}
              faceUpCard={gameState.faceUpCard}
              isMyTurn={isMyTurn}
              activePlayerName={activePlayer?.name || 'Joueur'}
              onBidTour1={onBidTour1}
              onBidTour2={onBidTour2}
            />
          )}

          {/* Phase de jeu : Cartes jouées dans le pli en cours */}
          {gameState.phase === 'PLAYING_TRICK' && (
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Carte Nord */}
              {northCard && (
                <div className="absolute top-0 animate-card-play">
                  <CardView card={northCard} size="md" isPlayable={false} />
                </div>
              )}
              {/* Carte Ouest */}
              {westCard && (
                <div className="absolute left-0 animate-card-play">
                  <CardView card={westCard} size="md" isPlayable={false} />
                </div>
              )}
              {/* Carte Est */}
              {eastCard && (
                <div className="absolute right-0 animate-card-play">
                  <CardView card={eastCard} size="md" isPlayable={false} />
                </div>
              )}
              {/* Carte Sud */}
              {southCard && (
                <div className="absolute bottom-0 animate-card-play">
                  <CardView card={southCard} size="md" isPlayable={false} />
                </div>
              )}

              {/* Si aucun pli : rappel du pli */}
              {gameState.currentTrick.length === 0 && (
                <div className="text-center text-emerald-200/60 text-xs font-bold uppercase tracking-wider bg-black/30 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-md">
                  Pli {gameState.trickNumber} / 8
                </div>
              )}
            </div>
          )}

          {/* Annonces Quinch affichées au centre */}
          {gameState.withQuinch && contract && (
            <QuinchPanel
              team1Announcements={gameState.validAnnouncementsTeam1}
              team2Announcements={gameState.validAnnouncementsTeam2}
              winningTeam={gameState.announcementsWinningTeam}
            />
          )}

          {/* Modal Fin de Manche */}
          {isRoundOver && (
            <div className="bg-slate-950/90 border-2 border-emerald-500 rounded-3xl p-6 text-center text-white max-w-sm mx-auto shadow-2xl animate-bounce-drop backdrop-blur-xl">
              <h3 className="text-2xl font-black text-emerald-400 mb-2">Manche Terminée !</h3>
              <p className="text-xs text-slate-300 mb-4">
                Tous les plis ont été remportés et les scores ont été comptabilisés.
              </p>
              {onNextRound && southPlayer?.isHost && (
                <button
                  type="button"
                  onClick={onNextRound}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-extrabold rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 text-white"
                >
                  Manche Suivante ➡️
                </button>
              )}
              {!southPlayer?.isHost && (
                <div className="text-xs text-slate-400 italic">
                  En attente que l'hôte lance la manche suivante...
                </div>
              )}
            </div>
          )}

          {/* Modal Fin de Partie */}
          {isGameOver && (
            <div className="bg-slate-950/90 border-2 border-amber-400 rounded-3xl p-6 text-center text-white max-w-sm mx-auto shadow-2xl animate-bounce-drop backdrop-blur-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mb-2">🏆 Partie Terminée !</h2>
              <p className="text-base font-bold text-slate-100 mb-2">
                Victoire éclatante de l'Équipe {gameState.winnerTeam} !
              </p>
              <div className="flex justify-around my-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <div>
                  <span className="text-xs text-slate-400">Équipe 1</span>
                  <div className="text-xl font-extrabold text-emerald-400">{gameState.team1TotalScore} pts</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Équipe 2</span>
                  <div className="text-xl font-extrabold text-emerald-400">{gameState.team2TotalScore} pts</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* JOUEUR SUD (Vous-même) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 w-full max-w-4xl px-2">
          <PlayerBadge
            player={southPlayer}
            isTurn={isMyTurn}
            isDealer={gameState.dealerSeat === southPlayer?.seat}
            isTaker={contract?.takerSeat === southPlayer?.seat}
            roleLabel="Vous"
          />

          {/* Main du joueur avec surbrillance dorée et grisé strict */}
          {southPlayer && (
            <PlayerHand
              hand={southPlayer.hand}
              contract={gameState.contract}
              currentTrick={gameState.currentTrick}
              mySeat={mySeat}
              isMyTurn={isMyTurn && gameState.phase === 'PLAYING_TRICK'}
              onPlayCard={onPlayCard}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Sous-composant Badge Joueur
const PlayerBadge: React.FC<{
  player?: { name: string; isConnected?: boolean };
  isTurn: boolean;
  isDealer: boolean;
  isTaker: boolean;
  roleLabel: string;
}> = ({ player, isTurn, isDealer, isTaker, roleLabel }) => {
  if (!player) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 text-slate-400 text-xs">
        <Users className="w-3 h-3" />
        <span>En attente...</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 select-none ${
        isTurn
          ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] text-amber-200 scale-105'
          : 'bg-black/40 border-white/10 text-white backdrop-blur-md'
      }`}
    >
      {/* Statut connexion */}
      <span
        className={`w-2 h-2 rounded-full ${
          player.isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'
        }`}
      />

      {/* Nom du joueur */}
      <span className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[140px]">
        {player.name}
      </span>

      {/* Rôle */}
      <span className="text-[10px] text-white/50 font-normal">({roleLabel})</span>

      {/* Badge Donneur (D) */}
      {isDealer && (
        <span
          title="Donneur"
          className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-sm"
        >
          D
        </span>
      )}

      {/* Badge Preneur */}
      {isTaker && (
        <span
          title="Preneur du contrat"
          className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm"
        >
          <Crown className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
};
