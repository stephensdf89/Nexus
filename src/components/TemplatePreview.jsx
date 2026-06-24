function TemplatePreview({ template, onApply, onClose }) {
  if (!template) return null;

  const steps = Array.isArray(template.steps) ? template.steps : [];
  const canApply = steps.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-black border border-red-600 rounded-xl p-6 w-[400px] shadow-[0_0_20px_rgba(255,0,0,0.5)]">
        <h2 className="text-red-400 text-xl font-bold mb-2">
          {template.icon} {template.name}
        </h2>

        <p className="text-gray-400 text-sm mb-4">{template.description}</p>

        <div className="space-y-2 mb-4">
          {steps.length > 0 ? (
            steps.map((s, i) => (
              <div
                key={i}
                className="bg-black/60 border border-red-600 rounded-lg p-2 text-xs text-gray-300"
              >
                Step {i + 1}: {s.type}
              </div>
            ))
          ) : (
            <div className="bg-black/60 border border-red-600 rounded-lg p-2 text-xs text-gray-400">
              This template has no steps yet.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-400 text-sm">
            Cancel
          </button>

          <button
            onClick={onApply}
            disabled={!canApply}
            className="bg-red-700 hover:bg-red-800 disabled:bg-red-900 disabled:text-gray-500 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-bold"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatePreview;
