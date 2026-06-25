const titleGenerator = {
  generate({ topic = "", niche = "", platform = "", vibe = "" }) {
    const base = topic || niche || "this";
    const titles = [];
    const normalizedPlatform = (platform || "").toLowerCase();
    const normalizedVibe = (vibe || "").toLowerCase();

    if (normalizedPlatform === "youtube") {
      titles.push(
        `The Truth About ${base}`,
        `I Tried ${base} So You Don't Have To`,
        `Why ${base} Isn't What You Think`,
        `I Did ${base} for 30 Days - Here's What Happened`,
        `The Biggest Mistake People Make With ${base}`,
        `How to Master ${base} (Fast)`,
        `${base}: What No One Tells You`,
        `I Finally Figured Out ${base}`,
        `The Dark Side of ${base}`,
        `If I Started Over, Here's How I'd Do ${base}`
      );
    }

    if (["tiktok", "shorts", "youtube-shorts", "yt-shorts"].includes(normalizedPlatform)) {
      titles.push(
        `Stop Doing ${base} Like This`,
        `Nobody Told You This About ${base}`,
        `You're Doing ${base} Wrong`,
        `This Will Change Your ${base} Forever`,
        `I Can't Believe This About ${base}`,
        `Watch This Before You Try ${base}`,
        `${base} in 10 Seconds`,
        `The Fastest Way to Improve Your ${base}`
      );
    }

    if (normalizedPlatform === "instagram") {
      titles.push(
        `This Changed Everything for My ${base}`,
        `A Reminder You Didn't Know You Needed About ${base}`,
        `If You're Struggling With ${base}, Watch This`,
        `The Moment I Finally Understood ${base}`,
        `This One Shift Improved My ${base}`
      );
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      titles.push(
        `${base} Is Broken - Here's Why`,
        `Unpopular Opinion: You're Doing ${base} Wrong`,
        `Everyone Overcomplicates ${base}`,
        `The Harsh Truth About ${base}`,
        `The Simplest Way to Fix ${base}`
      );
    }

    if (normalizedPlatform === "linkedin") {
      titles.push(
        `Most People Misunderstand ${base}`,
        `The Biggest Mistake Professionals Make With ${base}`,
        `A Better Way to Approach ${base}`,
        `What I Learned After Years of Doing ${base}`,
        `The Strategy That Transformed My ${base}`
      );
    }

    if (normalizedVibe === "aggressive") {
      titles.push(
        `You're Wasting Time Doing ${base} Like This`,
        `Stop Doing ${base} the Hard Way`,
        `You're Sabotaging Your Own ${base}`
      );
    }

    if (normalizedVibe === "soft") {
      titles.push(
        `A Gentle Guide to ${base}`,
        `You're Closer Than You Think With ${base}`,
        `It's Okay to Take Your Time With ${base}`
      );
    }

    if (normalizedVibe === "funny") {
      titles.push(
        `I Tried ${base} and Immediately Regretted It`,
        `${base} Almost Ruined My Day`,
        `Why Does ${base} Hate Me`
      );
    }

    titles.push(
      `What Nobody Tells You About ${base}`,
      `The Secret to Better ${base}`,
      `Everything You Know About ${base} Is Wrong`,
      `The Ultimate Guide to ${base}`,
      `This One Thing Will Change Your ${base}`
    );

    return [...new Set(titles)];
  },
};

export default titleGenerator;
