import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableStepCard({ step }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-black/80 border border-red-600 rounded-xl p-4 mb-3 shadow-[0_0_12px_rgba(255,0,0,0.4)] cursor-grab transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,0,0.7)] active:scale-[0.98] active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-red-400 font-bold">⋮⋮</span>
          <span className="text-gray-200">{step.type}</span>
        </div>

        <span className="text-xs text-gray-500">
          Step ID: {step.id.slice(0, 6)}
        </span>
      </div>
    </div>
  );
}
