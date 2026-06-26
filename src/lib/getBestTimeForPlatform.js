import prisma from "@/src/lib/db";

export async function getBestTimeForPlatform(userId, platform) {
  const learned = await prisma.bestTimeModel.findMany({
    where: { userId, platform },
    orderBy: { score: "desc" }
  });

  if (learned.length > 0) {
    // Return the highest scoring hour
    const bestHour = learned[0].hour;
    return `${String(bestHour).padStart(2, "0")}:00`;
  }

  // Fallback defaults
  const defaults = {
    instagram: "12:00",
    tiktok: "15:00",
    youtube: "14:00",
    facebook: "13:00",
    linkedin: "12:00",
    x: "21:00"
  };

  return defaults[platform] || "12:00";
}
