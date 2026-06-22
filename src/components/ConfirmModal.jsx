"use client";

export default function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-red-600 p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-700 rounded hover:bg-red-800 font-bold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
