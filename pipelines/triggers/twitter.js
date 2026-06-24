export default async function twitterTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const payload = event?.payload ?? event ?? {};
  const tweetCreateEvents = Array.isArray(payload.tweet_create_events)
    ? payload.tweet_create_events
    : Array.isArray(event.tweet_create_events)
      ? event.tweet_create_events
      : [];

  const firstTweet = tweetCreateEvents[0] ?? {};
  const normalizedPayload = {
    ...payload,
    tweet_create_events: tweetCreateEvents,
    tweetText: firstTweet.text ?? payload.text ?? null,
    userId: firstTweet.user?.id ?? payload.userId ?? payload.user_id ?? null,
  };

  const matched =
    triggerType.startsWith("twitter.") ||
    tweetCreateEvents.length > 0 ||
    typeof normalizedPayload.tweetText === "string";

  return {
    matched,
    payload: normalizedPayload,
    reason: matched ? null : "Trigger type mismatch for Twitter",
  };
}
