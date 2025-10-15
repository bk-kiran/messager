import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/AuthButtons";

export default async function Home() {
  const supabase = await createClient();

  // 1) Require auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2) Require a profile (first-time users go to onboarding)
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error; // optional: surface unexpected errors
  if (!profile) redirect("/onboarding");

  // 3) Render the actual home content
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Welcome, {profile.display_name}</h1>
      {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
      <a className="underline" href="/groups">Go to Groups</a>
      <SignOutButton />
    </main>
  );
}