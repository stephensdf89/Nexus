import { updatePerformanceScores } from "./updatePerformanceScores";
import { updateStrategicScores } from "./updateStrategicScores";
import { calculateGrowthPrediction } from "./growthPrediction";

export async function updateGenomeFromAnalytics(cardId) {
  await updatePerformanceScores(cardId);
  await updateStrategicScores(cardId);
  await calculateGrowthPrediction(cardId);
}
