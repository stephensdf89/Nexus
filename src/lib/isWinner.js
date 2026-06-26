export function isWinner(perf, averages) {
  const score =
    (perf.likes || 0) * 1 +
    (perf.comments || 0) * 2 +
    (perf.shares || 0) * 3 +
    (perf.views || 0) * 0.01 +
    (perf.watchTime || 0) * 0.05;

  const avgScore =
    averages.likes * 1 +
    averages.comments * 2 +
    averages.shares * 3 +
    averages.views * 0.01 +
    averages.watchTime * 0.05;

  // Winner if > 160% of average
  return score > avgScore * 1.6;
}
