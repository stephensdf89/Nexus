import { actions, conditions, triggers } from "./registry.js";

export async function executeStep(step, input) {
  const { type, key, config = {} } = step;

  if (type === "trigger") {
    const handler = triggers[key];
    if (!handler) throw new Error(`Unknown trigger: ${key}`);
    return handler({ type: config.eventType, payload: input });
  }

  if (type === "condition") {
    const handler = conditions[key];
    if (!handler) throw new Error(`Unknown condition: ${key}`);
    const passed = await handler(input, config);
    return { passed, output: input };
  }

  if (type === "action") {
    const handler = actions[key];
    if (!handler) throw new Error(`Unknown action: ${key}`);
    const output = await handler(input, config);
    return { output };
  }

  throw new Error(`Unknown step type: ${type}`);
}

export async function executePipelineSteps(steps, initialInput = {}) {
  let current = initialInput;

  for (const step of steps) {
    const result = await executeStep(step, current);

    if (step.type === "condition" && result.passed === false) {
      return {
        status: "stopped",
        reason: `Condition failed: ${step.key}`,
        output: current,
      };
    }

    if (result?.output !== undefined) {
      current = result.output;
    }
  }

  return {
    status: "success",
    output: current,
  };
}
