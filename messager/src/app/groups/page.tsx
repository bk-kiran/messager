import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // groups I belong to
  const { data: memberships } = await supabase
    .from("group_members")
    .select(`
      group_id,
      role,
      groups:group_id (
        id,
        name,
        description,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const groups = memberships?.map(m => ({
    ...(m.groups as any),
    role: m.role
  })) ?? [];

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Groups</h1>
        <Link 
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← Back to Home
        </Link>
      </div>

      <CreateGroupForm />

      {groups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>You haven't joined any groups yet.</p>
          <p className="text-sm mt-2">Create one above to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {groups.length} {groups.length === 1 ? 'Group' : 'Groups'}
          </h2>
          <ul className="space-y-2">
            {groups.map((group: any) => (
              <li key={group.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <Link href={`/groups/${group.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {group.role}
                        </span>
                        <span>
                          Created {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

function CreateGroupForm() {
  return (
    <form action="/groups/create" method="post" className="space-y-3">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Create a new group
        </label>
        <div className="flex gap-2">
          <input 
            id="name"
            name="name" 
            placeholder="Group name"
            className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black" 
            required 
          />
          <button 
            type="submit"
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
          >
            Create
          </button>
        </div>
      </div>
    </form>
  );
}