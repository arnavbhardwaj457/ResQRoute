'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '../env';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';

export function SocketStatus() {
  const [connected, setConnected] = useState(false);

  const socket = useMemo<Socket>(() => io(env.NEXT_PUBLIC_API_URL, { autoConnect: false }), []);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [socket]);

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">Socket.IO</p>
        <StatusBadge label={connected ? 'Connected' : 'Disconnected'} variant={connected ? 'ok' : 'warning'} />
      </div>
      <p className={`mt-2 text-lg font-semibold ${connected ? 'text-emerald-300' : 'text-amber-300'}`}>
        {connected ? 'Connected' : 'Disconnected'}
      </p>
    </GlassCard>
  );
}
