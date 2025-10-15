import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // groups I belong to
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups:group_id ( id, name, description )")
    .eq("user_id", user.id);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Groups</h1>
      <CreateGroupForm />
      <ul className="space-y-2">
        {(memberships ?? []).map((m: any) => (
          <li key={m.group_id}>
            <a className="underline" href={`/groups/${m.groups.id}`}>{m.groups.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

function CreateGroupForm() {
  return (
    <form action="/groups/create" method="post" className="flex gap-2">
      <input name="name" placeholder="New group name"
        className="border rounded px-3 py-2 flex-1" required />
      <button className="px-4 py-2 rounded bg-black text-white">Create</button>
    </form>
  );
}
