import { Card, Suit, Rank, TrumpType } from './types';

export const ALL_SUITS: Suit[] = ['HEART', 'DIAMOND', 'CLUB', 'SPADE'];
export const ALL_RANKS: Rank[] = ['7', '8', '9', '10', 'V', 'D', 'R', 'AS'];

// 1. Valeurs des cartes en points
export const CARD_POINTS = {
  TRUMP: {
    'V': 20,
    '9': 14,
    'AS': 11,
    '10': 10,
    'R': 4,
    'D': 3,
    '8': 0,
    '7': 0
  },
  NON_TRUMP: {
    'AS': 11,
    '10': 10,
    'R': 4,
    'D': 3,
    'V': 2,
    '9': 0,
    '8': 0,
    '7': 0
  },
  SANS_ATOUT: {
    'AS': 19,
    '10': 10,
    'R': 4,
    'D': 3,
    'V': 2,
    '9': 0,
    '8': 0,
    '7': 0
  }
};

// 2. Puissance / Hiérarchie des cartes (plus le nombre est élevé, plus la carte bat les autres)
export const CARD_POWER = {
  TRUMP: {
    'V': 8,
    '9': 7,
    'AS': 6,
    '10': 5,
    'R': 4,
    'D': 3,
    '8': 2,
    '7': 1
  },
  NON_TRUMP: {
    'AS': 8,
    '10': 7,
    'R': 6,
    'D': 5,
    'V': 4,
    '9': 3,
    '8': 2,
    '7': 1
  }
};

// 3. Ordre naturel des cartes (pour les annonces Tierce, Quarte, Quinte : 7, 8, 9, 10, V, D, R, As)
export const NATURAL_RANK_ORDER: Record<Rank, number> = {
  '7': 1,
  '8': 2,
  '9': 3,
  '10': 4,
  'V': 5,
  'D': 6,
  'R': 7,
  'AS': 8
};

// Vérifie si une carte est de l'atout
export function isTrumpCard(card: Card, trumpType: TrumpType, trumpSuit: Suit | null): boolean {
  if (trumpType === 'TOUT_ATOUT') return true;
  if (trumpType === 'SANS_ATOUT') return false;
  return card.suit === trumpSuit;
}

// Obtenir la valeur en points d'une carte
export function getCardPoints(card: Card, trumpType: TrumpType, trumpSuit: Suit | null): number {
  if (trumpType === 'SANS_ATOUT') {
    return CARD_POINTS.SANS_ATOUT[card.rank];
  }
  if (isTrumpCard(card, trumpType, trumpSuit)) {
    return CARD_POINTS.TRUMP[card.rank];
  }
  return CARD_POINTS.NON_TRUMP[card.rank];
}

// Obtenir la puissance de comparaison d'une carte
export function getCardPower(card: Card, trumpType: TrumpType, trumpSuit: Suit | null): number {
  if (isTrumpCard(card, trumpType, trumpSuit)) {
    return CARD_POWER.TRUMP[card.rank];
  }
  return CARD_POWER.NON_TRUMP[card.rank];
}

// Générer le paquet officiel de 32 cartes
export function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of ALL_SUITS) {
    for (const rank of ALL_RANKS) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank
      });
    }
  }
  return deck;
}

// Mélange de Fisher-Yates
export function shuffleDeck(deck: Card[]): Card[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Trier la main d'un joueur (par couleur puis par puissance)
export function sortHand(hand: Card[], trumpType?: TrumpType, trumpSuit?: Suit | null): Card[] {
  const suitOrder: Record<Suit, number> = {
    'SPADE': 1,
    'HEART': 2,
    'CLUB': 3,
    'DIAMOND': 4
  };

  return [...hand].sort((a, b) => {
    // Si une couleur d'atout existe, on la met en tête
    const aIsTrump = trumpType && trumpSuit && isTrumpCard(a, trumpType, trumpSuit);
    const bIsTrump = trumpType && trumpSuit && isTrumpCard(b, trumpType, trumpSuit);

    if (aIsTrump && !bIsTrump) return -1;
    if (!aIsTrump && bIsTrump) return 1;

    // Même famille d'atout ou non-atout : trier par couleur
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }

    // Même couleur : trier par puissance décroissante (As ou Valet en premier)
    const powerA = getCardPower(a, trumpType || 'STANDARD', trumpSuit || null);
    const powerB = getCardPower(b, trumpType || 'STANDARD', trumpSuit || null);
    return powerB - powerA;
  });
}

// Symboles et couleurs d'affichage
export const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADE: '♠',
  HEART: '♥',
  DIAMOND: '♦',
  CLUB: '♣'
};

export const SUIT_LABELS: Record<Suit, string> = {
  SPADE: 'Pique',
  HEART: 'Cœur',
  DIAMOND: 'Carreau',
  CLUB: 'Trèfle'
};

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  SPADE: 'black',
  HEART: 'red',
  DIAMOND: 'red',
  CLUB: 'black'
};
