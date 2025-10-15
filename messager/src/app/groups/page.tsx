import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GroupsPage() {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  console.log("Fetching groups for user:", user.id);

  // Step 1: get all group IDs this user belongs to
  const { data: memberships, error: mErr } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (mErr) {
    console.error("Membership fetch error:", mErr);
    return <p>Error loading memberships</p>;
  }

  const ids = (memberships ?? []).map((m) => m.group_id);

  // Step 2: get the actual group details
  const { data: groups, error: gErr } = ids.length
    ? await supabase.from("groups").select("id, name").in("id", ids)
    : { data: [], error: null };

  if (gErr) {
    console.error("Groups query error:", gErr);
    return <p>Error loading groups: {gErr.message}</p>;
  }

  console.log("Groups query result:", { count: groups?.length, error: gErr });

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Groups</h1>

      {/* Group creation form */}
      <form action="/groups/create" method="post" className="flex gap-2">
        <input
          name="name"
          placeholder="New group name"
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
        >
          Create
        </button>
      </form>

      {/* Groups list */}
      {groups && groups.length > 0 ? (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/groups/${g.id}`}
                className="underline hover:text-blue-600"
              >
                {g.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">You’re not in any groups yet.</p>
      )}
    </main>
  );
}
