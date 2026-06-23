"use client";

export default function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/95 border border-cyan-400/60 p-6 rounded w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
        <p className="text-cyan-100/85 mb-6">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-slate-800 border border-cyan-400/40 hover:border-cyan-300 hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded font-bold bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 hover:from-cyan-400 hover:to-violet-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
