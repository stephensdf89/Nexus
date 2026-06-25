const trendScanner = {
  scan({ niche = "", platform = "" }) {
    const base = niche || "your niche";
    const normalizedPlatform = (platform || "").toLowerCase();

    const trends = {
      platformTrends: [],
      nicheTrends: [],
      seasonalTrends: [],
      formatTrends: [],
      predictions: [],
    };

    if (["tiktok", "shorts", "youtube-shorts", "yt-shorts"].includes(normalizedPlatform)) {
      trends.platformTrends.push(
        "Fast-cut storytelling",
        "Text-on-screen hooks",
        "Jump-cut confessionals",
        "Green-screen commentary",
        "POV-style narratives",
        "Micro-tutorials under 10 seconds"
      );
    }

    if (normalizedPlatform === "youtube") {
      trends.platformTrends.push(
        "Documentary-style shorts",
        "Long-form deep dives",
        "Minimalist thumbnails",
        "Face + bold text thumbnails",
        "Story-driven educational videos",
        "Challenge-style content"
      );
    }

    if (normalizedPlatform === "instagram") {
      trends.platformTrends.push(
        "Aesthetic B-roll reels",
        "Day-in-the-life edits",
        "Photo dumps with storytelling captions",
        "Soft hooks with emotional tone",
        "Transformation reels"
      );
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      trends.platformTrends.push(
        "Contrarian takes",
        "Mini-threads (3-5 posts)",
        "Punchline-first posts",
        "Hot takes on industry news",
        "Framework breakdowns"
      );
    }

    if (normalizedPlatform === "linkedin") {
      trends.platformTrends.push(
        "Personal story + lesson posts",
        "Carousel-style insights",
        "Short leadership frameworks",
        "Industry predictions",
        "Behind-the-scenes professional stories"
      );
    }

    trends.nicheTrends.push(
      `Rising interest in "beginner-friendly" ${base} content`,
      `More creators sharing personal stories about ${base}`,
      `High engagement on contrarian takes about ${base}`,
      `Growing demand for step-by-step ${base} tutorials`,
      `Increased interest in "what I'd do differently" ${base} content`,
      `More creators using humor to explain ${base}`
    );

    trends.seasonalTrends.push(
      "Summer productivity spikes",
      "Back-to-school content waves",
      "Holiday transformation content",
      "New Year goal-setting trends",
      "Quarterly reset content",
      "Seasonal aesthetic trends"
    );

    trends.formatTrends.push(
      "Hook-first storytelling",
      "Split-screen comparisons",
      "Before/after transformations",
      "List-style breakdowns",
      "Fast-paced micro-lessons",
      "Voiceover-driven reels"
    );

    trends.predictions.push(
      `More creators will shift toward long-form storytelling in ${base}.`,
      `Short-form educational content in ${base} will continue rising.`,
      `Contrarian takes in ${base} will outperform safe content.`,
      `Creators who mix humor with ${base} will see higher retention.`,
      `Multi-platform repurposing will become essential in ${base}.`,
      `Authentic, unpolished content will outperform highly produced content in ${base}.`
    );

    return trends;
  },
};

export default trendScanner;
