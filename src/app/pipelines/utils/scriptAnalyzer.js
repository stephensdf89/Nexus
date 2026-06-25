const scriptAnalyzer = {
  analyze(card) {
    const script = card.script || card.platform_fields?.youtube?.youtube_script || "";

    if (!script || script.trim().length === 0) {
      return ["No script found - add a script to generate insights."];
    }

    const suggestions = [];
    const platforms = Array.isArray(card?.platforms) ? card.platforms : [];

    // -----------------------------------------
    // 1. HOOK ANALYSIS
    // -----------------------------------------
    const firstLine = script.split("\n")[0] || "";

    if (firstLine.length < 5) {
      suggestions.push("Your hook is too short - add a stronger opening line.");
    }

    if (!/[?!]/.test(firstLine) && !firstLine.includes("you")) {
      suggestions.push("Hooks perform better when they directly address the viewer.");
    }

    if (!/(secret|mistake|you won't believe|stop|before you)/i.test(firstLine)) {
      suggestions.push("Consider adding a curiosity trigger to your hook.");
    }

    // -----------------------------------------
    // 2. PACING ANALYSIS
    // -----------------------------------------
    const sentences = script
      .replace(/\n/g, " ")
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const avgLength =
      sentences.reduce((a, s) => a + s.split(" ").length, 0) /
      (sentences.length || 1);

    if (avgLength > 18) {
      suggestions.push("Your pacing is slow - shorten sentences to increase momentum.");
    }

    if (avgLength < 6) {
      suggestions.push("Your pacing is too fast - add more context or transitions.");
    }

    // -----------------------------------------
    // 3. RETENTION ANALYSIS
    // -----------------------------------------
    if (!/but|however|the real reason|what you don't know/i.test(script)) {
      suggestions.push("Add a pattern interrupt to improve retention.");
    }

    if (!/story|example|let me show you/i.test(script)) {
      suggestions.push("Add a story or example - narrative boosts retention.");
    }

    // -----------------------------------------
    // 4. STRUCTURE ANALYSIS
    // -----------------------------------------
    if (!/call to action|subscribe|follow|check this out/i.test(script)) {
      suggestions.push("Add a CTA at the end to drive action.");
    }

    if (!/here's how|step one|first|next/i.test(script)) {
      suggestions.push("Add clearer structure - steps or transitions help viewer comprehension.");
    }

    // -----------------------------------------
    // 5. CLARITY ANALYSIS
    // -----------------------------------------
    if (/\b(um|uh|like|you know)\b/i.test(script)) {
      suggestions.push("Remove filler words to improve clarity and authority.");
    }

    if (/\b(is|was|were|be|been)\b/i.test(script)) {
      suggestions.push("Replace weak verbs with stronger action verbs.");
    }

    if (/\bvery|really|basically|literally\b/i.test(script)) {
      suggestions.push("Remove intensifiers - they weaken your message.");
    }

    // -----------------------------------------
    // 6. PLATFORM-SPECIFIC ADJUSTMENTS
    // -----------------------------------------
    if (platforms.includes("tiktok") || platforms.includes("shorts")) {
      if (avgLength > 12) {
        suggestions.push("Short-form content needs faster pacing - tighten your sentences.");
      }

      if (!/in the next 5 seconds|watch this|don't scroll/i.test(firstLine)) {
        suggestions.push("Short-form hooks should be more aggressive to stop scrolling.");
      }
    }

    if (platforms.includes("youtube")) {
      if (!/value|learn|how to|why/i.test(firstLine)) {
        suggestions.push("YouTube hooks perform better when they promise clear value.");
      }

      if (!/recap|summary|final thoughts/i.test(script)) {
        suggestions.push("Add a closing summary to improve retention and watch time.");
      }
    }

    return suggestions.length > 0
      ? suggestions
      : ["Script looks strong - no major improvements detected."];
  },
};

export default scriptAnalyzer;
