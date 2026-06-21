import AuthGuard from "@/components/AuthGuard";

export default function PipelinesPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-3xl font-bold">Pipelines</h1>
        <p className="mt-4 text-gray-400">
          Manage your creator workflows and automations.
        </p>
      </div>
    </AuthGuard>
  );
}
