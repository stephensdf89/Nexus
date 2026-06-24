import { executeStep } from "@/pipelines/engine.js";
import { getPgClient } from "@/lib/pg";

type PipelineStepRow = {
  id: string;
  pipeline_id: string;
  step_order: number;
  type: "trigger" | "condition" | "action";
  config: Record<string, any>;
};

export async function executePipelineById(pipelineId: string, payload: Record<string, any> = {}) {
  const pgClient = await getPgClient();

  const pipelineResult = await pgClient.query(
    "SELECT id, active, user_id FROM pipelines WHERE id = $1 LIMIT 1",
    [pipelineId]
  );

  if (pipelineResult.rows.length === 0) {
    return { ok: false, error: "Pipeline not found" };
  }

  const pipeline = pipelineResult.rows[0];

  if (!pipeline.active) {
    return { ok: false, error: "Pipeline is inactive" };
  }

  const stepsResult = await pgClient.query(
    "SELECT id, pipeline_id, step_order, type, config FROM pipeline_steps WHERE pipeline_id = $1 ORDER BY step_order ASC",
    [pipelineId]
  );

  const steps = stepsResult.rows as PipelineStepRow[];

  const startedAt = new Date().toISOString();

  const runInsert = await pgClient.query(
    `INSERT INTO pipeline_runs (pipeline_id, user_id, status, started_at, input_data, output_data)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
     RETURNING id`,
    [pipelineId, pipelineResult.rows[0].user_id, "pending", startedAt, JSON.stringify(payload), JSON.stringify({})]
  );

  const runId = runInsert.rows[0].id as string;

  await pgClient.query(`INSERT INTO job_queue (run_id) VALUES ($1)`, [runId]);

  let currentData: Record<string, any> = { ...payload };

  try {
    for (const step of steps) {
      const stepInput = { ...currentData };

      try {
        const stepConfig = step.config ?? {};
        const stepKey =
          stepConfig.key ??
          stepConfig.handler ??
          stepConfig.type ??
          step.type;

        const engineResult = await executeStep(
          {
            type: step.type,
            key: stepKey,
            config: stepConfig,
          },
          stepInput
        );

        if (step.type === "trigger" && engineResult?.matched === false) {
          throw new Error(engineResult.reason ?? "Trigger did not match");
        }

        if (step.type === "condition" && engineResult?.passed === false) {
          throw new Error(`Condition failed: ${stepKey}`);
        }

        if (engineResult?.output !== undefined) {
          currentData = engineResult.output;
        } else if (engineResult?.payload !== undefined) {
          currentData = engineResult.payload;
        }

        await pgClient.query(
          `INSERT INTO pipeline_run_steps
            (run_id, step_id, status, started_at, finished_at, input_data, output_data)
           VALUES ($1, $2, 'success', NOW(), NOW(), $3::jsonb, $4::jsonb)`,
          [
            runId,
            step.id,
            JSON.stringify(stepInput),
            JSON.stringify(currentData),
          ]
        );
      } catch (stepError) {
        const message =
          stepError instanceof Error ? stepError.message : "Unknown step execution error";

        await pgClient.query(
          `INSERT INTO pipeline_run_steps
            (run_id, step_id, status, started_at, finished_at, error_message, input_data, output_data)
           VALUES ($1, $2, 'error', NOW(), NOW(), $3, $4::jsonb, $5::jsonb)`,
          [
            runId,
            step.id,
            message,
            JSON.stringify(stepInput),
            JSON.stringify(currentData),
          ]
        );

        await pgClient.query(
          "UPDATE pipeline_runs SET status = 'failed', finished_at = NOW(), error_message = $2, output_data = $3::jsonb WHERE id = $1",
          [runId, message, JSON.stringify(currentData)]
        );

        return { ok: false, runId, error: message };
      }
    }

    await pgClient.query(
      "UPDATE pipeline_runs SET status = 'success', finished_at = NOW(), output_data = $2::jsonb WHERE id = $1",
      [runId, JSON.stringify(currentData)]
    );

    return { ok: true, runId, output: currentData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pipeline execution error";

    await pgClient.query(
      "UPDATE pipeline_runs SET status = 'failed', finished_at = NOW(), error_message = $2, output_data = $3::jsonb WHERE id = $1",
      [runId, message, JSON.stringify(currentData)]
    );

    return { ok: false, runId, error: message };
  }
}
