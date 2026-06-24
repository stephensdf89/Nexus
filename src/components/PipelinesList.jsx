"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

export default function PipelinesList() {
  const { user } = useUser();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPipelines(data || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const addPipeline = async () => {
    if (!newName.trim()) return;

    const { data } = await supabase
      .from("pipelines")
      .insert({
        user_id: user.id,
        name: newName,
        description: "",
        active: true,
      })
      .select()
      .single();

    setPipelines((prev) => [data, ...prev]);
    setNewName("");
  };

  const updatePipeline = async (id, name) => {
    await supabase.from("pipelines").update({ name }).eq("id", id);

    setPipelines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const deletePipeline = async (id) => {
    await supabase.from("pipelines").delete().eq("id", id);
    setPipelines((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <p className="text-gray-400">Loading pipelines...</p>;

  return (
    <div className="space-y-6">
      {/* ADD NEW PIPELINE */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          placeholder="New pipeline name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <button
          onClick={addPipeline}
          className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)]"
        >
          Add
        </button>
      </div>

      {/* PIPELINE LIST */}
      {pipelines.map((p) => (
        <div
          key={p.id}
          className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          {editingId === p.id ? (
            <div className="flex gap-2">
              <input
                className="flex-1 bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <button
                onClick={() => {
                  updatePipeline(p.id, editName);
                  setEditingId(null);
                }}
                className="text-xs bg-red-700 px-3 py-1 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-200 text-sm">{p.name}</span>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setEditName(p.name);
                  }}
                  className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                >
                  Rename
                </button>

                <button
                  onClick={() => deletePipeline(p.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}