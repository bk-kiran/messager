import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignInWithGoogleButton } from "@/components/AuthButtons";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/");
  return (
    <main className="min-h-screen grid place-items-center">
      <SignInWithGoogleButton />
    </main>
  );
}
