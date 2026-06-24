import analyticsEngine from "./analyticsEngine";
import consistencyEngine from "./consistencyEngine";

const performanceInsights = {
  generate(cards) {
    const insights = [];

    if (cards.length === 0) return ["No data available yet."];

    // -----------------------------------------
    // 1. VIDEO LENGTH INSIGHTS (TikTok + Shorts)
    // -----------------------------------------
    const shortForm = cards.filter((c) =>
      c.platforms.includes("tiktok") || c.platforms.includes("shorts")
    );

    if (shortForm.length > 5) {
      const shortVideos = shortForm.filter((c) => c.duration && c.duration < 12);
      const longVideos = shortForm.filter((c) => c.duration && c.duration >= 12);

      const shortAvg =
        shortVideos.reduce((a, c) => a + analyticsEngine.getCardTotals(c).totalViews, 0) /
        (shortVideos.length || 1);

      const longAvg =
        longVideos.reduce((a, c) => a + analyticsEngine.getCardTotals(c).totalViews, 0) /
        (longVideos.length || 1);

      if (shortAvg > longAvg * 1.2) {
        insights.push(
          `Your short-form videos under 12 seconds perform ${Math.round(
            ((shortAvg - longAvg) / longAvg) * 100
          )}% better.`
        );
      }
    }

    // -----------------------------------------
    // 2. THUMBNAIL INSIGHTS (YouTube)
    // -----------------------------------------
    const youtubeCards = cards.filter((c) => c.platforms.includes("youtube"));

    if (youtubeCards.length > 5) {
      const withFace = youtubeCards.filter((c) => c.thumbnail_has_face);
      const withoutFace = youtubeCards.filter((c) => !c.thumbnail_has_face);

      const faceCTR =
        withFace.reduce((a, c) => a + (c.analytics?.youtube?.ctr || 0), 0) /
        (withFace.length || 1);

      const noFaceCTR =
        withoutFace.reduce((a, c) => a + (c.analytics?.youtube?.ctr || 0), 0) /
        (withoutFace.length || 1);

      if (faceCTR > noFaceCTR * 1.1) {
        insights.push(
          `YouTube thumbnails with faces get ${Math.round(
            ((faceCTR - noFaceCTR) / noFaceCTR) * 100
          )}% higher CTR.`
        );
      }
    }

    // -----------------------------------------
    // 3. HASHTAG INSIGHTS (Instagram)
    // -----------------------------------------
    const igCards = cards.filter((c) => c.platforms.includes("instagram"));

    if (igCards.length > 5) {
      const heavyTags = igCards.filter(
        (c) => (c.platform_fields?.instagram?.instagram_hashtags || "").split(" ").length >= 15
      );

      const lightTags = igCards.filter(
        (c) => (c.platform_fields?.instagram?.instagram_hashtags || "").split(" ").length < 15
      );

      const heavyAvg =
        heavyTags.reduce((a, c) => a + analyticsEngine.getCardTotals(c).totalViews, 0) /
        (heavyTags.length || 1);

      const lightAvg =
        lightTags.reduce((a, c) => a + analyticsEngine.getCardTotals(c).totalViews, 0) /
        (lightTags.length || 1);

      if (heavyAvg > lightAvg * 1.2) {
        insights.push(
          `Instagram posts with 15+ hashtags get ${Math.round(
            ((heavyAvg - lightAvg) / lightAvg) * 100
          )}% more reach.`
        );
      }
    }

    // -----------------------------------------
    // 4. BEST POSTING DAY
    // -----------------------------------------
    const dayCounts = {};
    for (const card of cards) {
      const day = new Date(card.created_at).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + analyticsEngine.getCardTotals(card).totalViews;
    }

    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (bestDay) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      insights.push(`Your best posting day is ${dayNames[bestDay[0]]}.`);
    }

    // -----------------------------------------
    // 5. PLATFORM PERFORMANCE
    // -----------------------------------------
    const platformTotals = {};
    for (const card of cards) {
      for (const platform of card.platforms) {
        platformTotals[platform] =
          (platformTotals[platform] || 0) +
          analyticsEngine.getCardTotals(card).totalViews;
      }
    }

    const sortedPlatforms = Object.entries(platformTotals).sort((a, b) => b[1] - a[1]);

    if (sortedPlatforms.length > 1) {
      insights.push(
        `${sortedPlatforms[0][0].toUpperCase()} is your strongest platform, outperforming ${
          sortedPlatforms[1][0]
        } by ${Math.round(
          ((sortedPlatforms[0][1] - sortedPlatforms[1][1]) / sortedPlatforms[1][1]) * 100
        )}%.`
      );
    }

    // -----------------------------------------
    // 6. CONSISTENCY INSIGHTS
    // -----------------------------------------
    const consistency = consistencyEngine.getPostingFrequency(cards);

    if (consistency.currentStreak >= 3) {
      insights.push(`You're on a ${consistency.currentStreak}-day posting streak — keep it going.`);
    }

    if (consistency.avgDaysBetween && consistency.avgDaysBetween > 7) {
      insights.push(`Your average gap between posts is ${Math.round(
        consistency.avgDaysBetween
      )} days — try tightening your schedule.`);
    }

    return insights.length > 0 ? insights : ["No significant insights yet — keep posting."];
  }
};

export default performanceInsights;
