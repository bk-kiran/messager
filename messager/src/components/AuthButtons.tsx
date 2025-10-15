"use client";

import { supabaseBrowser } from "@/lib/supabase/client";

export function SignInWithGoogleButton() {
  const onClick = async () => {
    const supabase = supabaseBrowser();
    // Start the Google OAuth flow
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" }, // lets user pick account each time
      },
    });
  };

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
    >
      Continue with Google
    </button>
  );
}

export function SignOutButton() {
  const onClick = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut(); // removes Supabase session cookies
    window.location.href = "/login"; // redirect to login after sign-out
  };

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded border hover:bg-gray-50 transition"
    >
      Sign out
    </button>
  );
}
