import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isCurrentPeakHour,
  RuleBasedRouteOptimizer,
} from './ruleBasedRouteOptimizer';

const optimizer = new RuleBasedRouteOptimizer();

test('high traffic rule increases adjusted cost for congested routes', () => {
  const result = optimizer.optimize(
    [
      { id: 'low-traffic', distance: 10, duration: 18, traffic: 0.1 },
      { id: 'high-traffic', distance: 10, duration: 18, traffic: 0.9 },
    ],
    {
      trafficWeight: 1,
      avgSpeed: 40,
      isPeakHour: false,
      highTrafficThreshold: 0.5,
      highTrafficMultiplier: 2,
      peakHourDelayFactor: 0.1,
    },
  );

  assert.ok(result.bestRoute);
  assert.equal(result.bestRoute?.id, 'low-traffic');

  const highTraffic = result.rankedRoutes.find((route) => route.id === 'high-traffic');
  assert.ok(highTraffic);
  assert.ok(highTraffic.score.penalties.some((penalty) => penalty.rule === 'high_traffic_penalty'));
});

test('peak hour rule adds delay penalty during peak windows', () => {
  const result = optimizer.optimize(
    [{ id: 'candidate-1', distance: 8, duration: 20, traffic: 0.2 }],
    {
      trafficWeight: 1,
      avgSpeed: 40,
      isPeakHour: true,
      highTrafficThreshold: 0.5,
      highTrafficMultiplier: 1,
      peakHourDelayFactor: 0.2,
    },
  );

  const [route] = result.rankedRoutes;
  assert.ok(route);
  assert.ok(route.score.penalties.some((penalty) => penalty.rule === 'peak_hour_delay_penalty'));
  assert.ok(route.score.adjustedTotalCost > route.score.totalCost);
});

test('isCurrentPeakHour recognizes peak and non-peak times', () => {
  const peakMorning = new Date('2026-04-18T08:00:00');
  const nonPeakNight = new Date('2026-04-18T23:00:00');

  assert.equal(isCurrentPeakHour(peakMorning), true);
  assert.equal(isCurrentPeakHour(nonPeakNight), false);
});
