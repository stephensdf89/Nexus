import AuthGuard from "@/components/AuthGuard";

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-4 text-gray-400">
          Track performance across your content channels.
        </p>
      </div>
    </AuthGuard>
  );
}
