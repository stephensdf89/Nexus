"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/AuthContext";
import { Calendar, Clock, X, Plus, Edit2, Trash2 } from "lucide-react";

interface ScheduledPost {
  id: string;
  platforms: string[];
  content: string;
  media_urls?: string[];
  scheduled_time: string;
  status: string;
  created_at: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "bg-red-500/20 text-red-300 border-red-500/30",
  tiktok: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  twitter: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  twitch: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  linkedin: "bg-blue-600/20 text-blue-200 border-blue-600/30",
  facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pinterest: "bg-red-600/20 text-red-200 border-red-600/30",
};

export default function ContentScheduler() {
  const authContext = useUser();
  const user = authContext?.user;

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platforms: [] as string[],
    content: "",
    scheduled_time: "",
  });

  const allPlatforms = [
    "youtube",
    "tiktok",
    "instagram",
    "twitter",
    "twitch",
    "linkedin",
    "facebook",
    "pinterest",
  ];

  useEffect(() => {
    if (user) {
      fetchScheduledPosts();
    }
  }, [user]);

  const fetchScheduledPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await fetch("/api/content/scheduled", {
        headers: {
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setScheduledPosts(data.scheduled_posts || []);
        setError(null);
      } else {
        setError("Failed to fetch scheduled posts");
      }
    } catch (err) {
      console.error("Error fetching scheduled posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (formData.platforms.length === 0) {
      setError("Select at least one platform");
      return;
    }
    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }
    if (!formData.scheduled_time) {
      setError("Scheduled time is required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/content/scheduled/${editingId}` : "/api/content/scheduled";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
        body: JSON.stringify({
          platforms: formData.platforms,
          content: formData.content,
          media_urls: [],
          scheduled_time: formData.scheduled_time,
        }),
      });

      if (res.ok) {
        setFormData({ platforms: [], content: "", scheduled_time: "" });
        setEditingId(null);
        setShowForm(false);
        setError(null);
        await fetchScheduledPosts();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save post");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError(err instanceof Error ? err.message : "Failed to save post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this scheduled post?")) return;

    try {
      const res = await fetch(`/api/content/scheduled/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
      });

      if (res.ok) {
        await fetchScheduledPosts();
        setError(null);
      } else {
        setError("Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const handleEdit = (post: ScheduledPost) => {
    setFormData({
      platforms: post.platforms,
      content: post.content,
      scheduled_time: post.scheduled_time.split(".")[0].replace(" ", "T"),
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Scheduler</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ platforms: [], content: "", scheduled_time: "" });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900/50 border border-cyan-400/40 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allPlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        platforms: prev.platforms.includes(platform)
                          ? prev.platforms.filter((p) => p !== platform)
                          : [...prev.platforms, platform],
                      }));
                    }}
                    className={`px-3 py-2 rounded border capitalize text-sm font-medium transition-all ${
                      formData.platforms.includes(platform)
                        ? PLATFORM_COLORS[platform]
                        : "bg-slate-800/50 border-gray-600/30 text-gray-300 hover:border-gray-500/50"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="What would you like to post?"
                className="w-full h-24 bg-slate-800 border border-cyan-400/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.content.length}/280 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Schedule Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduled_time: e.target.value,
                  }))
                }
                className="w-full bg-slate-800 border border-cyan-400/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400/60"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded font-semibold transition-all"
              >
                {editingId ? "Update Post" : "Schedule Post"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ platforms: [], content: "", scheduled_time: "" });
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading scheduled posts...</div>
      ) : scheduledPosts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 border border-cyan-400/20 rounded-lg">
          <Calendar className="w-12 h-12 mx-auto text-gray-500 mb-3 opacity-50" />
          <p className="text-gray-400">No scheduled posts yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first scheduled post to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/50 border border-cyan-400/20 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  {post.platforms.map((platform) => (
                    <span
                      key={platform}
                      className={`px-2 py-1 rounded text-xs font-semibold border ${
                        PLATFORM_COLORS[platform]
                      }`}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 hover:bg-slate-700 rounded transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 hover:bg-red-900/30 rounded transition-all text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-100 mb-3 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.scheduled_time)}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      post.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : post.status === "published"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
