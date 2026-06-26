export { getBestTimeForPlatform } from "@/src/lib/getBestTimeForPlatform";

export async function updateBestTimeModel(prisma, userId, platform) {
	// Fetch last 60 posts
	const posts = await prisma.postPerformance.findMany({
		where: { userId, platform },
		orderBy: { postedAt: "desc" },
		take: 60
	});

	if (posts.length === 0) return;

	// Score each hour based on performance
	const hourScores = {};

	for (const post of posts) {
		const hour = new Date(post.postedAt).getHours();
		const score =
			(post.likes || 0) * 1 +
			(post.comments || 0) * 2 +
			(post.shares || 0) * 3 +
			(post.views || 0) * 0.01 +
			(post.watchTime || 0) * 0.05;

		hourScores[hour] = (hourScores[hour] || 0) + score;
	}

	// Normalize scores
	const maxScore = Math.max(...Object.values(hourScores));

	for (const hour in hourScores) {
		const normalized = hourScores[hour] / maxScore;

		await prisma.bestTimeModel.upsert({
			where: {
				userId_platform_hour: {
					userId,
					platform,
					hour: parseInt(hour)
				}
			},
			update: { score: normalized, updatedAt: new Date() },
			create: {
				userId,
				platform,
				hour: parseInt(hour),
				score: normalized
			}
		});
	}
}
