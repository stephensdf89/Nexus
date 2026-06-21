export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-6">Content Creator Nexus</h1>
      <p className="text-gray-400 text-xl max-w-2xl text-center">
        The all‑in‑one platform for creators to plan, build, analyze, and grow their content empire.
      </p>

      <div className="mt-10 flex gap-6">
        <a
          href="/dashboard"
          className="px-6 py-3 bg-red-600 rounded-md text-lg font-semibold hover:bg-red-700 transition"
        >
          Enter Dashboard
        </a>

        <a
          href="#features"
          className="px-6 py-3 border border-gray-600 rounded-md text-lg font-semibold hover:bg-gray-800 transition"
        >
          Explore Features
        </a>
      </div>
    </div>
  );
}
