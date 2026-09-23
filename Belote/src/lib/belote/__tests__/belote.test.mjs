import test from 'node:test';
import assert from 'node:assert';
import {
  evaluateHandPlayability,
  getTrickMaster
} from '../rules.ts';
import {
  detectAnnouncementsInHand,
  compareAnnouncements,
  resolveTeamAnnouncements
} from '../announcements.ts';
import {
  calculateRoundScores,
  resolveTrick
} from '../scoring.ts';
import {
  createInitialGameState,
  addPlayerToGame,
  startRound,
  processTour1Bid,
  playCard
} from '../engine.ts';

test('Belote Rules: Obligation de fournir la couleur demandée', () => {
  const contract = { type: 'STANDARD', suit: 'HEART', takerSeat: 0, takerTeam: 1 };
  
  // Pli en cours : Lead Pique joué par le joueur 1 (Ouest)
  const currentTrick = [
    { card: { id: 'SPADE_10', suit: 'SPADE', rank: '10' }, playedBySeat: 1 }
  ];

  // Joueur 0 a 1 pique et d'autres cartes
  const hand = [
    { id: 'SPADE_7', suit: 'SPADE', rank: '7' },
    { id: 'HEART_AS', suit: 'HEART', rank: 'AS' }, // atout
    { id: 'CLUB_R', suit: 'CLUB', rank: 'R' }
  ];

  const evaluated = evaluateHandPlayability(hand, currentTrick, contract, 0);

  // Le joueur DOIT jouer son pique
  const spade = evaluated.find(c => c.card.id === 'SPADE_7');
  const heart = evaluated.find(c => c.card.id === 'HEART_AS');

  assert.strictEqual(spade.isPlayable, true);
  assert.strictEqual(heart.isPlayable, false);
});

test('Belote Rules: Obligation de couper si adversaire maître', () => {
  const contract = { type: 'STANDARD', suit: 'HEART', takerSeat: 0, takerTeam: 1 };

  // Joueur 1 (Adversaire) joue Pique
  const currentTrick = [
    { card: { id: 'SPADE_10', suit: 'SPADE', rank: '10' }, playedBySeat: 1 }
  ];

  // Joueur 0 n'a PAS de Pique mais a de l'atout Cœur et du Trèfle
  const hand = [
    { id: 'HEART_7', suit: 'HEART', rank: '7' }, // atout
    { id: 'CLUB_R', suit: 'CLUB', rank: 'R' }
  ];

  const evaluated = evaluateHandPlayability(hand, currentTrick, contract, 0);

  const heart = evaluated.find(c => c.card.id === 'HEART_7');
  const club = evaluated.find(c => c.card.id === 'CLUB_R');

  // Doit couper
  assert.strictEqual(heart.isPlayable, true);
  assert.strictEqual(club.isPlayable, false);
});

test('Belote Rules: Autorisation de pisser/défausser si partenaire maître', () => {
  const contract = { type: 'STANDARD', suit: 'HEART', takerSeat: 0, takerTeam: 1 };

  // Joueur 1 joue Carreau, Joueur 2 (Partenaire) coupe à l'atout
  const currentTrick = [
    { card: { id: 'DIAMOND_10', suit: 'DIAMOND', rank: '10' }, playedBySeat: 1 },
    { card: { id: 'HEART_9', suit: 'HEART', rank: '9' }, playedBySeat: 2 } // Partenaire maître
  ];

  // Joueur 0 n'a pas de Carreau mais a de l'atout et du Pique
  const hand = [
    { id: 'HEART_7', suit: 'HEART', rank: '7' },
    { id: 'SPADE_R', suit: 'SPADE', rank: 'R' }
  ];

  const evaluated = evaluateHandPlayability(hand, currentTrick, contract, 0);

  const heart = evaluated.find(c => c.card.id === 'HEART_7');
  const spade = evaluated.find(c => c.card.id === 'SPADE_R');

  // Les deux sont jouables car le partenaire est maître !
  assert.strictEqual(heart.isPlayable, true);
  assert.strictEqual(spade.isPlayable, true);
});

test('Quinch: Détection Tierce, Quarte, Carré', () => {
  const hand = [
    { id: 'HEART_7', suit: 'HEART', rank: '7' },
    { id: 'HEART_8', suit: 'HEART', rank: '8' },
    { id: 'HEART_9', suit: 'HEART', rank: '9' },
    { id: 'SPADE_V', suit: 'SPADE', rank: 'V' },
    { id: 'HEART_V', suit: 'HEART', rank: 'V' },
    { id: 'DIAMOND_V', suit: 'DIAMOND', rank: 'V' },
    { id: 'CLUB_V', suit: 'CLUB', rank: 'V' },
    { id: 'SPADE_AS', suit: 'SPADE', rank: 'AS' }
  ];

  const ann = detectAnnouncementsInHand(hand);
  const tierce = ann.find(a => a.type === 'TIERCE');
  const carre = ann.find(a => a.type === 'CARRE');

  assert.ok(tierce, 'Tierce détectée');
  assert.strictEqual(tierce.points, 20);

  assert.ok(carre, 'Carré de Valets détecté');
  assert.strictEqual(carre.points, 200);
});

test('Scoring: Décompte pli et 10 de der', () => {
  const contract = { type: 'STANDARD', suit: 'HEART', takerSeat: 0, takerTeam: 1 };
  const trickCards = [
    { card: { id: 'HEART_V', suit: 'HEART', rank: 'V' }, playedBySeat: 0 }, // 20 pts
    { card: { id: 'HEART_9', suit: 'HEART', rank: '9' }, playedBySeat: 1 }, // 14 pts
    { card: { id: 'HEART_AS', suit: 'HEART', rank: 'AS' }, playedBySeat: 2 }, // 11 pts
    { card: { id: 'HEART_10', suit: 'HEART', rank: '10' }, playedBySeat: 3 } // 10 pts
  ];

  const res = resolveTrick(trickCards, contract, true); // Dernier pli
  assert.strictEqual(res.winnerSeat, 0);
  assert.strictEqual(res.points, 20 + 14 + 11 + 10 + 10); // 65 pts avec 10 de der
});
