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
}: ExecuteIntegrationActionArgs): Promise<void> {
  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-integration-action`,
    {
      method: "POST",
      body: JSON.stringify({
        userId,
        provider,
        action,
        payload,
      }),
    }
  );
}
