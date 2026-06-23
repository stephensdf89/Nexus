"use client";

export default function CreatorToolsPanel() {
  return (
    <div className="bg-black text-white p-6 rounded-xl border border-cyan-400/30 shadow-[0_0_18px_rgba(0,229,255,0.15)]">
      <h1 className="text-3xl font-bold mb-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,229,255,0.45)]">
        Creator Tools
      </h1>

      <p className="text-gray-400 mb-10">
        Your creative command center - plan content, manage tasks, capture ideas, and use templates.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <ToolCard title="Content Planner" span="xl:col-span-2">
          <PlannerCalendar />
        </ToolCard>

        <ToolCard title="Task Manager">
          <TaskManager />
        </ToolCard>

        <ToolCard title="Idea Inbox">
          <IdeaInbox />
        </ToolCard>

        <ToolCard title="Template Library" span="xl:col-span-2">
          <TemplateLibrary />
        </ToolCard>
      </div>
    </div>
  );
}

function ToolCard({ title, span = "", children }) {
  return (
    <div className={`bg-gray-900/80 border border-red-600 rounded-xl p-6 
                     shadow-[0_0_20px_rgba(255,0,0,0.3)] ${span}`}>
      <h2 className="text-xl font-bold mb-4 text-red-400 
                     drop-shadow-[0_0_6px_rgba(255,0,0,0.6)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function PlannerCalendar() {
  return (
    <div className="bg-black/80 border border-red-600 rounded-lg p-6 
                    shadow-[0_0_12px_rgba(255,0,0,0.4)]">
      <p className="text-gray-400 text-sm mb-4">
        Calendar view coming soon - schedule posts, deadlines, and content cycles.
      </p>

      <div className="grid grid-cols-7 gap-2 text-center text-gray-300 text-xs">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-gray-900/60 border border-red-600 rounded-lg 
                       hover:shadow-[0_0_10px_rgba(255,0,0,0.6)] transition-all duration-200"
          >
            Day {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskManager() {
  const tasks = [
    { text: "Record TikTok video", done: false },
    { text: "Edit YouTube thumbnail", done: true },
    { text: "Plan Instagram carousel", done: false },
  ];

  return (
    <div className="space-y-3">
      {tasks.map((t, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-black/80 border border-red-600 
                     rounded-lg p-3 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          <span className={`${t.done ? "line-through text-gray-500" : "text-gray-200"}`}>
            {t.text}
          </span>

          <button className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg 
                             hover:shadow-[0_0_10px_rgba(255,0,0,0.6)] transition-all duration-200">
            {t.done ? "Undo" : "Done"}
          </button>
        </div>
      ))}
    </div>
  );
}

function IdeaInbox() {
  const ideas = [
    "Video about creator burnout",
    "New TikTok trend remix",
    "Instagram carousel on storytelling",
    "YouTube tutorial on editing workflow",
  ];

  return (
    <div className="space-y-3">
      {ideas.map((idea, i) => (
        <div
          key={i}
          className="bg-black/80 border border-red-600 rounded-lg p-3 
                     shadow-[0_0_10px_rgba(255,0,0,0.4)] text-gray-300 text-sm"
        >
          {idea}
        </div>
      ))}

      <button className="mt-4 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold 
                         shadow-[0_0_12px_rgba(255,0,0,0.7)] transition-all duration-200">
        Add Idea
      </button>
    </div>
  );
}

function TemplateLibrary() {
  const templates = [
    "Reel Hook Pack",
    "YouTube Script Skeleton",
    "Product Launch Sequence",
    "Weekly Content Planner",
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {templates.map((template) => (
        <button
          key={template}
          className="text-left rounded-lg border border-cyan-400/20 bg-slate-900/50 p-3 text-sm text-gray-200 hover:shadow-[0_0_10px_rgba(0,229,255,0.25)] transition-all duration-200"
        >
          {template}
        </button>
      ))}
    </div>
  );
}
