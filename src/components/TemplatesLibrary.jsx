"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

export default function TemplatesLibrary() {
  const { user } = useUser();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTemplates(data || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const addTemplate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const { data } = await supabase
      .from("templates")
      .insert({
        user_id: user.id,
        title: newTitle,
        content: newContent,
      })
      .select()
      .single();

    setTemplates((prev) => [data, ...prev]);
    setNewTitle("");
    setNewContent("");
  };

  const updateTemplate = async (id, title, content) => {
    await supabase.from("templates").update({ title, content }).eq("id", id);

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, title, content } : t
      )
    );
  };

  const deleteTemplate = async (id) => {
    await supabase.from("templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <p className="text-gray-400">Loading templates...</p>;

  return (
    <div className="space-y-6">
      {/* ADD NEW TEMPLATE */}
      <div className="space-y-2">
        <input
          className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          placeholder="Template title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <textarea
          className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white h-24"
          placeholder="Template content..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />

        <button
          onClick={addTemplate}
          className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)]"
        >
          Add Template
        </button>
      </div>

      {/* TEMPLATE LIST */}
      {templates.map((t) => (
        <div
          key={t.id}
          className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          {editingId === t.id ? (
            <div className="space-y-2">
              <input
                className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white h-24"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button
                onClick={() => {
                  updateTemplate(t.id, editTitle, editContent);
                  setEditingId(null);
                }}
                className="text-xs bg-red-700 px-3 py-1 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-red-400">{t.title}</h3>
              <p className="text-gray-300 text-sm whitespace-pre-line mt-2">
                {t.content}
              </p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    setEditingId(t.id);
                    setEditTitle(t.title);
                    setEditContent(t.content);
                  }}
                  className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteTemplate(t.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}