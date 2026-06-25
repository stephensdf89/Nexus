"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

export default function IdeaInbox() {
  const { user } = useUser();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIdea, setNewIdea] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Could not load ideas.");
      }
      setIdeas(data || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const addIdea = async () => {
    if (!user) return;
    if (!newIdea.trim()) return;

    const { data, error } = await supabase
      .from("ideas")
      .insert({
        user_id: user.id,
        text: newIdea,
      })
      .select()
      .single();

    if (error || !data) {
      setError("Could not save idea.");
      return;
    }

    setIdeas((prev) => [data, ...prev]);
    setNewIdea("");
  };

  const deleteIdea = async (id) => {
    await supabase.from("ideas").delete().eq("id", id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-gray-400">Loading ideas...</p>;
  if (!user) return <p className="text-gray-400">Log in to manage ideas.</p>;

  return (
    <div className="space-y-3">
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          placeholder="New idea..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
        />

        <button
          onClick={addIdea}
          className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)]"
        >
          Add
        </button>
      </div>

      {ideas.map((idea) => (
        <div
          key={idea.id}
          className="bg-black/80 border border-red-600 rounded-lg p-3 shadow-[0_0_10px_rgba(255,0,0,0.4)] flex justify-between items-center"
        >
          <span className="text-gray-300 text-sm">{idea.text}</span>

          <button
            onClick={() => deleteIdea(idea.id)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
