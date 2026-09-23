'use client';

import React from 'react';
import { Card, Contract, PlayedCard } from '@/lib/belote/types';
import { isTrumpCard } from '@/lib/belote/cards';
import { evaluateHandPlayability } from '@/lib/belote/rules';
import { CardView } from './CardView';

interface PlayerHandProps {
  hand: Card[];
  contract: Contract | null;
  currentTrick: PlayedCard[];
  mySeat: number;
  isMyTurn: boolean;
  onPlayCard: (cardId: string) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  contract,
  currentTrick,
  mySeat,
  isMyTurn,
  onPlayCard,
}) => {
  // Calcul de la jouabilité de chaque carte si c'est le tour du joueur
  const playabilityMap = React.useMemo(() => {
    if (!isMyTurn || !contract) {
      return hand.map(card => ({ card, isPlayable: false, reason: "Ce n'est pas votre tour" }));
    }
    return evaluateHandPlayability(hand, currentTrick, contract, mySeat);
  }, [hand, currentTrick, contract, mySeat, isMyTurn]);

  const totalCards = hand.length;

  return (
    <div className="flex items-end justify-center -space-x-5 sm:-space-x-7 hover:-space-x-2 transition-all duration-300 py-2 sm:py-4 px-4 max-w-full overflow-x-visible">
      {hand.map((card, index) => {
        const isTrump = contract ? isTrumpCard(card, contract.type, contract.suit) : false;
        const evalResult = playabilityMap.find(p => p.card.id === card.id);
        const isPlayable = isMyTurn ? (evalResult ? evalResult.isPlayable : false) : false;
        const disabledReason = evalResult?.reason || (!isMyTurn ? "En attente de votre tour" : undefined);

        // Angle d'éventail subtil (ex: de -8deg à +8deg)
        const middleIndex = (totalCards - 1) / 2;
        const rotateAngle = totalCards > 1 ? Math.round((index - middleIndex) * 2.5) : 0;
        const translateY = Math.abs(index - middleIndex) * 2;

        return (
          <div
            key={card.id}
            style={{
              transform: `translateY(${translateY}px) rotate(${rotateAngle}deg)`,
              transformOrigin: 'bottom center',
            }}
            className="transition-transform duration-200 hover:!rotate-0 hover:!translate-y-[-16px] hover:z-30 z-10"
          >
            <CardView
              card={card}
              isTrump={isTrump}
              isPlayable={isPlayable}
              disabledReason={disabledReason}
              onClick={() => {
                if (isPlayable) onPlayCard(card.id);
              }}
              size="md"
            />
          </div>
        );
      })}
    </div>
  );
};
