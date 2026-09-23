'use client';

import React from 'react';
import BelotePage from '@/app/page';

export default function GameRoomPage({ params }: { params: { code: string } }) {
  // Réutilisation directe de BelotePage avec le code de salle
  return <BelotePage />;
}
