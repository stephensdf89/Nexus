"use client";

import { useState } from "react";

export default function PostForm() {
  const [platform, setPlatform] = useState("instagram");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduleFor, setScheduleFor] = useState("");

  async function handlePost(e) {
    e.preventDefault();

    const endpoint = scheduleFor
      ? "/api/postpulse/schedule"
      : "/api/postpulse/post";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, content, mediaUrl, scheduleFor })
    });

    const data = await res.json();
    console.log("Post result:", data);
  }

  return (
    <div>
      <h2>Create Post</h2>
      <form onSubmit={handlePost}>
        <div>
          <label>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
          </select>
        </div>

        <div>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label>Media URL</label>
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>

        <div>
          <label>Schedule For (ISO datetime, optional)</label>
          <input
            value={scheduleFor}
            onChange={(e) => setScheduleFor(e.target.value)}
          />
        </div>

        <button type="submit">Post</button>
      </form>
    </div>
  );
}
