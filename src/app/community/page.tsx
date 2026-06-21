import AuthGuard from "@/components/AuthGuard";

export default function CommunityPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="mt-4 text-gray-400">
          Engage with your audience and manage conversations.
        </p>
      </div>
    </AuthGuard>
  );
}
