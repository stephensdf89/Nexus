const analyticsEngine = {
  // -----------------------------------------
  // 1. PER-PLATFORM ANALYTICS
  // -----------------------------------------
  getPlatformStats(card) {
    const stats = {};

    for (const platform of card.platforms) {
      const data = card.analytics?.[platform] || {};

      stats[platform] = {
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        watch_time: data.watch_time || 0,
        ctr: data.ctr || 0,
        engagement_rate: analyticsEngine.calculateEngagementRate(data)
      };
    }

    return stats;
  },

  calculateEngagementRate(data) {
    const views = data.views || 0;
    if (views === 0) return 0;

    const interactions =
      (data.likes || 0) +
      (data.comments || 0) +
      (data.shares || 0);

    return interactions / views;
  },

  // -----------------------------------------
  // 2. PER-CARD ANALYTICS
  // -----------------------------------------
  getCardTotals(card) {
    const platforms = analyticsEngine.getPlatformStats(card);

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    for (const p of Object.values(platforms)) {
      totalViews += p.views;
      totalLikes += p.likes;
      totalComments += p.comments;
      totalShares += p.shares;
    }

    const totalEngagement = totalLikes + totalComments + totalShares;

    return {
      totalViews,
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      bestPlatform: analyticsEngine.getBestPlatform(platforms),
      worstPlatform: analyticsEngine.getWorstPlatform(platforms),
      score: analyticsEngine.calculateCardScore({
        totalViews,
        totalEngagement
      })
    };
  },

  getBestPlatform(platforms) {
    let best = null;
    let bestViews = -1;

    for (const [platform, stats] of Object.entries(platforms)) {
      if (stats.views > bestViews) {
        bestViews = stats.views;
        best = platform;
      }
    }

    return best;
  },

  getWorstPlatform(platforms) {
    let worst = null;
    let worstViews = Infinity;

    for (const [platform, stats] of Object.entries(platforms)) {
      if (stats.views < worstViews) {
        worstViews = stats.views;
        worst = platform;
      }
    }

    return worst;
  },

  calculateCardScore({ totalViews, totalEngagement }) {
    if (totalViews === 0) return 0;

    const engagementRate = totalEngagement / totalViews;

    // Simple scoring model (0–100)
    return Math.min(
      100,
      Math.round(engagementRate * 100 + Math.log10(totalViews + 1) * 10)
    );
  },

  // -----------------------------------------
  // 3. PIPELINE-LEVEL ANALYTICS
  // -----------------------------------------
  getPipelineTotals(cards) {
    let totalViews = 0;
    let totalEngagement = 0;
    let totalPosts = cards.length;

    for (const card of cards) {
      const totals = analyticsEngine.getCardTotals(card);
      totalViews += totals.totalViews;
      totalEngagement += totals.totalEngagement;
    }

    return {
      totalViews,
      totalEngagement,
      totalPosts,
      avgEngagementRate:
        totalViews === 0 ? 0 : totalEngagement / totalViews
    };
  },

  // -----------------------------------------
  // 4. GROWTH OVER TIME
  // -----------------------------------------
  getGrowth(cards, days = 30) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    let views = 0;
    let engagement = 0;

    for (const card of cards) {
      const postedAt = new Date(card.created_at).getTime();
      if (postedAt >= cutoff) {
        const totals = analyticsEngine.getCardTotals(card);
        views += totals.totalViews;
        engagement += totals.totalEngagement;
      }
    }

    return {
      views,
      engagement
    };
  }
};

export default analyticsEngine;
