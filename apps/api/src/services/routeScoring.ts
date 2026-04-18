export type RouteCandidate = {
  id?: string;
  distance: number;
  duration: number;
  traffic: number;
};

export type RouteScoringConfig = {
  trafficWeight: number;
  avgSpeed: number;
};

export type RouteScoreBreakdown = {
  baseCost: number;
  heuristic: number;
  totalCost: number;
};

export type ScoredRoute = RouteCandidate & {
  score: RouteScoreBreakdown;
};

export interface RouteScoringStrategy {
  score(route: RouteCandidate, config: RouteScoringConfig): RouteScoreBreakdown;
}

export class AStarRouteScoringStrategy implements RouteScoringStrategy {
  score(route: RouteCandidate, config: RouteScoringConfig): RouteScoreBreakdown {
    const baseCost = route.distance + config.trafficWeight * route.traffic;
    const heuristic = route.distance / config.avgSpeed;
    const totalCost = baseCost + heuristic;

    return { baseCost, heuristic, totalCost };
  }
}

export type RouteSelector = {
  strategy: RouteScoringStrategy;
};

export function selectBestRoute(
  routes: RouteCandidate[],
  config: RouteScoringConfig,
  selector: RouteSelector = { strategy: new AStarRouteScoringStrategy() },
): {
  bestRoute: ScoredRoute | null;
  rankedRoutes: ScoredRoute[];
} {
  if (routes.length === 0) {
    return { bestRoute: null, rankedRoutes: [] };
  }

  const rankedRoutes = routes
    .map((route) => ({
      ...route,
      score: selector.strategy.score(route, config),
    }))
    .sort((a, b) => a.score.totalCost - b.score.totalCost);

  return {
    bestRoute: rankedRoutes[0] ?? null,
    rankedRoutes,
  };
}
