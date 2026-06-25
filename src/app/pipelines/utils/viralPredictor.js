import hookGenerator from "./hookGenerator";
import scriptAnalyzer from "./scriptAnalyzer";
import thumbnailAnalyzer from "./thumbnailAnalyzer";
import trendScanner from "./trendScanner";

const viralPredictor = {
  predict(card, allCards = []) {
    const results = {
      score: 0,
      strengths: [],
      weaknesses: [],
      platformPredictions: {},
      improvements: [],
    };

    const hooks = hookGenerator.generate({
      topic: card.title,
      niche: card.niche,
      platform: card.platforms?.[0] || "",
    });

    const hookStrength = hooks.length > 0 ? 20 : 0;
    results.score += hookStrength;

    if (hookStrength > 15) {
      results.strengths.push("Strong hook potential");
    } else {
      results.weaknesses.push("Weak or missing hook");
      results.improvements.push("Generate a stronger hook");
    }

    const scriptInsights = scriptAnalyzer.analyze(card);

    const retentionScore =
      20 - scriptInsights.length * 2 > 0 ? 20 - scriptInsights.length * 2 : 0;

    results.score += retentionScore;

    if (retentionScore > 12) {
      results.strengths.push("Good pacing and retention signals");
    } else {
      results.weaknesses.push("Script pacing or structure issues");
      results.improvements.push("Improve pacing and add pattern interrupts");
    }

    const thumbInsights = thumbnailAnalyzer.analyze(card, allCards);

    const thumbnailScore =
      20 - thumbInsights.length * 2 > 0 ? 20 - thumbInsights.length * 2 : 0;

    results.score += thumbnailScore;

    if (thumbnailScore > 12) {
      results.strengths.push("Strong thumbnail potential");
    } else {
      results.weaknesses.push("Thumbnail issues detected");
      results.improvements.push("Improve thumbnail clarity, contrast, or emotion");
    }

    trendScanner.scan({
      niche: card.niche,
      platform: card.platforms?.[0] || "",
    });

    const trendScore = 15;
    results.score += trendScore;
    results.strengths.push("Aligned with current platform/niche trends");

    const best = allCards
      .filter((c) => c.analytics?.totalViews)
      .sort((a, b) => b.analytics.totalViews - a.analytics.totalViews)[0];

    if (best) {
      results.score += 10;
      results.strengths.push("Matches patterns from your top-performing content");
    } else {
      results.weaknesses.push("Not enough historical data for pattern matching");
    }

    for (const platform of card.platforms || []) {
      results.platformPredictions[platform] = {
        viralPotential:
          results.score > 75 ? "High" : results.score > 50 ? "Medium" : "Low",
        notes:
          platform === "tiktok"
            ? "Short, punchy content performs best"
            : platform === "youtube"
              ? "Strong hook + thumbnail required"
              : platform === "instagram"
                ? "Emotional resonance boosts performance"
                : "Platform-specific performance varies",
      };
    }

    if (results.score > 100) results.score = 100;

    return results;
  },
};

export default viralPredictor;
