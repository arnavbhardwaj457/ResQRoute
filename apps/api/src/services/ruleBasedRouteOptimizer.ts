import {
  AStarRouteScoringStrategy,
  RouteCandidate,
  RouteScoreBreakdown,
  RouteScoringConfig,
} from './routeScoring';

export type OptimizationContext = RouteScoringConfig & {
  isPeakHour: boolean;
  highTrafficThreshold: number;
  highTrafficMultiplier: number;
  peakHourDelayFactor: number;
};

export type RoutePenalty = {
  rule: string;
  extraCost: number;
};

export type OptimizedRoute = RouteCandidate & {
  score: RouteScoreBreakdown & {
    penalties: RoutePenalty[];
    adjustedTotalCost: number;
  };
};

export interface RouteAdjustmentRule {
  apply(route: RouteCandidate, context: OptimizationContext): RoutePenalty | null;
}

export interface RouteOptimizer {
  optimize(routes: RouteCandidate[], context: OptimizationContext): {
    bestRoute: OptimizedRoute | null;
    rankedRoutes: OptimizedRoute[];
  };
}

export class HighTrafficRule implements RouteAdjustmentRule {
  apply(route: RouteCandidate, context: OptimizationContext): RoutePenalty | null {
    if (route.traffic < context.highTrafficThreshold) {
      return null;
    }

    const extraCost = route.distance * route.traffic * context.highTrafficMultiplier;
    return {
      rule: 'high_traffic_penalty',
      extraCost,
    };
  }
}

export class PeakHourRule implements RouteAdjustmentRule {
  apply(route: RouteCandidate, context: OptimizationContext): RoutePenalty | null {
    if (!context.isPeakHour) {
      return null;
    }

    const extraCost = route.duration * context.peakHourDelayFactor;
    return {
      rule: 'peak_hour_delay_penalty',
      extraCost,
    };
  }
}

export class RuleBasedRouteOptimizer implements RouteOptimizer {
  constructor(
    private readonly strategy = new AStarRouteScoringStrategy(),
    private readonly rules: RouteAdjustmentRule[] = [new HighTrafficRule(), new PeakHourRule()],
  ) {}

  optimize(routes: RouteCandidate[], context: OptimizationContext) {
    if (routes.length === 0) {
      return { bestRoute: null, rankedRoutes: [] as OptimizedRoute[] };
    }

    const rankedRoutes = routes
      .map((route) => {
        const baseScore = this.strategy.score(route, context);
        const penalties = this.rules
          .map((rule) => rule.apply(route, context))
          .filter((penalty): penalty is RoutePenalty => penalty !== null);

        const penaltyTotal = penalties.reduce((sum, penalty) => sum + penalty.extraCost, 0);

        return {
          ...route,
          score: {
            ...baseScore,
            penalties,
            adjustedTotalCost: baseScore.totalCost + penaltyTotal,
          },
        };
      })
      .sort((a, b) => a.score.adjustedTotalCost - b.score.adjustedTotalCost);

    return {
      bestRoute: rankedRoutes[0] ?? null,
      rankedRoutes,
    };
  }
}

export function isCurrentPeakHour(now = new Date()) {
  const hour = now.getHours();
  const morningPeak = hour >= 7 && hour <= 10;
  const eveningPeak = hour >= 16 && hour <= 19;
  return morningPeak || eveningPeak;
}
