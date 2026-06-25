const autoThumbnailGenerator = {
  generate({ title = "", topic = "", niche = "", vibe = "", bestPatterns = {} }) {
    const base = title || topic || niche || "your topic";

    const variations = [];

    // -----------------------------------------
    // VARIATION 1 - FACE + BIG TEXT
    // -----------------------------------------
    variations.push({
      layout: "Face close-up + bold 2-word text",
      text: [
        `"${base.split(" ")[0]}?"`,
        `"The Truth"`,
        `"Stop This"`
      ],
      emotion: "Shock or confusion",
      colors: "High contrast (yellow + black or red + white)",
      background: "Blurred environment or gradient",
      notes: "This layout matches high-CTR patterns across most niches."
    });

    // -----------------------------------------
    // VARIATION 2 - SPLIT SCREEN BEFORE/AFTER
    // -----------------------------------------
    variations.push({
      layout: "Before/After split screen",
      text: [
        "Before",
        "After",
        "Fixed"
      ],
      emotion: "Neutral -> confident",
      colors: "Warm tones for 'after', cool tones for 'before'",
      background: "Simple gradient or blurred workspace",
      notes: "Great for transformation or educational content."
    });

    // -----------------------------------------
    // VARIATION 3 - OBJECT FOCUS + MINIMAL TEXT
    // -----------------------------------------
    variations.push({
      layout: "Object close-up + 1-word text",
      text: [
        base.split(" ")[0],
        "Why?",
        "Broken"
      ],
      emotion: "None (object-focused)",
      colors: "High saturation object + dark background",
      background: "Vignette or spotlight effect",
      notes: "Works extremely well for tech, tutorials, and reviews."
    });

    // -----------------------------------------
    // VARIATION 4 - REACTION FACE + BIG ARROW
    // -----------------------------------------
    variations.push({
      layout: "Reaction face + arrow pointing at object/text",
      text: [
        "This!",
        "Look",
        "Crazy"
      ],
      emotion: "Surprised or shocked",
      colors: "Red arrow + white text",
      background: "Blurred screenshot or gradient",
      notes: "Classic YouTube CTR booster."
    });

    // -----------------------------------------
    // VARIATION 5 - MINIMALIST TEXT ONLY
    // -----------------------------------------
    variations.push({
      layout: "Minimalist text-only thumbnail",
      text: [
        base,
        base.split(" ").slice(0, 2).join(" "),
        "The Truth"
      ],
      emotion: "None",
      colors: "Black + white or neon accent",
      background: "Solid color or subtle gradient",
      notes: "Works for authority, storytelling, and serious topics."
    });

    // -----------------------------------------
    // VARIATION 6 - TREND-ALIGNED STYLE
    // -----------------------------------------
    variations.push({
      layout: "Trending platform style",
      text: [
        "Wait-",
        "No way",
        "Watch"
      ],
      emotion: "Curiosity",
      colors: "Platform-specific (TikTok neon, YouTube red/white)",
      background: "Soft blur + glow",
      notes: "Auto-aligns with current platform trends."
    });

    return variations;
  }
};

export default autoThumbnailGenerator;
