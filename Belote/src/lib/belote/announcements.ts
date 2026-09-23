import { Card, Contract, PlayerAnnouncement, Rank, Suit } from './types';
import { ALL_SUITS, NATURAL_RANK_ORDER } from './cards';

const SEQUENCE_RANKS: Rank[] = ['7', '8', '9', '10', 'V', 'D', 'R', 'AS'];

/**
 * Détecte toutes les combinaisons possibles (Tierce, Quarte, Quinte, Carré) dans une main de 8 cartes.
 */
export function detectAnnouncementsInHand(hand: Card[]): PlayerAnnouncement[] {
  const announcements: PlayerAnnouncement[] = [];

  // 1. Détection des Carrés (4 cartes de même rang)
  const rankCounts: Partial<Record<Rank, Card[]>> = {};
  for (const card of hand) {
    if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
    rankCounts[card.rank]!.push(card);
  }

  for (const rank of Object.keys(rankCounts) as Rank[]) {
    const cards = rankCounts[rank]!;
    if (cards.length === 4) {
      if (rank === 'V') {
        announcements.push({
          id: `CARRE_${rank}`,
          type: 'CARRE',
          cards,
          highestCardRank: 'V',
          points: 200,
          rank: 'V'
        });
      } else if (rank === '9') {
        announcements.push({
          id: `CARRE_${rank}`,
          type: 'CARRE',
          cards,
          highestCardRank: '9',
          points: 150,
          rank: '9'
        });
      } else if (['AS', '10', 'R', 'D'].includes(rank)) {
        announcements.push({
          id: `CARRE_${rank}`,
          type: 'CARRE',
          cards,
          highestCardRank: rank,
          points: 100,
          rank
        });
      }
      // Les carrés de 7 et 8 ne comptent pas dans les règles officielles
    }
  }

  // 2. Détection des Suites (Tierce 3, Quarte 4, Quinte 5) par couleur
  for (const suit of ALL_SUITS) {
    const cardsInSuit = hand
      .filter(c => c.suit === suit)
      .sort((a, b) => NATURAL_RANK_ORDER[a.rank] - NATURAL_RANK_ORDER[b.rank]);

    if (cardsInSuit.length < 3) continue;

    // Chercher les séquences consécutives
    let currentSeq: Card[] = [cardsInSuit[0]];

    for (let i = 1; i < cardsInSuit.length; i++) {
      const prev = cardsInSuit[i - 1];
      const curr = cardsInSuit[i];

      if (NATURAL_RANK_ORDER[curr.rank] === NATURAL_RANK_ORDER[prev.rank] + 1) {
        currentSeq.push(curr);
      } else {
        checkAndPushSequence(currentSeq, suit, announcements);
        currentSeq = [curr];
      }
    }
    checkAndPushSequence(currentSeq, suit, announcements);
  }

  return announcements;
}

function checkAndPushSequence(seq: Card[], suit: Suit, list: PlayerAnnouncement[]) {
  const len = seq.length;
  if (len >= 5) {
    list.push({
      id: `QUINTE_${suit}_${seq[len - 1].rank}`,
      type: 'QUINTE',
      cards: seq.slice(0, 5),
      highestCardRank: seq[len - 1].rank,
      points: 100,
      suit
    });
  } else if (len === 4) {
    list.push({
      id: `QUARTE_${suit}_${seq[3].rank}`,
      type: 'QUARTE',
      cards: seq,
      highestCardRank: seq[3].rank,
      points: 50,
      suit
    });
  } else if (len === 3) {
    list.push({
      id: `TIERCE_${suit}_${seq[2].rank}`,
      type: 'TIERCE',
      cards: seq,
      highestCardRank: seq[2].rank,
      points: 20,
      suit
    });
  }
}

/**
 * Hiérarchie de comparaison de la meilleure annonce (Quinch) entre deux équipes.
 * Renvoie 1 si announceA > announceB, -1 si announceB > announceA, 0 si égalité parfaite.
 */
export function compareAnnouncements(a: PlayerAnnouncement, b: PlayerAnnouncement, contract: Contract): number {
  // 1. Les carrés battent les suites
  const aIsCarre = a.type === 'CARRE';
  const bIsCarre = b.type === 'CARRE';

  if (aIsCarre && !bIsCarre) return 1;
  if (!aIsCarre && bIsCarre) return -1;

  if (aIsCarre && bIsCarre) {
    // Carré de V (200) > Carré de 9 (150) > Carré As/10/R/D (100)
    if (a.points !== b.points) {
      return a.points - b.points;
    }
    // Si même points (ex: Carré As vs Carré Roi) : ordre naturel
    return NATURAL_RANK_ORDER[a.highestCardRank] - NATURAL_RANK_ORDER[b.highestCardRank];
  }

  // 2. Comparaison de deux suites : Longueur (Quinte > Quarte > Tierce)
  const lengthScore: Record<string, number> = {
    'QUINTE': 5,
    'QUARTE': 4,
    'TIERCE': 3
  };

  const lenA = lengthScore[a.type] || 0;
  const lenB = lengthScore[b.type] || 0;

  if (lenA !== lenB) {
    return lenA - lenB;
  }

  // 3. Même longueur : Hauteur de la carte la plus haute (ex: Tierce au Roi bat Tierce au Valet)
  const rankA = NATURAL_RANK_ORDER[a.highestCardRank];
  const rankB = NATURAL_RANK_ORDER[b.highestCardRank];

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // 4. Même longueur et même hauteur : L'atout l'emporte sur une couleur ordinaire
  const aIsTrump = a.suit === contract.suit;
  const bIsTrump = b.suit === contract.suit;

  if (aIsTrump && !bIsTrump) return 1;
  if (!aIsTrump && bIsTrump) return -1;

  return 0; // Égalité parfaite (annonces s'annulent)
}

/**
 * Arbitrage des annonces entre les deux équipes.
 * Seule l'équipe ayant la PLUS FORTE annonce marque les points de TOUTES ses annonces.
 */
export function resolveTeamAnnouncements(
  team1Announcements: PlayerAnnouncement[],
  team2Announcements: PlayerAnnouncement[],
  contract: Contract
): {
  winningTeam: 1 | 2 | null;
  validTeam1Announcements: PlayerAnnouncement[];
  validTeam2Announcements: PlayerAnnouncement[];
  team1Points: number;
  team2Points: number;
} {
  if (team1Announcements.length === 0 && team2Announcements.length === 0) {
    return {
      winningTeam: null,
      validTeam1Announcements: [],
      validTeam2Announcements: [],
      team1Points: 0,
      team2Points: 0
    };
  }

  if (team1Announcements.length > 0 && team2Announcements.length === 0) {
    const pts = team1Announcements.reduce((sum, a) => sum + a.points, 0);
    return {
      winningTeam: 1,
      validTeam1Announcements: team1Announcements,
      validTeam2Announcements: [],
      team1Points: pts,
      team2Points: 0
    };
  }

  if (team2Announcements.length > 0 && team1Announcements.length === 0) {
    const pts = team2Announcements.reduce((sum, a) => sum + a.points, 0);
    return {
      winningTeam: 2,
      validTeam1Announcements: [],
      validTeam2Announcements: team2Announcements,
      team1Points: 0,
      team2Points: pts
    };
  }

  // Trouver la meilleure annonce de chaque équipe
  const bestTeam1 = [...team1Announcements].sort((a, b) => compareAnnouncements(b, a, contract))[0];
  const bestTeam2 = [...team2Announcements].sort((a, b) => compareAnnouncements(b, a, contract))[0];

  const comp = compareAnnouncements(bestTeam1, bestTeam2, contract);

  if (comp > 0) {
    // Équipe 1 gagne
    const pts = team1Announcements.reduce((sum, a) => sum + a.points, 0);
    return {
      winningTeam: 1,
      validTeam1Announcements: team1Announcements,
      validTeam2Announcements: [],
      team1Points: pts,
      team2Points: 0
    };
  } else if (comp < 0) {
    // Équipe 2 gagne
    const pts = team2Announcements.reduce((sum, a) => sum + a.points, 0);
    return {
      winningTeam: 2,
      validTeam1Announcements: [],
      validTeam2Announcements: team2Announcements,
      team1Points: 0,
      team2Points: pts
    };
  } else {
    // Égalité parfaite : aucune équipe ne marque ses annonces
    return {
      winningTeam: null,
      validTeam1Announcements: [],
      validTeam2Announcements: [],
      team1Points: 0,
      team2Points: 0
    };
  }
}
