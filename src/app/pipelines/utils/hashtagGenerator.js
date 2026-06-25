const hashtagGenerator = {
  generate({ topic = "", niche = "", platform = "", vibe = "" }) {
    const base = (topic || niche || "content").replace(/[^\w\s]/g, "");
    const clean = base.replace(/\s+/g, "");
    const normalizedPlatform = (platform || "").toLowerCase();

    const broad = [
      `#${clean}`,
      `#${clean}tips`,
      `#${clean}tutorial`,
      `#${clean}guide`,
      `#${clean}101`,
      `#learn${clean}`,
      `#${clean}community`,
    ];

    const nicheSet = [
      `#${clean}creator`,
      `#${clean}strategy`,
      `#${clean}growth`,
      `#${clean}ideas`,
      `#${clean}hack`,
      `#${clean}mindset`,
    ];

    const micro = [
      `#${clean}daily`,
      `#${clean}journey`,
      `#${clean}challenge`,
      `#${clean}workflow`,
      `#${clean}tipsandtricks`,
    ];

    if (normalizedPlatform === "tiktok") {
      return [
        ...broad,
        ...nicheSet,
        ...micro,
        "#fyp",
        "#foryou",
        "#viral",
        "#creators",
      ].join(" ");
    }

    if (normalizedPlatform === "instagram") {
      return [
        ...broad,
        ...nicheSet,
        ...micro,
        "#reels",
        "#reelitfeelit",
        "#instagramreels",
        "#contentcreator",
        "#inspiration",
      ].join(" ");
    }

    if (normalizedPlatform === "youtube") {
      return [
        clean,
        `${clean} tips`,
        `${clean} tutorial`,
        `${clean} guide`,
        `${clean} strategy`,
        `${clean} explained`,
        `${clean} for beginners`,
      ].join(", ");
    }

    if (["x", "twitter"].includes(normalizedPlatform)) {
      return [`#${clean}`, `#${clean}tips`, "#creators"].join(" ");
    }

    if (normalizedPlatform === "linkedin") {
      return [
        `#${clean}`,
        `#${clean}strategy`,
        "#leadership",
        "#growth",
        "#professionaldevelopment",
      ].join(" ");
    }

    if (normalizedPlatform === "pinterest") {
      return [
        `#${clean}`,
        `#${clean}ideas`,
        `#${clean}inspiration`,
        "#diy",
        "#howto",
      ].join(" ");
    }

    if (normalizedPlatform === "facebook") {
      return [`#${clean}`, "#community", "#creators"].join(" ");
    }

    return [...broad, ...nicheSet, ...micro].join(" ");
  },
};

export default hashtagGenerator;
