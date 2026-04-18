import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AStarRouteScoringStrategy,
  RouteCandidate,
  selectBestRoute,
} from './routeScoring';

test('A* strategy computes cost and heuristic correctly', () => {
  const strategy = new AStarRouteScoringStrategy();

  const route: RouteCandidate = {
    distance: 10,
    duration: 15,
    traffic: 0.5,
  };

  const score = strategy.score(route, {
    trafficWeight: 2,
    avgSpeed: 50,
  });

  assert.equal(score.baseCost, 11);
  assert.equal(score.heuristic, 0.2);
  assert.equal(score.totalCost, 11.2);
});

test('selectBestRoute returns route with minimum total cost', () => {
  const routes: RouteCandidate[] = [
    { id: 'route-a', distance: 12, duration: 18, traffic: 0.2 },
    { id: 'route-b', distance: 10, duration: 17, traffic: 0.8 },
    { id: 'route-c', distance: 11, duration: 20, traffic: 0.1 },
  ];

  const result = selectBestRoute(routes, {
    trafficWeight: 3,
    avgSpeed: 40,
  });

  assert.ok(result.bestRoute);
  assert.equal(result.bestRoute?.id, 'route-c');
  assert.equal(result.rankedRoutes.length, 3);
  const [first, second, third] = result.rankedRoutes;
  assert.ok(first && second && third);
  assert.ok(first.score.totalCost <= second.score.totalCost);
  assert.ok(second.score.totalCost <= third.score.totalCost);
});

test('selectBestRoute handles empty routes list', () => {
  const result = selectBestRoute([], {
    trafficWeight: 1,
    avgSpeed: 40,
  });

  assert.equal(result.bestRoute, null);
  assert.equal(result.rankedRoutes.length, 0);
});
