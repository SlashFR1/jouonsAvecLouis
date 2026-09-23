import { Card, Contract, PlayedCard, Suit } from './types';
import { getCardPower, isTrumpCard } from './cards';

export interface CardPlayability {
  card: Card;
  isPlayable: boolean;
  reason?: string;
}

/**
 * Détermine quelle carte maîtrise actuellement le pli en cours.
 */
export function getTrickMaster(currentTrick: PlayedCard[], contract: Contract): PlayedCard | null {
  if (currentTrick.length === 0) return null;

  const leadSuit = currentTrick[0].card.suit;
  let best = currentTrick[0];
  let bestIsTrump = isTrumpCard(best.card, contract.type, contract.suit);
  let bestPower = getCardPower(best.card, contract.type, contract.suit);

  for (let i = 1; i < currentTrick.length; i++) {
    const candidate = currentTrick[i];
    const candidateIsTrump = isTrumpCard(candidate.card, contract.type, contract.suit);
    const candidatePower = getCardPower(candidate.card, contract.type, contract.suit);

    if (candidateIsTrump) {
      if (!bestIsTrump) {
        // L'atout bat la couleur normale
        best = candidate;
        bestIsTrump = true;
        bestPower = candidatePower;
      } else if (candidatePower > bestPower) {
        // Atout plus fort
        best = candidate;
        bestPower = candidatePower;
      }
    } else if (!bestIsTrump && candidate.card.suit === leadSuit) {
      // Même couleur demandée, pas d'atout
      if (candidatePower > bestPower) {
        best = candidate;
        bestPower = candidatePower;
      }
    }
  }

  return best;
}

/**
 * Évalue la jouabilité de chaque carte de la main du joueur selon les règles strictes officielles.
 */
export function evaluateHandPlayability(
  hand: Card[],
  currentTrick: PlayedCard[],
  contract: Contract,
  playerSeat: number
): CardPlayability[] {
  // 1. Premier joueur du pli : toutes les cartes sont valides
  if (currentTrick.length === 0) {
    return hand.map(card => ({ card, isPlayable: true }));
  }

  const leadCard = currentTrick[0].card;
  const leadSuit = leadCard.suit;
  const leadIsTrump = isTrumpCard(leadCard, contract.type, contract.suit);

  // Cartes de la couleur demandée possédées par le joueur
  const cardsOfLeadSuit = hand.filter(c => c.suit === leadSuit);
  const trumpsInHand = hand.filter(c => isTrumpCard(c, contract.type, contract.suit));

  const trickMaster = getTrickMaster(currentTrick, contract);
  // Partenaire : siège opposé (0 avec 2, 1 avec 3)
  const isPartnerMaster = trickMaster ? (trickMaster.playedBySeat % 2 === playerSeat % 2) : false;

  // Plus haut atout actuellement posé sur la table
  const trumpsOnTable = currentTrick.filter(p => isTrumpCard(p.card, contract.type, contract.suit));
  const highestTrumpPowerOnTable = trumpsOnTable.reduce((max, p) => {
    const pwr = getCardPower(p.card, contract.type, contract.suit);
    return pwr > max ? pwr : max;
  }, 0);

  // CAS 1 : Le joueur possède la couleur demandée
  if (cardsOfLeadSuit.length > 0) {
    // Si la couleur demandée est l'atout (ou en Tout Atout)
    if (leadIsTrump) {
      // Obligation de monter à l'atout si possible
      const higherTrumps = cardsOfLeadSuit.filter(
        c => getCardPower(c, contract.type, contract.suit) > highestTrumpPowerOnTable
      );

      if (higherTrumps.length > 0) {
        return hand.map(card => {
          if (card.suit === leadSuit) {
            const pwr = getCardPower(card, contract.type, contract.suit);
            const isHigher = pwr > highestTrumpPowerOnTable;
            return {
              card,
              isPlayable: isHigher,
              reason: isHigher ? undefined : "Obligation de monter à l'atout"
            };
          }
          return { card, isPlayable: false, reason: "Obligation de fournir l'atout demandé" };
        });
      } else {
        // Impossible de monter : n'importe quel atout de la couleur demandée est jouable
        return hand.map(card => ({
          card,
          isPlayable: card.suit === leadSuit,
          reason: card.suit === leadSuit ? undefined : "Obligation de fournir l'atout demandé"
        }));
      }
    } else {
      // Couleur normale demandée : obligation de fournir, pas d'obligation de monter
      return hand.map(card => ({
        card,
        isPlayable: card.suit === leadSuit,
        reason: card.suit === leadSuit ? undefined : `Obligation de fournir du ${leadSuit}`
      }));
    }
  }

  // CAS 2 : Le joueur ne possède PAS la couleur demandée
  // En Sans Atout : pas d'atout, défausse libre de n'importe quelle carte
  if (contract.type === 'SANS_ATOUT') {
    return hand.map(card => ({ card, isPlayable: true }));
  }

  // Si le joueur n'a aucun atout en main : défausse libre (n'importe quelle carte)
  if (trumpsInHand.length === 0) {
    return hand.map(card => ({ card, isPlayable: true }));
  }

  // Le joueur n'a pas la couleur demandée mais POSSÈDE des atouts :
  
  // Sous-cas 2.A : Le partenaire est maître du pli
  // Le joueur n'est pas obligé de couper ! Il peut pisser (défausser) ou couper s'il le souhaite.
  if (isPartnerMaster) {
    return hand.map(card => ({ card, isPlayable: true }));
  }

  // Sous-cas 2.B : L'adversaire est maître (ou aucun atout maître du partenaire)
  // Obligation de couper !
  const higherTrumps = trumpsInHand.filter(
    c => getCardPower(c, contract.type, contract.suit) > highestTrumpPowerOnTable
  );

  // Si des atouts ont déjà été joués
  if (trumpsOnTable.length > 0) {
    if (higherTrumps.length > 0) {
      // Obligation de surcouper (monter à l'atout)
      return hand.map(card => {
        const isHigher = isTrumpCard(card, contract.type, contract.suit) &&
          getCardPower(card, contract.type, contract.suit) > highestTrumpPowerOnTable;
        return {
          card,
          isPlayable: isHigher,
          reason: isHigher ? undefined : "Obligation de surcouper à l'atout"
        };
      });
    } else {
      // Impossible de surcouper :
      // Règle officielle FFB : Si le joueur possède des cartes d'autres couleurs,
      // la sous-coupe (pisser de l'atout) est interdite tant qu'il a d'autres cartes !
      // S'il n'a QUE des atouts, il est obligé de sous-couper.
      const nonTrumpCards = hand.filter(c => !isTrumpCard(c, contract.type, contract.suit));
      if (nonTrumpCards.length > 0) {
        return hand.map(card => {
          const isNonTrump = !isTrumpCard(card, contract.type, contract.suit);
          return {
            card,
            isPlayable: isNonTrump,
            reason: isNonTrump ? undefined : "Sous-coupe interdite (défaussez une autre couleur)"
          };
        });
      } else {
        // Le joueur n'a que des atouts : il peut jouer n'importe quel atout
        return hand.map(card => ({ card, isPlayable: true }));
      }
    }
  } else {
    // Aucun atout posé sur la table : obligation de couper avec n'importe quel atout
    return hand.map(card => {
      const isTrump = isTrumpCard(card, contract.type, contract.suit);
      return {
        card,
        isPlayable: isTrump,
        reason: isTrump ? undefined : "Obligation de couper à l'atout"
      };
    });
  }
}
