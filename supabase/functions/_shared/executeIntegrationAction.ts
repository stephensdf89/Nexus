type ExecuteIntegrationActionArgs = {
  userId: string;
  provider: string;
  action: string;
  payload?: Record<string, unknown>;
};

export async function executeIntegrationAction({
  userId,
  provider,
  action,
  payload,
}: ExecuteIntegrationActionArgs): Promise<unknown> {
  const baseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!baseUrl || !serviceKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  const response = await fetch(
    `${baseUrl}/functions/v1/execute-integration-action`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        provider,
        action,
        payload,
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "Integration action failed");
    throw new Error(message || "Integration action failed");
  }

  return await response.json();
}
