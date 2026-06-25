const contentIdeaGenerator = {
  generate({ topic = "", niche = "", platform = "", vibe = "" }) {
    const base = topic || niche || "this";
    const ideas = [];
    const normalizedPlatform = (platform || "").toLowerCase();
    const normalizedVibe = (vibe || "").toLowerCase();

    ideas.push(
      `3 things I wish I knew before starting ${base}.`,
      `Beginner mistakes everyone makes with ${base}.`,
      `The fastest way to get better at ${base}.`,
      `How to master ${base} in 10 minutes.`,
      `The simple framework that fixes ${base}.`,
      `If you're struggling with ${base}, try this.`,
      `The truth about learning ${base}.`,
      `Why ${base} feels harder than it should.`,
      `The biggest misconception about ${base}.`,
      `How to avoid burnout while doing ${base}.`
    );

    ideas.push(
      `How I learned ${base} the hard way.`,
      `The moment everything changed for my ${base}.`,
      `My biggest failure with ${base}.`,
      `What finally clicked for me about ${base}.`,
      `The turning point in my ${base} journey.`,
      `What ${base} taught me about myself.`,
      `The day I almost quit ${base}.`,
      `How ${base} changed my life.`,
      `The unexpected lesson I learned from ${base}.`,
      `What nobody prepared me for about ${base}.`
    );

    ideas.push(
      `Everyone is wrong about ${base}.`,
      `Stop doing ${base} like this.`,
      `The worst advice people give about ${base}.`,
      `Why the "normal" approach to ${base} never works.`,
      `The truth about ${base} nobody wants to admit.`,
      `The mistake everyone makes with ${base}.`,
      `Why ${base} is easier than you think.`,
      `Why ${base} is harder than people pretend.`,
      `The unpopular opinion about ${base}.`,
      `The myth that ruins ${base}.`
    );

    ideas.push(
      `The part of ${base} that almost broke me.`,
      `Nobody talks about how hard ${base} really is.`,
      `What ${base} taught me about resilience.`,
      `The emotional side of ${base} nobody explains.`,
      `Why ${base} made me rethink everything.`,
      `The fear that held me back from ${base}.`,
      `The moment I realized I needed to change my approach to ${base}.`,
      `Why ${base} hit me harder than I expected.`,
      `The hidden struggle behind ${base}.`,
      `What I wish people understood about ${base}.`
    );

    ideas.push(
      `Before vs. after I understood ${base}.`,
      `What changed when I finally committed to ${base}.`,
      `How ${base} transformed my workflow.`,
      `The surprising results I got from focusing on ${base}.`,
      `What happened when I stopped avoiding ${base}.`,
      `The one shift that improved my ${base}.`,
      `How I leveled up my ${base} in 30 days.`,
      `The habit that changed everything for my ${base}.`,
      `The system I built to improve my ${base}.`,
      `What I'd do differently if I started ${base} today.`
    );

    if (normalizedPlatform === "youtube") {
      ideas.push(
        `I tried ${base} for 30 days - here's what happened.`,
        `The truth about ${base} nobody shows you.`,
        `How to fix your ${base} in 5 minutes.`,
        `The beginner's guide to ${base}.`,
        `Advanced strategies for ${base}.`
      );
    }

    if (["tiktok", "shorts", "youtube-shorts", "yt-shorts"].includes(normalizedPlatform)) {
      ideas.push(
        `Stop scrolling - you need to hear this about ${base}.`,
        `Nobody told you this about ${base}.`,
        `If you're doing ${base} like this, you're doing it wrong.`,
        `This will change your ${base} forever.`,
        `The fastest hack for ${base}.`
      );
    }

    if (normalizedPlatform === "instagram") {
      ideas.push(
        `This changed everything for my ${base}.`,
        `A reminder you didn't know you needed about ${base}.`,
        `If you're struggling with ${base}, this is for you.`,
        `The moment I finally understood ${base}.`,
        `This one shift improved my ${base}.`
      );
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      ideas.push(
        `${base} is broken - here's why.`,
        `Unpopular opinion: you're doing ${base} wrong.`,
        `Everyone overcomplicates ${base}.`,
        `The harsh truth about ${base}.`,
        `The simplest way to fix ${base}.`
      );
    }

    if (normalizedPlatform === "linkedin") {
      ideas.push(
        `Most people misunderstand ${base}.`,
        `The biggest mistake professionals make with ${base}.`,
        `A better way to approach ${base}.`,
        `What I learned after years of doing ${base}.`,
        `The strategy that transformed my ${base}.`
      );
    }

    if (normalizedVibe === "aggressive") {
      ideas.push(
        `You're doing ${base} wrong - here's the fix.`,
        `Stop wasting time on the wrong ${base} strategy.`,
        `You're sabotaging your own ${base}.`
      );
    }

    if (normalizedVibe === "soft") {
      ideas.push(
        `A gentle reminder about ${base}.`,
        `It's okay to take your time with ${base}.`,
        `You're doing better at ${base} than you think.`
      );
    }

    if (normalizedVibe === "funny") {
      ideas.push(
        `I tried ${base} and immediately regretted it.`,
        `${base} almost took me out.`,
        `Why does ${base} hate me specifically.`
      );
    }

    return [...new Set(ideas)];
  },
};

export default contentIdeaGenerator;
