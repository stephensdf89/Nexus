const contentAngleGenerator = {
  generate({ topic = "", niche = "", platform = "", vibe = "" }) {
    const base = topic || niche || "this";
    const angles = [];
    const normalizedVibe = (vibe || "").toLowerCase();

    angles.push(
      `Everyone is wrong about ${base}.`,
      `Stop doing ${base} the way everyone else does.`,
      `The worst advice people give about ${base}.`,
      `Why the "normal" approach to ${base} never works.`,
      `The truth about ${base} nobody wants to admit.`
    );

    angles.push(
      `The part of ${base} that almost broke me.`,
      `Nobody talks about how hard ${base} really is.`,
      `What ${base} taught me about myself.`,
      `The moment I almost gave up on ${base}.`,
      `Why ${base} hit me harder than I expected.`
    );

    angles.push(
      `The part of ${base} nobody explains.`,
      `The mistake everyone makes with ${base}.`,
      `What I discovered after doing ${base} for years.`,
      `The hidden reason ${base} feels so difficult.`,
      `The thing about ${base} that shocked me.`
    );

    angles.push(
      `How I learned ${base} the hard way.`,
      `The moment everything changed for my ${base}.`,
      `My biggest failure with ${base} - and what it taught me.`,
      `The turning point in my ${base} journey.`,
      `What finally clicked for me about ${base}.`
    );

    angles.push(
      `3 things I wish I knew before starting ${base}.`,
      `The simple framework that fixes ${base}.`,
      `If you're struggling with ${base}, try this.`,
      `The fastest way to get better at ${base}.`,
      `The beginner mistake that ruins ${base}.`
    );

    angles.push(
      `What changed when I finally committed to ${base}.`,
      `Before vs. after I understood ${base}.`,
      `How ${base} transformed my life.`,
      `The surprising results I got from focusing on ${base}.`,
      `What happened when I stopped avoiding ${base}.`
    );

    angles.push(
      `After years of doing ${base}, here's the truth.`,
      `What experts won't tell you about ${base}.`,
      `The advanced version of ${base} nobody teaches.`,
      `If I had to start over, here's how I'd approach ${base}.`,
      `The real reason people fail at ${base}.`
    );

    if (normalizedVibe === "aggressive") {
      angles.push(
        `You're doing ${base} wrong - here's the fix.`,
        `Stop wasting time on the wrong ${base} strategy.`,
        `You're sabotaging your own ${base}.`
      );
    }

    if (normalizedVibe === "soft") {
      angles.push(
        `A gentle reminder about ${base}.`,
        `It's okay to take your time with ${base}.`,
        `You're doing better at ${base} than you think.`
      );
    }

    if (normalizedVibe === "funny") {
      angles.push(
        `I tried ${base} and immediately regretted it.`,
        `${base} almost took me out.`,
        `Why does ${base} hate me specifically.`
      );
    }

    return [...new Set(angles)];
  },
};

export default contentAngleGenerator;
