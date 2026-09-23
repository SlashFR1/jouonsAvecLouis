import { Card, Contract, PlayedCard, TrickResult, RoundHistoryEntry } from './types';
import { getCardPoints, getCardPower, isTrumpCard } from './cards';

/**
 * Détermine le vainqueur d'un pli et calcule ses points.
 */
export function resolveTrick(
  trickCards: PlayedCard[],
  contract: Contract,
  isLastTrick: boolean = false
): TrickResult {
  const leadSuit = trickCards[0].card.suit;
  let winner = trickCards[0];
  let winnerIsTrump = isTrumpCard(winner.card, contract.type, contract.suit);
  let highestPower = getCardPower(winner.card, contract.type, contract.suit);

  let rawPoints = 0;

  for (const pc of trickCards) {
    rawPoints += getCardPoints(pc.card, contract.type, contract.suit);
    const candidateIsTrump = isTrumpCard(pc.card, contract.type, contract.suit);
    const candidatePower = getCardPower(pc.card, contract.type, contract.suit);

    if (candidateIsTrump) {
      if (!winnerIsTrump) {
        winner = pc;
        winnerIsTrump = true;
        highestPower = candidatePower;
      } else if (candidatePower > highestPower) {
        winner = pc;
        highestPower = candidatePower;
      }
    } else if (!winnerIsTrump && pc.card.suit === leadSuit) {
      if (candidatePower > highestPower) {
        winner = pc;
        highestPower = candidatePower;
      }
    }
  }

  // Dix de der (+10 points pour le dernier pli)
  if (isLastTrick) {
    rawPoints += 10;
  }

  const winnerTeam: 1 | 2 = (winner.playedBySeat % 2 === 0) ? 1 : 2;

  return {
    trickNumber: 0, // Défini par l'appelant
    cards: trickCards,
    winnerSeat: winner.playedBySeat,
    winnerTeam,
    points: rawPoints
  };
}

/**
 * Calcule le score final de la manche en appliquant le contrat, le Dix de Der, les chutes (Dedans) et les Capots.
 */
export function calculateRoundScores(
  completedTricks: TrickResult[],
  contract: Contract,
  team1AnnouncementPts: number,
  team2AnnouncementPts: number,
  team1Belote: boolean,
  team2Belote: boolean,
  roundNumber: number
): RoundHistoryEntry {
  let team1RawPoints = 0;
  let team2RawPoints = 0;
  let team1TricksCount = 0;
  let team2TricksCount = 0;

  for (const t of completedTricks) {
    if (t.winnerTeam === 1) {
      team1RawPoints += t.points;
      team1TricksCount++;
    } else {
      team2RawPoints += t.points;
      team2TricksCount++;
    }
  }

  const lastTrick = completedTricks[completedTricks.length - 1];
  const dixDeDerTeam: 1 | 2 = lastTrick ? lastTrick.winnerTeam : 1;

  const team1BeloteBonus = team1Belote ? 20 : 0;
  const team2BeloteBonus = team2Belote ? 20 : 0;

  const isCapotTeam1 = (team1TricksCount === 8);
  const isCapotTeam2 = (team2TricksCount === 8);
  const isCapot = isCapotTeam1 || isCapotTeam2;

  // Points totaux d'une manche classique = 162 pts (152 + 10 de der)
  // En cas de Capot : 250 points
  if (isCapotTeam1) team1RawPoints = 250;
  if (isCapotTeam2) team2RawPoints = 250;

  const takerTeam = contract.takerTeam;
  const defenseTeam: 1 | 2 = takerTeam === 1 ? 2 : 1;

  const takerRaw = (takerTeam === 1) ? team1RawPoints : team2RawPoints;
  const defenseRaw = (takerTeam === 1) ? team2RawPoints : team1RawPoints;

  const takerTotalForContract = takerRaw + (takerTeam === 1 ? team1AnnouncementPts : team2AnnouncementPts);
  const defenseTotalForContract = defenseRaw + (defenseTeam === 1 ? team1AnnouncementPts : team2AnnouncementPts);

  // Le preneur doit faire STRICTEMENT PLUS de points que la défense (hors Belote-Rebelote)
  const isDedans = takerTotalForContract <= defenseTotalForContract;

  let team1Final = 0;
  let team2Final = 0;

  if (isDedans) {
    // CHUTE / DEDANS : La défense prend tous les points (162 + toutes les annonces)
    const allGamePoints = 162 + team1AnnouncementPts + team2AnnouncementPts;
    if (defenseTeam === 1) {
      team1Final = allGamePoints + team1BeloteBonus;
      team2Final = team2BeloteBonus; // La Belote reste imprenable
    } else {
      team2Final = allGamePoints + team2BeloteBonus;
      team1Final = team1BeloteBonus;
    }
  } else {
    // CONTRAT REMPLI : Chaque équipe marque ses points + ses annonces + belote
    team1Final = team1RawPoints + team1AnnouncementPts + team1BeloteBonus;
    team2Final = team2RawPoints + team2AnnouncementPts + team2BeloteBonus;
  }

  return {
    roundNumber,
    contract,
    team1RawPoints,
    team2RawPoints,
    team1AnnouncementPoints: team1AnnouncementPts,
    team2AnnouncementPoints: team2AnnouncementPts,
    team1BeloteBonus,
    team2BeloteBonus,
    team1TotalRoundPoints: team1Final,
    team2TotalRoundPoints: team2Final,
    isCapot,
    isDedans,
    dixDeDerTeam
  };
}
