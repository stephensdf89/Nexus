export default function UpgradeRequired() {
  return (
    <div className="rounded-xl border border-violet-400/35 bg-violet-500/10 p-6">
      <h2 className="text-xl font-semibold text-violet-200">Upgrade required</h2>
      <p className="mt-2 text-sm text-violet-100/80">
        Integration steps are available on Pro plans.
      </p>
    </div>
  );
}
