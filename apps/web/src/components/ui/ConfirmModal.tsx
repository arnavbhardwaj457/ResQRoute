'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import anime from 'animejs';
import { GlowButton } from '@/components/ui';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmModal — Dramatic full-screen emergency confirmation overlay
 * with pulsing red atmosphere and countdown option.
 */
export function ConfirmModal({ open, onConfirm, onCancel }: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Animate in when opened
  useEffect(() => {
    if (!open) {
      setCountdown(null);
      return;
    }

    anime.set(overlayRef.current, { opacity: 0 });
    anime.set(panelRef.current, { opacity: 0, scale: 0.9, translateY: 30 });

    anime({
      targets: overlayRef.current,
      opacity: [0, 1],
      duration: 250,
      easing: 'easeOutCubic',
    });

    anime({
      targets: panelRef.current,
      opacity: [0, 1],
      scale: [0.9, 1],
      translateY: [30, 0],
      duration: 400,
      delay: 100,
      easing: 'easeOutBack',
    });
  }, [open]);

  // Auto-confirm countdown
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        onConfirm();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, onConfirm]);

  const handleCancel = useCallback(() => {
    setCountdown(null);
    anime({
      targets: panelRef.current,
      opacity: [1, 0],
      scale: [1, 0.95],
      translateY: [0, 20],
      duration: 250,
      easing: 'easeInCubic',
    });
    anime({
      targets: overlayRef.current,
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInCubic',
      complete: onCancel,
    });
  }, [onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ opacity: 0 }}
    >
      {/* Backdrop with red atmospheric glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.08), rgba(0,0,0,0.7) 70%)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={handleCancel}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative max-w-md w-full mx-4 p-8 text-center cyber-card neon-border"
        style={{ opacity: 0 }}
      >
        {/* Pulsing red glow at top */}
        <div
          className="absolute -top-1 left-0 right-0 h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
            boxShadow: '0 0 20px rgba(239,68,68,0.5)',
            animation: 'glowPulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Warning icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent)',
            border: '2px solid rgba(239,68,68,0.2)',
            boxShadow: '0 0 30px rgba(239,68,68,0.1)',
          }}
        >
          <svg
            className="h-10 w-10 text-accent-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 font-display">Confirm Emergency</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-3">
          This will immediately dispatch emergency services to your location
          and notify the nearest hospital.
        </p>

        {/* Emergency number reminder */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.12)',
          }}
        >
          <span className="text-gray-500">You can also call</span>
          <span className="font-mono font-bold text-accent-red-400">112</span>
        </div>

        {/* Countdown display */}
        {countdown !== null && (
          <div className="mb-6">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold font-display"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '2px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                boxShadow: '0 0 20px rgba(239,68,68,0.2)',
              }}
            >
              {countdown}
            </div>
            <p className="text-xs text-gray-500 mt-2">Auto-confirming...</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <GlowButton
            onClick={handleCancel}
            id="modal-cancel"
            className="bg-transparent border border-white/20 text-gray-200 hover:bg-white/10"
          >
            Cancel
          </GlowButton>
          <GlowButton
            onClick={() => {
              if (countdown === null) {
                setCountdown(3);
              } else {
                onConfirm();
              }
            }}
            id="modal-confirm"
            className="from-red-600 via-red-500 to-orange-500 border-red-400/40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            {countdown !== null ? 'Confirm Now' : 'Confirm SOS'}
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
