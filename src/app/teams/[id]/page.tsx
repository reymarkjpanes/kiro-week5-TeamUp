import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
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

  // Fetch team with owner profile and roles
  const { data: team } = await supabase
    .from("teams")
    .select(
      "*, profiles!teams_owner_id_fkey(id, username, full_name, avatar_url, skills), team_roles(id, slots, roles(id, name))"
    )
    .eq("id", id)
    .single();

  if (!team) notFound();

  // Fetch members
  const { data: members } = await supabase
    .from("team_members")
    .select("*, profiles(id, username, full_name, avatar_url)")
    .eq("team_id", id);

  // Check if current user already applied
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

  // Check if user is member
  const isMember = members?.some((m) => m.user_id === user?.id);
  const isOwner = team.owner_id === user?.id;

  // Fetch applications (only visible to owner)
  let applications = null;
  if (isOwner) {
    const { data } = await supabase
      .from("applications")
      .select("*, profiles(id, username, full_name, avatar_url, skills, bio)")
      .eq("team_id", id)
      .order("created_at", { ascending: false });
    applications = data;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Team Header */}
        <div className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  {team.category || "General"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    team.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : team.status === "Closed"
                      ? "bg-red-100 text-red-700"
                      : team.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {team.status}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">
                {team.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Created by{" "}
                <span className="font-medium text-gray-700">
                  {team.profiles?.full_name || team.profiles?.username}
                </span>{" "}
                on {new Date(team.created_at!).toLocaleDateString()}
              </p>
            </div>
            {isOwner && <TeamActions team={team} />}
          </div>

          <p className="mt-6 text-gray-700 whitespace-pre-wrap">
            {team.description || "No description provided."}
          </p>

          {/* Roles needed */}
          {team.team_roles && team.team_roles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Roles Needed
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {team.team_roles.map((tr: { id: string; slots: number | null; roles: { id: string; name: string } | null }) => (
                  <span
                    key={tr.id}
                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                  >
                    {tr.roles?.name} ({tr.slots} slot{(tr.slots ?? 1) !== 1 ? "s" : ""})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex gap-6 border-t border-gray-100 pt-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-900">
                {(members?.length ?? 0) + 1}
              </span>{" "}
              / {team.max_members} members
            </div>
            <div>
              Status: <span className="font-semibold">{team.status}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
            {userApplication &&
              userApplication.status === "Pending" && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800">
                    ⏳ Your application is <strong>pending</strong> review by the team
                    owner.
                  </p>
                </div>
              )}

            {userApplication && userApplication.status === "Accepted" && !isMember && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800">
                  ✅ Your application has been <strong>accepted</strong>!
                </p>
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
    </>
  );
}
