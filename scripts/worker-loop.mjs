const workerUrl =
  process.env.WORKER_URL ||
  (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/functions/v1/worker` : null);

if (!workerUrl) {
  throw new Error("Set WORKER_URL or SUPABASE_URL before running worker loop.");
}

while (true) {
  await fetch(workerUrl);
  await new Promise((r) => setTimeout(r, 2000));
}
