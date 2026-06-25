import hookGenerator from "./hookGenerator";

const scriptRewriter = {
  rewrite({ script = "", topic = "", platform = "", niche = "", vibe = "" }) {
    if (!script || script.trim().length === 0) {
      return "No script provided - add a script to generate a rewritten version.";
    }

    const normalizedPlatform = (platform || "").toLowerCase();
    const hooks = hookGenerator.generate({ topic, niche, platform: normalizedPlatform, vibe });
    const hook = hooks[0] || `Let's talk about ${topic || niche}.`;

    const cleaned = script
      .replace(/\s+/g, " ")
      .trim();

    if (["tiktok", "shorts", "youtube-shorts", "yt-shorts"].includes(normalizedPlatform)) {
      return `
${hook}

${cleaned
  .split(/[.!?]/)
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => `- ${s}`)
  .join("\n")}

Quick recap:
${topic ? `- ${topic}` : ""}

Follow for more.
      `.trim();
    }

    if (normalizedPlatform === "youtube") {
      return `
${hook}

Here's what we're covering:
1. ${topic || "The main idea"}
2. Why it matters
3. How to apply it
4. What most people get wrong
5. The real takeaway

${cleaned}

Before we wrap up, here's the key point:
${topic ? `-> ${topic}` : ""}

If this helped, stick around - we're just getting started.
      `.trim();
    }

    if (normalizedPlatform === "instagram") {
      return `
${hook}

${cleaned}

If you're working on ${topic || niche}, you're not alone.
You've got this.
      `.trim();
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      return `
${hook}

${cleaned
  .split(/[.!?]/)
  .map((s) => s.trim())
  .filter(Boolean)
  .slice(0, 3)
  .join(". ")}

${topic ? `#${topic.replace(/\s+/g, "")}` : ""}
      `.trim();
    }

    if (normalizedPlatform === "linkedin") {
      return `
${hook}

${cleaned}

Key takeaway:
${topic ? `- ${topic}` : ""}

Let's keep leveling up.
      `.trim();
    }

    return `
${hook}

${cleaned}

Let's take this to the next level.
    `.trim();
  },
};

export default scriptRewriter;
