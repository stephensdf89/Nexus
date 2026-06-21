import AuthGuard from "@/components/AuthGuard";

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-3xl font-bold">Content Creator Nexus Dashboard</h1>
      </div>
    </AuthGuard>
  );
}
