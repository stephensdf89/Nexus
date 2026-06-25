"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

export default function TaskManager() {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Could not load tasks.");
      }
      setTasks(data || []);

      setLoading(false);
    };

    load();
  }, [user]);

  const addTask = async () => {
    if (!user) return;
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        text: newTask,
        done: false,
      })
      .select()
      .single();

    if (error || !data) {
      setError("Could not save task.");
      return;
    }

    setTasks((prev) => [data, ...prev]);

    setNewTask("");
  };

  const toggleDone = async (task) => {
    await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, done: !task.done } : t
      )
    );
  };

  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return <p className="text-gray-400">Loading tasks...</p>;
  }

  if (!user) {
    return <p className="text-gray-400">Log in to manage tasks.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="mb-4 flex gap-2">
        <input
          className="flex-1 bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <button
          onClick={addTask}
          className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)]"
        >
          Add
        </button>
      </div>

      {tasks.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between bg-black/80 border border-red-600 rounded-lg p-3 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          <span className={t.done ? "line-through text-gray-500" : "text-gray-200"}>
            {t.text}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleDone(t)}
              className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg hover:shadow-[0_0_10px_rgba(255,0,0,0.6)]"
            >
              {t.done ? "Undo" : "Done"}
            </button>

            <button
              onClick={() => deleteTask(t.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
