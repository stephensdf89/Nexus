const hookGenerator = {
  generate({ topic = "", niche = "", platform = "", vibe = "" }) {
    const hooks = [];

    const base = topic || niche || "this";
    const normalizedPlatform = (platform || "").toLowerCase();
    const normalizedVibe = (vibe || "").toLowerCase();

    // TikTok / Shorts (fast, punchy, scroll-stoppers)
    if (["tiktok", "shorts", "youtube-shorts", "yt-shorts"].includes(normalizedPlatform)) {
      hooks.push(
        `Stop scrolling - you need to hear this about ${base}.`,
        `Nobody told you this about ${base}.`,
        `If you're doing ${base} like this... you're doing it wrong.`,
        `This will change how you think about ${base}.`,
        `I bet you didn't know this about ${base}.`,
        `Here's the part about ${base} nobody talks about.`,
        "You're not ready for what I'm about to show you.",
        `This is the fastest way to improve your ${base}.`
      );
    }

    // YouTube (value, curiosity, tension)
    if (normalizedPlatform === "youtube") {
      hooks.push(
        `Before you try ${base}, watch this.`,
        `The truth about ${base} that nobody wants to admit.`,
        `I tested ${base} so you don't have to.`,
        `If I had to start over, here's exactly how I'd approach ${base}.`,
        `This one mistake is ruining your ${base}.`,
        `Here's what I wish I knew about ${base} years ago.`,
        `Everyone is doing ${base} wrong - here's the fix.`,
        `This is the fastest way to get better at ${base}.`
      );
    }

    // Instagram (emotional, relatable, aesthetic)
    if (normalizedPlatform === "instagram") {
      hooks.push(
        `You won't believe how much this changed my ${base}.`,
        "I didn't realize how badly I needed this.",
        `This is your sign to finally start ${base}.`,
        `If you're struggling with ${base}, this is for you.`,
        `This small shift changed everything for my ${base}.`
      );
    }

    // X (punchline, contrarian, bold)
    if (["x", "twitter"].includes(normalizedPlatform)) {
      hooks.push(
        `${base} is broken - here's the fix.`,
        `Unpopular opinion: you're doing ${base} wrong.`,
        `Everyone is overcomplicating ${base}.`,
        `The fastest way to master ${base}? Do less.`,
        `The biggest lie about ${base} is finally collapsing.`
      );
    }

    // LinkedIn (authority, insight, leadership)
    if (normalizedPlatform === "linkedin") {
      hooks.push(
        `Most people misunderstand ${base}. Here's what actually matters.`,
        `The biggest mistake professionals make with ${base}.`,
        `Here's the strategy top performers use for ${base}.`,
        `If you want to excel at ${base}, start here.`,
        `This mindset shift transformed how I approach ${base}.`
      );
    }

    // Pinterest (inspiration, transformation)
    if (normalizedPlatform === "pinterest") {
      hooks.push(
        `The easiest way to transform your ${base}.`,
        `A simple idea that will elevate your ${base}.`,
        `Try this if you want better results with ${base}.`
      );
    }

    if (normalizedVibe === "aggressive") {
      hooks.push(
        `You're wasting time doing ${base} like this.`,
        `Stop doing ${base} the slow way.`,
        `You're sabotaging your own ${base}.`
      );
    }

    if (normalizedVibe === "soft") {
      hooks.push(
        `Here's a gentle reminder about ${base}.`,
        `You're closer than you think with ${base}.`,
        `It's okay to take your time with ${base}.`
      );
    }

    if (normalizedVibe === "funny") {
      hooks.push(
        `I tried ${base} so you don't have to (spoiler: chaos).`,
        `This is what happens when you let me near ${base}.`,
        `I swear ${base} is out to get me.`
      );
    }

    hooks.push(
      `What nobody tells you about ${base}.`,
      `This one thing will change your ${base} forever.`,
      `Here's the secret to mastering ${base}.`,
      `You're not going to believe this about ${base}.`,
      `This is the biggest mistake people make with ${base}.`
    );

    return [...new Set(hooks)];
  },
};

export default hookGenerator;
