// Types fondamentaux du jeu de Belote (avec variante Quinch / Annonces)

export type Suit = 'SPADE' | 'HEART' | 'DIAMOND' | 'CLUB';
export type Rank = '7' | '8' | '9' | '10' | 'V' | 'D' | 'R' | 'AS';

export interface Card {
  id: string; // Ex: "SPADE_V"
  suit: Suit;
  rank: Rank;
}

export type TrumpType = 'STANDARD' | 'TOUT_ATOUT' | 'SANS_ATOUT';

export interface Contract {
  type: TrumpType;
  suit: Suit | null; // null si TOUT_ATOUT ou SANS_ATOUT
  takerSeat: number; // 0, 1, 2 ou 3
  takerTeam: 1 | 2;
  coinche?: boolean;
  surcoinche?: boolean;
}

export type GamePhase =
  | 'WAITING_PLAYERS'
  | 'BIDDING_TOUR_1'
  | 'BIDDING_TOUR_2'
  | 'ANNOUNCEMENTS'
  | 'PLAYING_TRICK'
  | 'TRICK_RESOLVED'
  | 'ROUND_SCORED'
  | 'GAME_OVER';

export interface PlayedCard {
  card: Card;
  playedBySeat: number;
}

export type AnnouncementType = 'TIERCE' | 'QUARTE' | 'QUINTE' | 'CARRE';

export interface PlayerAnnouncement {
  id: string;
  type: AnnouncementType;
  cards: Card[];
  highestCardRank: Rank;
  points: number;
  suit?: Suit;
  rank?: Rank; // Pour les carrés (ex: Carré de V)
}

export interface PlayerState {
  id: string;
  name: string;
  seat: number; // 0: Sud, 1: Ouest, 2: Nord, 3: Est
  team: 1 | 2;
  isHost: boolean;
  connected: boolean;
  hand: Card[];
  announcements?: PlayerAnnouncement[];
  beloteDeclared?: boolean;
  rebeloteDeclared?: boolean;
}

export interface TrickResult {
  trickNumber: number;
  cards: PlayedCard[];
  winnerSeat: number;
  winnerTeam: 1 | 2;
  points: number;
}

export interface RoundHistoryEntry {
  roundNumber: number;
  contract: Contract;
  team1RawPoints: number;
  team2RawPoints: number;
  team1AnnouncementPoints: number;
  team2AnnouncementPoints: number;
  team1BeloteBonus: number;
  team2BeloteBonus: number;
  team1TotalRoundPoints: number;
  team2TotalRoundPoints: number;
  isCapot: boolean;
  isDedans: boolean;
  dixDeDerTeam: 1 | 2;
}

export interface BeloteGameState {
  id: string;
  code: string;
  phase: GamePhase;
  targetScore: 501 | 1001;
  withQuinch: boolean;
  
  dealerSeat: number;
  currentTurnSeat: number;
  
  players: PlayerState[];
  
  faceUpCard: Card | null; // Carte proposée au Tour 1
  bidsTour1: Array<{ seat: number; action: 'PASS' | 'TAKE' }>;
  bidsTour2: Array<{ seat: number; action: 'PASS' | 'BID'; suit?: Suit; type?: TrumpType }>;
  
  contract: Contract | null;
  
  currentTrick: PlayedCard[];
  completedTricks: TrickResult[];
  trickNumber: number; // 1 à 8
  
  // Belote - Rebelote status
  belotePossiblePlayerSeat: number | null; // Joueur qui a R + D d'atout
  
  // Annonces retenues pour le décompte
  validAnnouncementsTeam1: PlayerAnnouncement[];
  validAnnouncementsTeam2: PlayerAnnouncement[];
  announcementsWinningTeam: 1 | 2 | null;
  
  // Scores cumulés
  team1TotalScore: number;
  team2TotalScore: number;
  
  roundHistory: RoundHistoryEntry[];
  winnerTeam: 1 | 2 | null;
}
