const consistencyEngine = {
  // -----------------------------------------
  // 1. POSTING FREQUENCY
  // -----------------------------------------
  getPostingFrequency(cards) {
    const now = Date.now();

    const posts = cards
      .filter((c) => c.stage_name === "Posted" || c.stage_name === "Analytics")
      .map((c) => new Date(c.created_at).getTime())
      .sort((a, b) => a - b);

    if (posts.length === 0) {
      return {
        weekly: 0,
        monthly: 0,
        avgDaysBetween: null,
        longestStreak: 0,
        currentStreak: 0
      };
    }

    // Weekly + monthly
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const weekly = posts.filter((p) => p >= weekAgo).length;
    const monthly = posts.filter((p) => p >= monthAgo).length;

    // Days between posts
    const gaps = [];
    for (let i = 1; i < posts.length; i++) {
      const diff = posts[i] - posts[i - 1];
      gaps.push(diff / (1000 * 60 * 60 * 24));
    }

    const avgDaysBetween =
      gaps.length > 0
        ? gaps.reduce((a, b) => a + b, 0) / gaps.length
        : null;

    // Streaks
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < posts.length; i++) {
      const diffDays =
        (posts[i] - posts[i - 1]) / (1000 * 60 * 60 * 24);

      if (diffDays <= 2) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // If last post was recent, streak continues
    const lastPostDaysAgo =
      (now - posts[posts.length - 1]) / (1000 * 60 * 60 * 24);

    if (lastPostDaysAgo > 2) currentStreak = 0;

    return {
      weekly,
      monthly,
      avgDaysBetween,
      longestStreak,
      currentStreak
    };
  },

  // -----------------------------------------
  // 2. WORKFLOW CONSISTENCY
  // -----------------------------------------
  getWorkflowConsistency(cards) {
    const stageCounts = {};
    const stageTimes = {};

    for (const card of cards) {
      const stage = card.stage_name || "Unknown";

      stageCounts[stage] = (stageCounts[stage] || 0) + 1;

      const created = new Date(card.created_at).getTime();
      const updated = new Date(card.updated_at).getTime();
      const timeInStage = updated - created;

      stageTimes[stage] = (stageTimes[stage] || 0) + timeInStage;
    }

    const avgTimeInStage = {};
    for (const stage in stageTimes) {
      avgTimeInStage[stage] =
        stageTimes[stage] / stageCounts[stage];
    }

    return {
      stageCounts,
      avgTimeInStage
    };
  },

  // -----------------------------------------
  // 3. PLATFORM CONSISTENCY
  // -----------------------------------------
  getPlatformConsistency(cards) {
    const platformCounts = {};

    for (const card of cards) {
      for (const platform of card.platforms || []) {
        platformCounts[platform] =
          (platformCounts[platform] || 0) + 1;
      }
    }

    const total = Object.values(platformCounts).reduce(
      (a, b) => a + b,
      0
    );

    const distribution = {};
    for (const platform in platformCounts) {
      distribution[platform] = platformCounts[platform] / total;
    }

    return {
      platformCounts,
      distribution
    };
  },

  // -----------------------------------------
  // 4. CONSISTENCY SCORE (0–100)
  // -----------------------------------------
  getConsistencyScore(cards) {
    const freq = consistencyEngine.getPostingFrequency(cards);
    const platform = consistencyEngine.getPlatformConsistency(cards);

    // Score components
    const weeklyScore = Math.min(freq.weekly * 20, 40); // up to 40 pts
    const streakScore = Math.min(freq.longestStreak * 5, 25); // up to 25 pts
    const platformScore =
      Object.keys(platform.platformCounts).length * 5; // up to 25 pts
    const recencyScore = freq.currentStreak > 0 ? 10 : 0; // 10 pts

    return Math.min(
      100,
      weeklyScore + streakScore + platformScore + recencyScore
    );
  }
};

export default consistencyEngine;
