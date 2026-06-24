"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

export default function Planner() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("planner_events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      setEvents(data || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const addEvent = async () => {
    if (!newTitle.trim() || !newDate) return;

    const { data } = await supabase
      .from("planner_events")
      .insert({
        user_id: user.id,
        title: newTitle,
        date: newDate,
        metadata: {},
      })
      .select()
      .single();

    setEvents((prev) => [...prev, data]);
    setNewTitle("");
    setNewDate("");
  };

  const updateEvent = async (id, title, date) => {
    await supabase.from("planner_events").update({ title, date }).eq("id", id);

    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, title, date } : e
      )
    );
  };

  const deleteEvent = async (id) => {
    await supabase.from("planner_events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <p className="text-gray-400">Loading planner...</p>;

  return (
    <div className="space-y-6">
      {/* ADD NEW EVENT */}
      <div className="space-y-2">
        <input
          className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          placeholder="Event title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <input
          type="date"
          className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />

        <button
          onClick={addEvent}
          className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)]"
        >
          Add Event
        </button>
      </div>

      {/* EVENT LIST */}
      {events.map((e) => (
        <div
          key={e.id}
          className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          {editingId === e.id ? (
            <div className="space-y-2">
              <input
                className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
                value={editTitle}
                onChange={(ev) => setEditTitle(ev.target.value)}
              />

              <input
                type="date"
                className="w-full bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
                value={editDate}
                onChange={(ev) => setEditDate(ev.target.value)}
              />

              <button
                onClick={() => {
                  updateEvent(e.id, editTitle, editDate);
                  setEditingId(null);
                }}
                className="text-xs bg-red-700 px-3 py-1 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-red-400">{e.title}</h3>
              <p className="text-gray-300 text-sm mt-1">
                {new Date(e.date).toLocaleDateString()}
              </p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    setEditingId(e.id);
                    setEditTitle(e.title);
                    setEditDate(e.date);
                  }}
                  className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteEvent(e.id)}
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