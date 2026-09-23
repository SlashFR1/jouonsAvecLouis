'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GameRoomPage({ params }: { params: { code: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (params?.code) {
      router.replace(`/?code=${params.code.toUpperCase()}`);
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
      Redirection vers le salon {params?.code}...
    </div>
  );
}
