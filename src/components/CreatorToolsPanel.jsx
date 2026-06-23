"use client";

export default function CreatorToolsPanel() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <QuickAccessCard title="Content Planner" icon="📅" />
        <QuickAccessCard title="Task Manager" icon="✓" />
        <QuickAccessCard title="Idea Inbox" icon="💡" />
        <QuickAccessCard title="Templates" icon="📋" />
      </div>

      <button className="w-full bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg font-semibold 
                         text-white shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all duration-200">
        View All Tools
      </button>
    </div>
  );
}

function QuickAccessCard({ title, icon }) {
  return (
    <div className="bg-slate-900/80 border border-cyan-400/40 rounded-lg p-3 
                    shadow-[0_0_12px_rgba(0,229,255,0.15)] hover:shadow-[0_0_18px_rgba(0,229,255,0.25)] 
                    transition-all duration-200 cursor-pointer text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <h3 className="text-xs font-bold text-cyan-400">{title}</h3>
    </div>
  );
}
