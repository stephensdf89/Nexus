import { executePipelineSteps } from "./engine.js";

export default async function runPipeline(pipeline, input = {}) {
  if (!pipeline?.active) {
    return {
      status: "skipped",
      reason: "Pipeline inactive",
      output: input,
    };
  }

  const steps = Array.isArray(pipeline.steps) ? pipeline.steps : [];
  const orderedSteps = [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return executePipelineSteps(orderedSteps, input);
}
