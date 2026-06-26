import { publishViaPostPulse, fetchPostPulseAnalytics } from "@/lib/postpulseClient";

export async function publishPostpulsePost(input) {
  return publishViaPostPulse(input);
}

export async function schedulePostpulsePost(input) {
  const res = await fetch("/api/postpulse/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Failed to schedule post");
  }
  return data;
}

export async function getPostpulseAnalytics(input) {
  return fetchPostPulseAnalytics(input);
}

export async function disconnectPostpulse(platform) {
  const res = await fetch("/api/postpulse/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Failed to disconnect");
  }
  return data;
}
