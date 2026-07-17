import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myTeams } = await supabase
    .from("teams")
    .select("*, team_members(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: memberTeams } = await supabase
    .from("team_members")
    .select("*, teams(*)")
    .eq("user_id", user.id);

  const { data: myApplications } = await supabase
    .from("applications")
    .select("*, teams(title, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: incomingApplications } = await supabase
    .from("applications")
    .select(
      "*, profiles(username, full_name, avatar_url), teams!inner(title, owner_id)"
    )
    .eq("teams.owner_id", user.id)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main className="flex-1 page-container py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your teams and applications
            </p>
          </div>
          <Link href="/teams/create" className="btn-primary btn-md sm:w-auto">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Team
          </Link>
        </div>

        {/* Incoming Applications Alert */}
        {incomingApplications && incomingApplications.length > 0 && (
          <div className="mb-6 sm:mb-8 card bg-amber-50 border-amber-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-amber-800">
                  {incomingApplications.length} pending application
                  {incomingApplications.length !== 1 ? "s" : ""} to review
                </h2>
                <div className="mt-2 space-y-2">
                  {incomingApplications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-amber-900 truncate">
                        <strong>
                          {app.profiles?.full_name || app.profiles?.username}
                        </strong>{" "}
                        → <strong>{app.teams?.title}</strong>
                      </span>
                      <Link
                        href={`/teams/${app.team_id}`}
                        className="text-indigo-600 hover:text-indigo-500 font-medium whitespace-nowrap"
                      >
                        Review →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Teams */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              My Teams
            </h2>
            {myTeams && myTeams.length > 0 ? (
              <div className="space-y-3">
                {myTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="card-hover block p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {team.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {team.category} •{" "}
                          {team.team_members?.[0]?.count ?? 0}/
                          {team.max_members} members
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 ${
                          team.status === "Open"
                            ? "badge-green"
                            : team.status === "Closed"
                            ? "badge-red"
                            : team.status === "Completed"
                            ? "badge-blue"
                            : "badge-gray"
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card border-dashed p-8 text-center">
                <svg
                  className="mx-auto h-10 w-10 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
                <p className="mt-3 text-sm text-gray-500">
                  You haven&apos;t created any teams yet.
                </p>
                <Link
                  href="/teams/create"
                  className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Create your first team →
                </Link>
              </div>
            )}
          </section>

          {/* Teams I've Joined */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Teams I&apos;ve Joined
            </h2>
            {memberTeams && memberTeams.length > 0 ? (
              <div className="space-y-3">
                {memberTeams.map((membership) => (
                  <Link
                    key={membership.id}
                    href={`/teams/${membership.team_id}`}
                    className="card-hover block p-4 sm:p-5"
                  >
                    <h3 className="font-medium text-gray-900 truncate">
                      {membership.teams?.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {membership.role || "Member"} • Joined{" "}
                      {new Date(membership.joined_at!).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card border-dashed p-8 text-center">
                <svg
                  className="mx-auto h-10 w-10 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <p className="mt-3 text-sm text-gray-500">
                  You haven&apos;t joined any teams yet.
                </p>
                <Link
                  href="/teams"
                  className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Browse open teams →
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* My Applications */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            My Applications
          </h2>
          {myApplications && myApplications.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 sm:px-6">
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
                      <tr key={app.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 sm:px-6">
                          <Link
                            href={`/teams/${app.team_id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            {app.teams?.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={
                              app.status === "Pending"
                                ? "badge-yellow"
                                : app.status === "Accepted"
                                ? "badge-green"
                                : app.status === "Rejected"
                                ? "badge-red"
                                : "badge-gray"
                            }
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">
                          {new Date(app.created_at!).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {myApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/teams/${app.team_id}`}
                    className="card block p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900 truncate">
                        {app.teams?.title}
                      </span>
                      <span
                        className={`flex-shrink-0 ${
                          app.status === "Pending"
                            ? "badge-yellow"
                            : app.status === "Accepted"
                            ? "badge-green"
                            : app.status === "Rejected"
                            ? "badge-red"
                            : "badge-gray"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Applied {new Date(app.created_at!).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="card border-dashed p-8 text-center">
              <p className="text-sm text-gray-500">No applications yet.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
