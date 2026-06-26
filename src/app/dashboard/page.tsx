import ConnectPlatforms from "./components/ConnectPlatforms";
import PlatformStatus from "./components/PlatformStatus";
import PostForm from "./components/PostForm";
import ScheduledPosts from "./components/ScheduledPosts";
import CardPoster from "./components/CardPoster";
import AutoGenerateCard from "./components/AutoGenerateCard";
import BatchGenerateCards from "./components/BatchGenerateCards";
import Generate30DayCalendar from "./components/Generate30DayCalendar";
import AutoSchedule30Day from "./components/AutoSchedule30Day";
import AutoScheduleBestTimes from "./components/AutoScheduleBestTimes";
import AutoRepostUnderperforming from "./components/AutoRepostUnderperforming";
import AutoDoubleDownWinners from "./components/AutoDoubleDownWinners";
import AutoSeriesBuilder from "./components/AutoSeriesBuilder";
import AutoClusterThemes from "./components/AutoClusterThemes";
import ContentUniverseMap from "./components/ContentUniverseMap";

export default function DashboardPage() {
  return (
    <div>
      <h1>Creator OS Dashboard</h1>

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
    </div>
  );
}
