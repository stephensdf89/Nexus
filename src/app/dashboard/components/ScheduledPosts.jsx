"use client";

export default function ScheduledPosts() {
  // Hook this up to your DB later
  const scheduled = [];

  return (
    <div>
      <h2>Scheduled Posts</h2>
      {scheduled.length === 0 && <div>No scheduled posts yet.</div>}
      {scheduled.map((post) => (
        <div key={post.id}>
          {post.platform} — {post.content} — {post.scheduleFor}
        </div>
      ))}
    </div>
  );
}
