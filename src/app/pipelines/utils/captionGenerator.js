import hookGenerator from "./hookGenerator";

const captionGenerator = {
  generate({ topic = "", niche = "", platform = "", vibe = "" }) {
    const base = topic || niche || "this";
    const normalizedPlatform = (platform || "").toLowerCase();

    const hooks = hookGenerator.generate({
      topic,
      niche,
      platform: normalizedPlatform,
      vibe,
    });
    const hook = hooks[0] || `Let's talk about ${base}.`;

    if (normalizedPlatform === "tiktok") {
      return `
${hook}

Here's what nobody tells you about ${base}.
Try this and watch what happens.

#${base.replace(/\s+/g, "")} #fyp #learnontiktok #creator
      `.trim();
    }

    if (normalizedPlatform === "instagram") {
      return `
${hook}

This changed everything for my ${base}.
If you're working on this too, you're not alone.

#${base.replace(/\s+/g, "")} #reels #motivation #inspiration #creator
      `.trim();
    }

    if (normalizedPlatform === "youtube") {
      return `
${hook}

In this video, we break down:
- What ${base} really means
- Why it matters
- How to apply it
- What most people get wrong

If you're trying to improve your ${base}, this is for you.
      `.trim();
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      return `
${hook}

Most people overcomplicate ${base}.
Here's the simple version.

#${base.replace(/\s+/g, "")}
      `.trim();
    }

    if (normalizedPlatform === "linkedin") {
      return `
${hook}

Here's what I've learned about ${base}:
- What actually matters
- What most people overlook
- How to approach it strategically

If you're working on this too, let's connect.
      `.trim();
    }

    if (normalizedPlatform === "pinterest") {
      return `
A simple idea that will transform your ${base}.

Save this for later.
      `.trim();
    }

    if (normalizedPlatform === "facebook") {
      return `
${hook}

I've been working on ${base} lately and wanted to share this.
What's your experience with it?
      `.trim();
    }

    return `
${hook}

Here's what you need to know about ${base}.
    `.trim();
  },
};

export default captionGenerator;
