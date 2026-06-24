import { executeIntegrationAction } from "./executeIntegrationAction.ts";

type RunRecord = {
  id: string;
  pipeline_id: string;
  user_id?: string | null;
  input_data?: Record<string, unknown> | null;
  output_data?: Record<string, unknown> | null;
};

type PipelineStep = {
  id: string;
  type: string;
  config?: Record<string, any>;
};

export async function executeActionStep(step: PipelineStep, run: RunRecord, supabase: unknown) {
  const config = step.config ?? {};
  const payload = (run.output_data ?? run.input_data ?? {}) as Record<string, unknown>;

  switch (step.type) {
    case "integration":
      return await executeIntegrationAction({
        userId: run.user_id,
        provider: config.provider,
        action: config.action,
        payload: config.payload,
      });

    case "delay":
      await new Promise((resolve) =>
        setTimeout(resolve, config.ms)
      );
      return { delayed: config.ms };

    case "http":
      const res = await fetch(config.url, {
        method: config.method || "GET",
        headers: config.headers || {},
        body: config.body ? JSON.stringify(config.body) : undefined,
      });
      return await res.json();

    case "transform":
      return eval(config.code); // sandbox later

    case "trigger":
      return {
        matched: true,
        payload,
      };

    case "condition": {
      const text = String(
        payload.text ?? payload.messageText ?? payload.commentText ?? ""
      ).toLowerCase();
      const keyword = String(config.keyword ?? config.term ?? "").toLowerCase();
      const passed = keyword ? text.includes(keyword) : true;

      return {
        passed,
        output: payload,
      };
    }

    case "action": {
      const provider = String(config.provider ?? "").trim();
      const action = String(config.action ?? config.handler ?? config.key ?? "").trim();
      const targetPayload = config.payload ?? payload;

      if (!provider || !action) {
        throw new Error("Missing provider or action for pipeline step");
      }

      return await executeIntegrationAction({
        userId: run.user_id,
        provider,
        action,
        payload: targetPayload,
      });
    }

    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}
