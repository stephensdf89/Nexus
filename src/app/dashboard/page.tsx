import ConnectPlatforms from "./components/ConnectPlatforms";
import Link from "next/link";
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
import UniverseMap from "./components/UniverseMap";
import ContentGenomeEditor from "./components/ContentGenomeEditor";
import RecalculateGrowthButton from "./components/RecalculateGrowthButton";

export default function DashboardPage() {
  // however you select a cardId in your UI
  const selectedCardId = null; // replace with real state

  return (
    <main className="min-h-screen bg-transparent px-6 py-8 text-white">
      <section className="mx-auto w-full max-w-6xl rounded-2xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-8 shadow-[0_20px_60px_rgba(0,194,255,0.22)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Creator OS</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
            <Link href="/pipelines" className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 transition hover:bg-cyan-400/20">Pipelines</Link>
            <Link href="/settings" className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 transition hover:bg-cyan-400/20">Settings</Link>
            <Link href="/analytics" className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 transition hover:bg-cyan-400/20">Analytics</Link>
            <Link href="/notifications" className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 transition hover:bg-cyan-400/20">Notifications</Link>
          </div>
        </div>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-cyan-100/85">
          Generate, schedule, optimize, and distribute content from one control center.
        </p>
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-6xl gap-5 lg:grid-cols-2">
        <WidgetCard><AutoGenerateCard /></WidgetCard>
        <WidgetCard><BatchGenerateCards /></WidgetCard>
        <WidgetCard><Generate30DayCalendar /></WidgetCard>
        <WidgetCard><AutoSchedule30Day /></WidgetCard>
        <WidgetCard><AutoScheduleBestTimes /></WidgetCard>
        <WidgetCard><AutoRepostUnderperforming /></WidgetCard>
        <WidgetCard><AutoDoubleDownWinners /></WidgetCard>
        <WidgetCard><AutoSeriesBuilder /></WidgetCard>
        <WidgetCard><AutoClusterThemes /></WidgetCard>
        <WidgetCard><RecalculateGrowthButton /></WidgetCard>
      </section>

      <section className="mx-auto mt-8 w-full max-w-6xl space-y-5">
        <WidgetCard><UniverseMap /></WidgetCard>
        <WidgetCard><ContentUniverseMap /></WidgetCard>
        {selectedCardId && (
          <WidgetCard><ContentGenomeEditor cardId={selectedCardId} /></WidgetCard>
        )}
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-6xl gap-5 lg:grid-cols-2">
        <WidgetCard><ConnectPlatforms /></WidgetCard>
        <WidgetCard><PlatformStatus /></WidgetCard>
        <WidgetCard><PostForm /></WidgetCard>
        <WidgetCard><CardPoster /></WidgetCard>
        <WidgetCard><ScheduledPosts /></WidgetCard>
      </section>
    </main>
  );
}

function WidgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-[rgba(4,14,38,0.8)] p-5 shadow-[0_20px_60px_rgba(0,194,255,0.12)] backdrop-blur-sm">
      {children}
    </div>
  );
}
