import hookGenerator from "./hookGenerator";
import scriptRewriter from "./scriptRewriter";
import captionGenerator from "./captionGenerator";
import titleGenerator from "./titleGenerator";
import thumbnailAnalyzer from "./thumbnailAnalyzer";
import viralPredictor from "./viralPredictor";

const viralOptimizer = {
  optimize(card, allCards) {
    const optimized = {};

    const hooks = hookGenerator.generate({
      topic: card.title,
      niche: card.niche,
      platform: card.platforms[0],
      vibe: "aggressive",
    });

    optimized.hook = hooks[0];

    optimized.script = scriptRewriter.rewrite({
      script: card.script,
      topic: card.title,
      platform: card.platforms[0],
      niche: card.niche,
      vibe: "aggressive",
    });

    optimized.caption = captionGenerator.generate({
      topic: card.title,
      niche: card.niche,
      platform: card.platforms[0],
      vibe: "aggressive",
    });

    const titles = titleGenerator.generate({
      topic: card.title,
      niche: card.niche,
      platform: card.platforms[0],
      vibe: "aggressive",
    });

    optimized.title = titles[0];

    optimized.thumbnailSuggestions = thumbnailAnalyzer.analyze(card, allCards);

    optimized.viralPrediction = viralPredictor.predict(
      { ...card, ...optimized },
      allCards
    );

    return optimized;
  },
};

export default viralOptimizer;
