const seoKeywordExtractor = {
  extract({ topic = "", niche = "", script = "", platform = "" }) {
    const base = (topic || niche || "content").toLowerCase();
    const normalizedPlatform = (platform || "").toLowerCase();

    const text = `${topic} ${niche} ${script}`.toLowerCase();

    const words = text
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const freq = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    const primary = [base, ...sorted.slice(0, 5)];
    const secondary = sorted.slice(5, 15);

    const longTail = [
      `how to ${base}`,
      `what is ${base}`,
      `${base} for beginners`,
      `best way to learn ${base}`,
      `${base} tips`,
      `${base} explained`,
      `${base} step by step`,
      `why ${base} matters`,
      `common ${base} mistakes`,
      `how ${base} works`,
    ];

    const semantic = [
      `${base} guide`,
      `${base} tutorial`,
      `${base} strategy`,
      `${base} framework`,
      `${base} examples`,
      `${base} breakdown`,
      `${base} fundamentals`,
    ];

    const questions = [
      `how does ${base} work`,
      `why is ${base} important`,
      `what makes ${base} effective`,
      `how to improve ${base}`,
      `why people fail at ${base}`,
      `what nobody tells you about ${base}`,
    ];

    const platformKeywords = {};

    if (normalizedPlatform === "youtube") {
      platformKeywords.youtube = [
        `${base} tutorial`,
        `${base} explained`,
        `${base} step by step`,
        `${base} mistakes`,
        `${base} tips and tricks`,
        `${base} full guide`,
      ];
    }

    if (["tiktok", "shorts", "youtube-shorts", "yt-shorts"].includes(normalizedPlatform)) {
      platformKeywords.shortForm = [
        `${base} hack`,
        `${base} trick`,
        `${base} secret`,
        `${base} in 10 seconds`,
        `${base} quick tip`,
      ];
    }

    if (normalizedPlatform === "instagram") {
      platformKeywords.instagram = [
        `${base} aesthetic`,
        `${base} inspo`,
        `${base} ideas`,
        `${base} transformation`,
      ];
    }

    if (normalizedPlatform === "linkedin") {
      platformKeywords.linkedin = [
        `${base} strategy`,
        `${base} leadership`,
        `${base} professional development`,
        `${base} insights`,
      ];
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      platformKeywords.x = [
        `${base} thread`,
        `${base} breakdown`,
        `${base} insights`,
        `${base} take`,
      ];
    }

    return {
      primary: [...new Set(primary)],
      secondary: [...new Set(secondary)],
      longTail: [...new Set(longTail)],
      semantic: [...new Set(semantic)],
      questions: [...new Set(questions)],
      platformKeywords,
    };
  },
};

export default seoKeywordExtractor;
