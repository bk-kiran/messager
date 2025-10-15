"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function OnboardingForm() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const canSave = name.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name.trim(),
        bio: bio.trim(),
      });
      if (error) throw error;
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your profile</h1>

      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Short bio (optional)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button
        onClick={save}
        disabled={!canSave || saving}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
