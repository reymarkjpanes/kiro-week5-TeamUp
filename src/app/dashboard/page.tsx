import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's teams (as owner)
  const { data: myTeams } = await supabase
    .from("teams")
    .select("*, team_members(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch teams I'm a member of
  const { data: memberTeams } = await supabase
    .from("team_members")
    .select("*, teams(*)")
    .eq("user_id", user.id);

  // Fetch my pending applications
  const { data: myApplications } = await supabase
    .from("applications")
    .select("*, teams(title, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch pending applications for my teams
  const { data: incomingApplications } = await supabase
    .from("applications")
    .select("*, profiles(username, full_name, avatar_url), teams!inner(title, owner_id)")
    .eq("teams.owner_id", user.id)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link
            href="/teams/create"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Team
          </Link>
        </div>

        {/* Incoming Applications Alert */}
        {incomingApplications && incomingApplications.length > 0 && (
          <div className="mb-8 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <h2 className="text-sm font-semibold text-yellow-800">
              📬 {incomingApplications.length} pending application(s) to review
            </h2>
            <div className="mt-3 space-y-2">
              {incomingApplications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-yellow-900">
                    <strong>{app.profiles?.full_name || app.profiles?.username}</strong>{" "}
                    applied to <strong>{app.teams?.title}</strong>
                  </span>
                  <Link
                    href={`/teams/${app.team_id}`}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* My Teams */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Teams (Owner)
            </h2>
            {myTeams && myTeams.length > 0 ? (
              <div className="space-y-3">
                {myTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="block rounded-lg bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {team.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          team.status === "Open"
                            ? "bg-green-100 text-green-700"
                            : team.status === "Closed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {team.category} • {team.team_members?.[0]?.count ?? 0}/{team.max_members} members
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-500">You haven&apos;t created any teams yet.</p>
                <Link
                  href="/teams/create"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Create your first team →
                </Link>
              </div>
            )}
          </section>

          {/* Teams I'm Part Of */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Teams I&apos;ve Joined
            </h2>
            {memberTeams && memberTeams.length > 0 ? (
              <div className="space-y-3">
                {memberTeams.map((membership) => (
                  <Link
                    key={membership.id}
                    href={`/teams/${membership.team_id}`}
                    className="block rounded-lg bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900">
                      {membership.teams?.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Role: {membership.role || "Member"} • Joined{" "}
                      {new Date(membership.joined_at!).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-500">You haven&apos;t joined any teams yet.</p>
                <Link
                  href="/teams"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Browse open teams →
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* My Applications */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Applications
          </h2>
          {myApplications && myApplications.length > 0 ? (
            <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/teams/${app.team_id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {app.teams?.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            app.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : app.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : app.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(app.created_at!).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
              <p className="text-gray-500">No applications yet.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
