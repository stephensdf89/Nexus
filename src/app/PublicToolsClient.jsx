"use client";

import AutoGenerateCard from "./dashboard/components/AutoGenerateCard";
import BatchGenerateCards from "./dashboard/components/BatchGenerateCards";
import Generate30DayCalendar from "./dashboard/components/Generate30DayCalendar";
import AutoSchedule30Day from "./dashboard/components/AutoSchedule30Day";
import AutoScheduleBestTimes from "./dashboard/components/AutoScheduleBestTimes";
import AutoRepostUnderperforming from "./dashboard/components/AutoRepostUnderperforming";
import AutoDoubleDownWinners from "./dashboard/components/AutoDoubleDownWinners";
import AutoSeriesBuilder from "./dashboard/components/AutoSeriesBuilder";
import AutoClusterThemes from "./dashboard/components/AutoClusterThemes";
import ContentUniverseMap from "./dashboard/components/ContentUniverseMap";
import ConnectPlatforms from "./dashboard/components/ConnectPlatforms";
import PlatformStatus from "./dashboard/components/PlatformStatus";
import PostForm from "./dashboard/components/PostForm";
import CardPoster from "./dashboard/components/CardPoster";
import ScheduledPosts from "./dashboard/components/ScheduledPosts";

export default function PublicToolsClient() {
  return (
    <section className="mx-auto mt-10 w-full max-w-4xl space-y-8 rounded-2xl border border-cyan-400/25 bg-[rgba(4,14,38,0.8)] p-8 shadow-[0_20px_60px_rgba(0,194,255,0.12)] backdrop-blur-sm">
      <AutoGenerateCard />
      <BatchGenerateCards />
      <Generate30DayCalendar />
      <AutoSchedule30Day />
      <AutoScheduleBestTimes />
      <AutoRepostUnderperforming />
      <AutoDoubleDownWinners />
      <AutoSeriesBuilder />
      <AutoClusterThemes />
      <ContentUniverseMap />
      <ConnectPlatforms />
      <PlatformStatus />
      <PostForm />
      <CardPoster />
      <ScheduledPosts />
    </section>
  );
}
