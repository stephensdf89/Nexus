export async function executeIntegrationAction({
  userId,
  provider,
  action,
  payload,
}) {
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
