import contentIdeaGenerator from "./contentIdeaGenerator";

const contentCalendarGenerator = {
  /**
   * @param {{ topic?: string; niche?: string; platforms?: string[]; frequency?: number; vibe?: string }} input
   */
  generate(input = {}) {
    const {
      topic = "",
      niche = "",
      platforms = [],
      frequency = 1,
      vibe = "",
    } = input;

    const ideaPool = contentIdeaGenerator.generate({
      topic,
      niche,
      platform: platforms[0] || "",
      vibe,
    });

    const shuffled = [...ideaPool].sort(() => Math.random() - 0.5);

    const calendar = [];
    let ideaIndex = 0;

    for (let day = 1; day <= 30; day++) {
      const dayIdeas = [];

      for (let i = 0; i < frequency; i++) {
        const idea = shuffled[ideaIndex % shuffled.length];
        ideaIndex++;

        const platformIdeas = platforms.map((p) => {
          if (p === "youtube") {
            return `YouTube: ${idea}`;
          }
          if (p === "tiktok" || p === "shorts") {
            return `Short-form: ${idea}`;
          }
          if (p === "instagram") {
            return `IG Reel: ${idea}`;
          }
          if (p === "x") {
            return `X Post: ${idea}`;
          }
          if (p === "linkedin") {
            return `LinkedIn: ${idea}`;
          }
          return `${p}: ${idea}`;
        });

        dayIdeas.push(...platformIdeas);
      }

      calendar.push({
        day,
        ideas: dayIdeas,
      });
    }

    return calendar;
  },
};

export default contentCalendarGenerator;
