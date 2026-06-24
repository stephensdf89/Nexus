import analyticsEngine from "./analyticsEngine";
import performanceInsights from "./performanceInsights";

const optimizationEngine = {
  generate(card, allCards) {
    const suggestions = [];

    // -----------------------------------------
    // 1. YOUTUBE OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("youtube")) {
      const yt = card.platform_fields?.youtube || {};

      // Description depth
      if (!yt.youtube_description || yt.youtube_description.trim().length < 50) {
        suggestions.push("Add more detail to your YouTube description to improve SEO and retention.");
      }

      // Tags
      if ((yt.youtube_tags || "").split(",").length < 5) {
        suggestions.push("Add more YouTube tags — aim for a broader keyword spread.");
      }

      // Thumbnail face detection
      if (!card.thumbnail_has_face) {
        suggestions.push("Your YouTube thumbnails perform better with faces — consider adding one.");
      }

      // Hook suggestion
      if (card.duration && card.duration > 60) {
        suggestions.push("Strengthen your hook in the first 3 seconds for long-form YouTube videos.");
      }
    }

    // -----------------------------------------
    // 2. TIKTOK OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("tiktok")) {
      const tk = card.platform_fields?.tiktok || {};

      // Hashtags
      const tagCount = (tk.tiktok_hashtags || "").split(" ").length;
      if (tagCount < 3) {
        suggestions.push("Add more TikTok hashtags — aim for a mix of niche and broad tags.");
      }

      // Duration
      if (card.duration && card.duration > 15) {
        suggestions.push("Shorten your TikTok — your short-form videos under 12 seconds perform better.");
      }
    }

    // -----------------------------------------
    // 3. INSTAGRAM OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("instagram")) {
      const ig = card.platform_fields?.instagram || {};

      const tagCount = (ig.instagram_hashtags || "").split(" ").length;
      if (tagCount < 15) {
        suggestions.push("Use more Instagram hashtags — your posts perform better with a larger set.");
      }

      if (!ig.instagram_alt_text) {
        suggestions.push("Add alt text to your Instagram post — improves accessibility and SEO.");
      }
    }

    // -----------------------------------------
    // 4. SHORTS OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("shorts")) {
      const sh = card.platform_fields?.shorts || {};

      if (card.duration && card.duration > 20) {
        suggestions.push("Shorten your YouTube Short — aim for a tighter, punchier delivery.");
      }
    }

    // -----------------------------------------
    // 5. X (TWITTER) OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("x")) {
      const x = card.platform_fields?.x || {};

      if ((x.x_text || "").includes("http")) {
        suggestions.push("Avoid links in X posts — they reduce engagement.");
      }
    }

    // -----------------------------------------
    // 6. LINKEDIN OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("linkedin")) {
      const ln = card.platform_fields?.linkedin || {};

      if ((ln.linkedin_text || "").includes("http")) {
        suggestions.push("Avoid external links in LinkedIn posts — they reduce reach.");
      }
    }

    // -----------------------------------------
    // 7. PINTEREST OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("pinterest")) {
      const pt = card.platform_fields?.pinterest || {};

      if (!pt.pinterest_title || pt.pinterest_title.trim().length < 10) {
        suggestions.push("Add a more descriptive Pinterest title to improve search visibility.");
      }

      if (!pt.pinterest_description || pt.pinterest_description.trim().length < 50) {
        suggestions.push("Expand your Pinterest description to improve ranking and engagement.");
      }
    }

    // -----------------------------------------
    // 8. FACEBOOK OPTIMIZATION
    // -----------------------------------------
    if (card.platforms.includes("facebook")) {
      const fb = card.platform_fields?.facebook || {};

      if (!fb.facebook_caption || fb.facebook_caption.trim().length < 20) {
        suggestions.push("Add more detail to your Facebook caption to increase engagement.");
      }
    }

    // -----------------------------------------
    // 9. PERFORMANCE-BASED INSIGHTS
    // -----------------------------------------
    const aiInsights = performanceInsights.generate(allCards);
    suggestions.push(...aiInsights);

    return suggestions;
  }
};

export default optimizationEngine;
