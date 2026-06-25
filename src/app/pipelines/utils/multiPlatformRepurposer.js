import hookGenerator from "./hookGenerator";
import scriptRewriter from "./scriptRewriter";
import captionGenerator from "./captionGenerator";
import titleGenerator from "./titleGenerator";
import hashtagGenerator from "./hashtagGenerator";

const multiPlatformRepurposer = {
  repurpose({ script = "", topic = "", niche = "", vibe = "" }) {
    const platforms = [
      "tiktok",
      "shorts",
      "instagram",
      "youtube",
      "x",
      "linkedin",
      "pinterest",
      "facebook",
    ];

    const output = {};

    for (const platform of platforms) {
      const hook = hookGenerator.generate({
        topic,
        niche,
        platform,
        vibe,
      })[0];

      const rewrittenScript = scriptRewriter.rewrite({
        script,
        topic,
        platform,
        niche,
        vibe,
      });

      const caption = captionGenerator.generate({
        topic,
        niche,
        platform,
        vibe,
      });

      const title = titleGenerator.generate({
        topic,
        niche,
        platform,
        vibe,
      })[0];

      const hashtags = hashtagGenerator.generate({
        topic,
        niche,
        platform,
        vibe,
      });

      const formatNotes =
        platform === "tiktok" || platform === "shorts"
          ? "Fast pacing, punchy hook, text-on-screen, quick cuts."
          : platform === "instagram"
            ? "Aesthetic visuals, emotional tone, soft transitions."
            : platform === "youtube"
              ? "Strong hook, structured value, clear CTA, thumbnail synergy."
              : platform === "x"
                ? "Punchline-first, contrarian, concise."
                : platform === "linkedin"
                  ? "Professional tone, insight-driven, leadership framing."
                  : platform === "pinterest"
                    ? "Transformation-focused, inspirational, search-friendly."
                    : "Conversational, community-driven.";

      output[platform] = {
        hook,
        script: rewrittenScript,
        caption,
        title,
        hashtags,
        formatNotes,
      };
    }

    return output;
  },
};

export default multiPlatformRepurposer;
