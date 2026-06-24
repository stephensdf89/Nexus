const thumbnailAnalyzer = {
  analyze(card, allCards) {
    const suggestions = [];
    const t = card.thumbnail_analysis || {};

    // -----------------------------------------
    // 1. FACE ANALYSIS
    // -----------------------------------------
    if (!t.face_detected) {
      suggestions.push("Add a face to your thumbnail — faces significantly increase CTR.");
    } else {
      if (t.face_size === "small") {
        suggestions.push("Increase the face size — larger faces tend to perform better.");
      }

      if (!t.eye_contact) {
        suggestions.push("Use eye contact in your thumbnail — it draws viewer attention.");
      }

      if (t.emotion === "neutral") {
        suggestions.push("Use a stronger facial expression — emotion boosts CTR.");
      }
    }

    // -----------------------------------------
    // 2. TEXT ANALYSIS
    // -----------------------------------------
    if (t.text_present) {
      if (t.text_word_count > 5) {
        suggestions.push("Reduce thumbnail text — keep it punchy and under 5 words.");
      }

      if (t.text_contrast === "low") {
        suggestions.push("Increase text contrast — low contrast text is hard to read.");
      }

      if (t.text_size === "small") {
        suggestions.push("Increase text size — small text gets lost on mobile.");
      }

      if (t.text_placement === "bottom") {
        suggestions.push("Move text away from the bottom — it often gets cropped on mobile.");
      }
    } else {
      suggestions.push("Consider adding 1–3 words of text to clarify the video’s hook.");
    }

    // -----------------------------------------
    // 3. COMPOSITION ANALYSIS
    // -----------------------------------------
    if (t.clutter_score && t.clutter_score > 0.6) {
      suggestions.push("Reduce visual clutter — simplify the background or remove distractions.");
    }

    if (!t.rule_of_thirds_alignment) {
      suggestions.push("Align your subject using the rule of thirds for stronger composition.");
    }

    if (t.dead_space) {
      suggestions.push("Fill or crop dead space — empty areas weaken the thumbnail impact.");
    }

    // -----------------------------------------
    // 4. COLOR PSYCHOLOGY
    // -----------------------------------------
    if (t.color_contrast === "low") {
      suggestions.push("Increase color contrast — low contrast thumbnails blend into the feed.");
    }

    if (t.palette === "muted") {
      suggestions.push("Use more vibrant colors — muted palettes underperform in most niches.");
    }

    if (t.dominant_color === "blue" && card.category === "high-energy") {
      suggestions.push("Use warmer colors — blue is calming and may reduce urgency.");
    }

    // -----------------------------------------
    // 5. PERSONAL PERFORMANCE PATTERNS
    // -----------------------------------------
    const best = allCards
      .filter((c) => c.analytics?.youtube?.ctr)
      .sort((a, b) => b.analytics.youtube.ctr - a.analytics.youtube.ctr)[0];

    if (best && best.thumbnail_analysis) {
      if (best.thumbnail_analysis.face_detected && !t.face_detected) {
        suggestions.push("Your best-performing thumbnails include faces — consider adding one.");
      }

      if (best.thumbnail_analysis.text_present && !t.text_present) {
        suggestions.push("Your top thumbnails use text — consider adding a short phrase.");
      }

      if (
        best.thumbnail_analysis.color_contrast === "high" &&
        t.color_contrast !== "high"
      ) {
        suggestions.push("High-contrast colors match your best-performing thumbnails.");
      }
    }

    return suggestions.length > 0
      ? suggestions
      : ["Thumbnail looks strong — no major improvements detected."];
  }
};

export default thumbnailAnalyzer;
