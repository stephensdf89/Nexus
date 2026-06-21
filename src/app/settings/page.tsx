import AuthGuard from "@/components/AuthGuard";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-4 text-gray-400">
          Customize your dashboard preferences and account options.
        </p>
      </div>
    </AuthGuard>
  );
}
