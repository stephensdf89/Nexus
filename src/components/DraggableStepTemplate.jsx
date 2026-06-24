import { useDraggable } from "@dnd-kit/core";

export function DraggableStepTemplate({ step }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${step.type}`,
    data: { template: step.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-black/80 border border-red-600 rounded-lg p-3 mb-3 cursor-grab transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,0,0.7)] active:scale-[0.98]"
    >
      <span className="mr-2">{step.icon}</span>
      {step.label}
    </div>
  );
}

export default DraggableStepTemplate;
