import ConnectPlatforms from "./components/ConnectPlatforms";
import PlatformStatus from "./components/PlatformStatus";
import PostForm from "./components/PostForm";
import ScheduledPosts from "./components/ScheduledPosts";

export default function DashboardPage() {
  return (
    <div>
      <h1>Creator OS Dashboard</h1>
      <ConnectPlatforms />
      <PlatformStatus />
      <PostForm />
      <ScheduledPosts />
    </div>
  );
}
