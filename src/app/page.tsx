import Link from "next/link";
import { cookies } from "next/headers";
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

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(
    cookieStore.get("sb-access-token")?.value ||
    cookieStore.get("sb-refresh-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value ||
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value ||
    cookieStore.get("authjs.session-token")?.value
  );

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-white">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-10 shadow-[0_20px_60px_rgba(0,194,255,0.22)] backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Content Creator Nexus</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Creator productivity platform for planning, publishing, and growth.
        </h1>
        <p className="mt-5 max-w-2xl text-cyan-100/80">
          Build your content pipeline, monitor analytics, and stay connected with your audience from one dark-mode workspace.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 font-semibold text-[#05163b] transition hover:from-cyan-400 hover:to-violet-500">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-lg border border-cyan-400/45 bg-cyan-500/10 px-5 py-3 font-semibold transition hover:bg-cyan-500/20 hover:border-cyan-300">
            Create Account
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-cyan-100/75">
          <Link href="/about" className="hover:text-cyan-200">About</Link>
          <Link href="/support" className="hover:text-cyan-200">Support</Link>
          <Link href="/terms" className="hover:text-cyan-200">Terms</Link>
          <Link href="/privacy" className="hover:text-cyan-200">Privacy</Link>
        </div>
      </section>

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
        {isLoggedIn ? <CardPoster /> : <div>Sign in to load personalized card posting tools.</div>}
        <ScheduledPosts />
      </section>
    </main>
  );
}