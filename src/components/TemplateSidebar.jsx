"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function TemplateSidebar({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    supabase
      .from("pipeline_templates")
      .select("*")
      .then(({ data }) => setTemplates(data));
  }, []);

  return (
    <div className="w-64 bg-black/60 border-r border-red-600 p-4">
      <h2 className="text-red-400 font-bold mb-4">Templates</h2>

      {templates.map((t) => (
        <div
          key={t.id}
          onClick={() => onSelectTemplate(t)}
          className="bg-black/80 border border-red-600 rounded-lg p-3 mb-3 cursor-pointer hover:shadow-[0_0_12px_rgba(255,0,0,0.6)]"
        >
          <span className="mr-2">{t.icon}</span>
          {t.name}
        </div>
      ))}
    </div>
  );
}

export default TemplateSidebar;
