'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { Skeleton } from '@/components/ui/Skeleton';

interface StatusStep {
  label: string;
  description: string;
  estimate: string;
  completed: boolean;
  active: boolean;
  icon: string;
}

interface StatusTrackerProps {
  loading?: boolean;
  emergencyActive: boolean;
  routeReady: boolean;
}

const getSteps = (emergencyActive: boolean, routeReady: boolean): StatusStep[] => [
  {
    label: 'SOS Triggered',
    description: 'Emergency signal sent to dispatch',
    estimate: '0-10 sec',
    completed: emergencyActive,
    active: emergencyActive && !routeReady,
    icon: '🚨',
  },
  {
    label: 'Location Acquired',
    description: 'GPS coordinates locked via satellite',
    estimate: '10-25 sec',
    completed: emergencyActive,
    active: false,
    icon: '📍',
  },
  {
    label: 'Route Calculated',
    description: 'Optimal path on Indian roads',
    estimate: '25-45 sec',
    completed: routeReady,
    active: emergencyActive && routeReady,
    icon: '🗺️',
  },
  {
    label: 'Hospital Notified',
    description: 'ER team preparing for arrival',
    estimate: '45-60 sec',
    completed: false,
    active: false,
    icon: '🏥',
  },
  {
    label: 'Ambulance Dispatched',
    description: 'Unit en route to your location',
    estimate: '1-3 min',
    completed: false,
    active: false,
    icon: '🚑',
  },
];

export function StatusTracker({
  loading = false,
  emergencyActive,
  routeReady,
}: StatusTrackerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || loading) return;
    anime({
      targets: cardRef.current,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 500,
      easing: 'easeOutCubic',
    });
  }, [loading]);

  useEffect(() => {
    if (!stepsRef.current || loading) return;
    anime({
      targets: stepsRef.current.querySelectorAll('.step-item'),
      translateX: [-15, 0],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(80, { start: 700 }),
      easing: 'easeOutCubic',
    });
  }, [loading]);

  if (loading) {
    return (
      <div className="cyber-card p-5 space-y-3">
        <Skeleton variant="line" className="w-24 h-3" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton variant="circle" className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="line" className="w-3/4" />
              <Skeleton variant="line" className="w-1/2 h-2.5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const steps = getSteps(emergencyActive, routeReady);

  return (
    <div ref={cardRef} className="cyber-card p-5" style={{ opacity: 0 }}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="hud-label">Response Pipeline</h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cyber-cyan/80">
          <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-ping" />
          Live
        </span>
      </div>

      <div ref={stepsRef} className="space-y-1">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;

          return (
            <div key={step.label} className="step-item flex items-start gap-3" style={{ opacity: 0 }}>
              {/* Timeline */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Dot */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    step.completed
                      ? 'border-emerald-400/50 bg-emerald-400/10'
                      : step.active
                        ? 'border-cyber-cyan/50 bg-cyber-cyan/10'
                        : 'border-gray-700/50 bg-transparent'
                  }`}
                  style={
                    step.active
                      ? { boxShadow: '0 0 10px rgba(0,240,255,0.2)' }
                      : step.completed
                        ? { boxShadow: '0 0 8px rgba(34,197,94,0.15)' }
                        : {}
                  }
                >
                  {step.completed ? (
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : step.active ? (
                    <span className="h-2 w-2 rounded-full bg-cyber-cyan animate-pulse" />
                  ) : (
                    <span className="text-[10px]">{step.icon}</span>
                  )}
                </div>

                {/* Line */}
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 mt-1 transition-colors duration-500 ${
                      step.completed
                        ? 'bg-emerald-400/20'
                        : step.active
                          ? 'bg-cyber-cyan/20'
                          : 'bg-gray-800'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pt-0.5 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    step.completed
                      ? 'text-white'
                      : step.active
                        ? 'text-cyber-cyan'
                        : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">{step.description}</p>
                <p className="text-[10px] text-cyber-cyan/60 mt-1 font-mono">ETA {step.estimate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusTracker;
