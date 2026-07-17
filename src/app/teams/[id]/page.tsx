import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApplicationForm from "./ApplicationForm";
import ApplicationsList from "./ApplicationsList";
import MembersList from "./MembersList";
import TeamActions from "./TeamActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: team } = await supabase
    .from("teams")
    .select(
      "*, profiles!teams_owner_id_fkey(id, username, full_name, avatar_url, skills), team_roles(id, slots, roles(id, name))"
    )
    .eq("id", id)
    .single();

  if (!team) notFound();

  const { data: members } = await supabase
    .from("team_members")
    .select("*, profiles(id, username, full_name, avatar_url)")
    .eq("team_id", id);

  let userApplication = null;
  if (user) {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    userApplication = data;
  }

  const isMember = members?.some((m) => m.user_id === user?.id);
  const isOwner = team.owner_id === user?.id;

  let applications = null;
  if (isOwner) {
    const { data } = await supabase
      .from("applications")
      .select("*, profiles(id, username, full_name, avatar_url, skills, bio)")
      .eq("team_id", id)
      .order("created_at", { ascending: false });
    applications = data;
  }

  const statusBadge = (status: string | null) => {
    switch (status) {
      case "Open":
        return "badge-green";
      case "Closed":
        return "badge-red";
      case "Completed":
        return "badge-blue";
      default:
        return "badge-gray";
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 page-container py-6 sm:py-8">
        {/* Team Header */}
        <div className="card p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-indigo">
                  {team.category || "General"}
                </span>
                <span className={statusBadge(team.status)}>
                  {team.status}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                {team.title}
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Created by{" "}
                <span className="font-medium text-gray-700">
                  {team.profiles?.full_name || team.profiles?.username}
                </span>{" "}
                on {new Date(team.created_at!).toLocaleDateString()}
              </p>
            </div>
            {isOwner && <TeamActions team={team} />}
          </div>

          <p className="mt-5 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
            {team.description || "No description provided."}
          </p>

          {/* Roles needed */}
          {team.team_roles && team.team_roles.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Roles Needed
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {team.team_roles.map(
                  (tr: {
                    id: string;
                    slots: number | null;
                    roles: { id: string; name: string } | null;
                  }) => (
                    <span key={tr.id} className="badge-purple">
                      {tr.roles?.name} ({tr.slots} slot
                      {(tr.slots ?? 1) !== 1 ? "s" : ""})
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-5 flex flex-wrap gap-4 sm:gap-6 border-t border-gray-100 pt-5 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span>
                <span className="font-semibold text-gray-900">
                  {(members?.length ?? 0) + 1}
                </span>{" "}
                / {team.max_members} members
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3 sm:mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Form */}
            {user &&
              !isOwner &&
              !isMember &&
              team.status === "Open" &&
              (!userApplication ||
                userApplication.status === "Rejected" ||
                userApplication.status === "Cancelled") && (
                <ApplicationForm teamId={id} userId={user.id} />
              )}

            {/* User's application status */}
            {userApplication && userApplication.status === "Pending" && (
              <div className="card bg-amber-50 border-amber-200 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Your application is <strong>pending</strong> review by the
                    team owner.
                  </p>
                </div>
              </div>
            )}

            {userApplication &&
              userApplication.status === "Accepted" &&
              !isMember && (
                <div className="card bg-emerald-50 border-emerald-200 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-emerald-800">
                      Your application has been <strong>accepted</strong>!
                    </p>
                  </div>
                </div>
              )}

            {/* Applications (owner only) */}
            {isOwner && applications && (
              <ApplicationsList applications={applications} teamId={id} />
            )}
          </div>

          {/* Sidebar - Members */}
          <div>
            <MembersList
              members={members || []}
              owner={team.profiles}
              isOwner={isOwner}
              teamId={id}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
