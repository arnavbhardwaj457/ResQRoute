import React from 'react';

type SkeletonVariant = 'line' | 'rect' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

export function Skeleton({ variant = 'line', className = '' }: SkeletonProps) {
  const base = 'animate-shimmer bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%]';
  const shape =
    variant === 'circle'
      ? 'rounded-full h-10 w-10'
      : variant === 'rect'
        ? 'rounded-xl h-20 w-full'
        : 'rounded-md h-4 w-full';

  return <div className={`${base} ${shape} ${className}`} aria-hidden="true" />;
}

export function MapSkeleton() {
  return (
    <div className="h-full w-full min-h-[320px] bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-cyber-cyan/40 border-t-cyber-cyan animate-spin" />
        <p className="mt-3 text-xs text-gray-500">Loading map layer...</p>
      </div>
    </div>
  );
}

export default Skeleton;
