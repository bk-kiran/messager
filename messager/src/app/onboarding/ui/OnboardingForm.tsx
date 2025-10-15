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

  const handleBack = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself to get started</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/50 characters</p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
          </div>

          <button
            onClick={save}
            disabled={!canSave || saving}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Profile...
              </span>
            ) : (
              "Continue to Messager"
            )}
          </button>

          {/* Back/Cancel Button */}
          <button
            onClick={handleBack}
            disabled={saving}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel & Sign Out
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          You can update your profile anytime from settings
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Step 1 of 3: Profile Setup</p>
      </div>
    </div>
  );
}