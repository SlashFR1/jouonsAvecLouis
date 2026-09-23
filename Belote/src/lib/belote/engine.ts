import {
  BeloteGameState,
  Card,
  Contract,
  GamePhase,
  PlayerAnnouncement,
  PlayerState,
  Suit,
  TrumpType
} from './types';
import { generateDeck, isTrumpCard, shuffleDeck, sortHand } from './cards';
import { evaluateHandPlayability } from './rules';
import { detectAnnouncementsInHand, resolveTeamAnnouncements } from './announcements';
import { calculateRoundScores, resolveTrick } from './scoring';

export function createInitialGameState(
  code: string,
  targetScore: 501 | 1001 = 501,
  withQuinch: boolean = true,
  hostName: string = "Joueur 1",
  hostId: string = "host_1"
): BeloteGameState {
  const hostPlayer: PlayerState = {
    id: hostId,
    name: hostName,
    seat: 0,
    team: 1,
    isHost: true,
    connected: true,
    hand: []
  };

  return {
    id: 'game_' + Math.random().toString(36).substring(2, 9),
    code: code.toUpperCase(),
    phase: 'WAITING_PLAYERS',
    targetScore,
    withQuinch,
    dealerSeat: 0,
    currentTurnSeat: 1,
    players: [hostPlayer],
    faceUpCard: null,
    bidsTour1: [],
    bidsTour2: [],
    contract: null,
    currentTrick: [],
    completedTricks: [],
    trickNumber: 1,
    belotePossiblePlayerSeat: null,
    validAnnouncementsTeam1: [],
    validAnnouncementsTeam2: [],
    announcementsWinningTeam: null,
    team1TotalScore: 0,
    team2TotalScore: 0,
    roundHistory: [],
    winnerTeam: null
  };
}

export function addPlayerToGame(state: BeloteGameState, name: string, id: string): boolean {
  if (state.players.length >= 4) return false;
  // Ne pas ajouter deux fois le même ID
  if (state.players.some(p => p.id === id)) return true;

  const seat = state.players.length;
  // Équipe 1 : Sièges 0 (Sud) et 2 (Nord)
  // Équipe 2 : Sièges 1 (Ouest) et 3 (Est)
  const team: 1 | 2 = (seat % 2 === 0) ? 1 : 2;

  state.players.push({
    id,
    name,
    seat,
    team,
    isHost: false,
    connected: true,
    hand: []
  });

  return true;
}

/**
 * Lance la distribution d'une manche :
 * Distribution initiale de 5 cartes par joueur (3 puis 2),
 * puis 1 carte retournée au centre.
 */
export function startRound(state: BeloteGameState): void {
  const deck = shuffleDeck(generateDeck());

  // 5 cartes par joueur (20 cartes au total)
  for (let i = 0; i < 4; i++) {
    state.players[i].hand = deck.slice(i * 5, (i + 1) * 5);
    state.players[i].announcements = [];
    state.players[i].beloteDeclared = false;
    state.players[i].rebeloteDeclared = false;
  }

  // Carte retournée au centre
  state.faceUpCard = deck[20];

  // Les 11 cartes restantes restent en réserve pour le preneur et les autres
  (state as any)._talon = deck.slice(21);

  state.bidsTour1 = [];
  state.bidsTour2 = [];
  state.contract = null;
  state.currentTrick = [];
  state.completedTricks = [];
  state.trickNumber = 1;
  state.belotePossiblePlayerSeat = null;

  state.phase = 'BIDDING_TOUR_1';
  state.currentTurnSeat = (state.dealerSeat + 1) % 4;
}

/**
 * Traite une enchère du Tour 1 (Prendre la carte retournée ou Passer).
 */
export function processTour1Bid(state: BeloteGameState, seat: number, action: 'TAKE' | 'PASS'): void {
  if (state.phase !== 'BIDDING_TOUR_1' || state.currentTurnSeat !== seat) {
    throw new Error("Ce n'est pas le tour de ce joueur pour le Tour 1.");
  }

  state.bidsTour1.push({ seat, action });

  if (action === 'TAKE') {
    // Le joueur prend la carte retournée
    finalizeContract(state, seat, 'STANDARD', state.faceUpCard!.suit);
    return;
  }

  // Si le joueur passe
  if (state.bidsTour1.length === 4) {
    // Les 4 joueurs ont passé au Tour 1 : passage au Tour 2
    state.phase = 'BIDDING_TOUR_2';
    state.currentTurnSeat = (state.dealerSeat + 1) % 4;
  } else {
    state.currentTurnSeat = (state.currentTurnSeat + 1) % 4;
  }
}

/**
 * Traite une enchère du Tour 2 (Choisir une couleur, Tout Atout, Sans Atout, ou Passer).
 */
export function processTour2Bid(
  state: BeloteGameState,
  seat: number,
  action: 'BID' | 'PASS',
  suit?: Suit,
  type?: TrumpType
): void {
  if (state.phase !== 'BIDDING_TOUR_2' || state.currentTurnSeat !== seat) {
    throw new Error("Ce n'est pas le tour de ce joueur pour le Tour 2.");
  }

  if (action === 'BID') {
    const chosenType = type || 'STANDARD';
    if (chosenType === 'STANDARD') {
      if (!suit || suit === state.faceUpCard!.suit) {
        throw new Error("Au Tour 2, on ne peut pas reprendre la couleur du Tour 1.");
      }
      finalizeContract(state, seat, 'STANDARD', suit);
    } else {
      finalizeContract(state, seat, chosenType, null);
    }
    return;
  }

  state.bidsTour2.push({ seat, action: 'PASS' });

  // Si tout le monde passe au Tour 2 : manche blanche, on redistribue
  if (state.bidsTour2.length === 4) {
    state.dealerSeat = (state.dealerSeat + 1) % 4;
    startRound(state);
  } else {
    state.currentTurnSeat = (state.currentTurnSeat + 1) % 4;
  }
}

/**
 * Finalise le contrat et distribue le reste des cartes (complément à 8 cartes).
 */
function finalizeContract(state: BeloteGameState, takerSeat: number, type: TrumpType, suit: Suit | null): void {
  const takerTeam: 1 | 2 = (takerSeat % 2 === 0) ? 1 : 2;

  state.contract = {
    type,
    suit,
    takerSeat,
    takerTeam
  };

  const talon: Card[] = (state as any)._talon || [];
  let talonIdx = 0;

  // Distribution du complément :
  // Le preneur reçoit la carte retournée + 2 cartes du talon (total 8)
  // Les 3 autres reçoivent 3 cartes du talon (total 8)
  for (let i = 0; i < 4; i++) {
    const player = state.players[i];
    if (i === takerSeat) {
      player.hand.push(state.faceUpCard!);
      player.hand.push(talon[talonIdx++]);
      player.hand.push(talon[talonIdx++]);
    } else {
      player.hand.push(talon[talonIdx++]);
      player.hand.push(talon[talonIdx++]);
      player.hand.push(talon[talonIdx++]);
    }

    // Trier la main
    player.hand = sortHand(player.hand, type, suit);
  }

  // Détection de la Belote-Rebelote (possession de Roi + Dame d'atout par le même joueur)
  if (type === 'STANDARD' && suit) {
    for (let i = 0; i < 4; i++) {
      const h = state.players[i].hand;
      const hasKing = h.some(c => c.suit === suit && c.rank === 'R');
      const hasQueen = h.some(c => c.suit === suit && c.rank === 'D');
      if (hasKing && hasQueen) {
        state.belotePossiblePlayerSeat = i;
        break;
      }
    }
  }

  // Si Quinch activé : détection et validation des annonces
  if (state.withQuinch) {
    let t1Annonces: PlayerAnnouncement[] = [];
    let t2Annonces: PlayerAnnouncement[] = [];

    for (let i = 0; i < 4; i++) {
      const p = state.players[i];
      const ann = detectAnnouncementsInHand(p.hand);
      p.announcements = ann;
      if (p.team === 1) t1Annonces.push(...ann);
      else t2Annonces.push(...ann);
    }

    const res = resolveTeamAnnouncements(t1Annonces, t2Annonces, state.contract);
    state.announcementsWinningTeam = res.winningTeam;
    state.validAnnouncementsTeam1 = res.validTeam1Announcements;
    state.validAnnouncementsTeam2 = res.validTeam2Announcements;
  }

  state.phase = 'PLAYING_TRICK';
  state.currentTurnSeat = (state.dealerSeat + 1) % 4;
}

/**
 * Jouer une carte dans le pli en cours.
 */
export function playCard(state: BeloteGameState, seat: number, cardId: string): {
  trickCompleted: boolean;
  roundCompleted: boolean;
  gameCompleted: boolean;
  beloteAnnounced?: string;
} {
  if (state.phase !== 'PLAYING_TRICK' || state.currentTurnSeat !== seat) {
    throw new Error("Ce n'est pas votre tour de jouer.");
  }

  const player = state.players[seat];
  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error("Carte non présente dans la main du joueur.");
  }

  const card = player.hand[cardIndex];

  // Vérification de la conformité aux règles strictes
  const playability = evaluateHandPlayability(player.hand, state.currentTrick, state.contract!, seat);
  const evaluation = playability.find(p => p.card.id === cardId);
  if (!evaluation || !evaluation.isPlayable) {
    throw new Error(evaluation?.reason || "Cette carte ne peut pas être jouée selon les règles.");
  }

  let beloteAnnounced: string | undefined = undefined;

  // Gestion Belote & Rebelote
  if (state.belotePossiblePlayerSeat === seat && state.contract?.type === 'STANDARD') {
    const isTrump = isTrumpCard(card, state.contract.type, state.contract.suit);
    if (isTrump && (card.rank === 'R' || card.rank === 'D')) {
      if (!player.beloteDeclared) {
        player.beloteDeclared = true;
        beloteAnnounced = "Belote !";
      } else if (!player.rebeloteDeclared) {
        player.rebeloteDeclared = true;
        beloteAnnounced = "Rebelote !";
      }
    }
  }

  // Retirer la carte de la main et l'ajouter au pli
  player.hand.splice(cardIndex, 1);
  state.currentTrick.push({
    card,
    playedBySeat: seat
  });

  // Si le pli compte 4 cartes : résolution du pli
  if (state.currentTrick.length === 4) {
    const isLastTrick = (state.completedTricks.length === 7);
    const result = resolveTrick(state.currentTrick, state.contract!, isLastTrick);
    result.trickNumber = state.trickNumber;

    state.completedTricks.push(result);
    state.currentTrick = [];
    state.trickNumber++;
    state.currentTurnSeat = result.winnerSeat; // Le gagnant du pli prend la main

    // Si les 8 plis sont terminés : fin de manche et décompte
    if (state.completedTricks.length === 8) {
      const t1Belote = state.players.some(p => p.team === 1 && p.beloteDeclared && p.rebeloteDeclared);
      const t2Belote = state.players.some(p => p.team === 2 && p.beloteDeclared && p.rebeloteDeclared);

      const t1AnnPts = state.validAnnouncementsTeam1.reduce((sum, a) => sum + a.points, 0);
      const t2AnnPts = state.validAnnouncementsTeam2.reduce((sum, a) => sum + a.points, 0);

      const roundScore = calculateRoundScores(
        state.completedTricks,
        state.contract!,
        t1AnnPts,
        t2AnnPts,
        t1Belote,
        t2Belote,
        state.roundHistory.length + 1
      );

      state.roundHistory.push(roundScore);
      state.team1TotalScore += roundScore.team1TotalRoundPoints;
      state.team2TotalScore += roundScore.team2TotalRoundPoints;

      // Vérifier si une équipe atteint le score cible (501 ou 1001)
      if (state.team1TotalScore >= state.targetScore || state.team2TotalScore >= state.targetScore) {
        state.phase = 'GAME_OVER';
        state.winnerTeam = (state.team1TotalScore > state.team2TotalScore) ? 1 : 2;
        return { trickCompleted: true, roundCompleted: true, gameCompleted: true, beloteAnnounced };
      }

      state.phase = 'ROUND_SCORED';
      return { trickCompleted: true, roundCompleted: true, gameCompleted: false, beloteAnnounced };
    }

    return { trickCompleted: true, roundCompleted: false, gameCompleted: false, beloteAnnounced };
  } else {
    // Joueur suivant
    state.currentTurnSeat = (state.currentTurnSeat + 1) % 4;
    return { trickCompleted: false, roundCompleted: false, gameCompleted: false, beloteAnnounced };
  }
}

/**
 * Sécurisation de l'état envoyé au client :
 * Masque les mains des autres joueurs pour éviter toute triche.
 */
export function filterStateForClient(state: BeloteGameState, clientPlayerSeat: number): BeloteGameState {
  const filtered = JSON.parse(JSON.stringify(state)) as BeloteGameState;

  filtered.players = filtered.players.map((p, idx) => {
    if (idx === clientPlayerSeat) {
      // Le joueur voit ses cartes réelles
      return p;
    } else {
      // Les autres joueurs ne voient que des cartes dos ou un décompte
      return {
        ...p,
        hand: p.hand.map((_, i) => ({ id: `HIDDEN_${i}`, suit: 'SPADE' as Suit, rank: '7' as any }))
      };
    }
  });

  return filtered;
}
