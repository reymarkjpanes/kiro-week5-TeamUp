"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Owner {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Props {
  members: Member[];
  owner: Owner | null;
  isOwner: boolean;
  teamId: string;
  currentUserId?: string;
}

export default function MembersList({
  members,
  owner,
  isOwner,
  teamId,
  currentUserId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    await supabase.from("team_members").delete().eq("id", memberId);
    router.refresh();
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", currentUserId!);
    router.refresh();
  };

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Team Members
      </h2>

      <div className="space-y-2.5">
        {/* Owner */}
        {owner && (
          <div className="flex items-center gap-3 rounded-lg bg-indigo-50/70 p-3">
            <div className="h-9 w-9 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
              {(owner.full_name || owner.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {owner.full_name || owner.username}
              </p>
              <p className="text-xs text-indigo-600 font-medium">Owner</p>
            </div>
          </div>
        )}

        {/* Members */}
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
          >
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
              {(
                member.profiles?.full_name ||
                member.profiles?.username ||
                "?"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {member.profiles?.full_name || member.profiles?.username}
              </p>
              <p className="text-xs text-gray-500">
                {member.role || "Member"}
              </p>
            </div>
            {isOwner && member.user_id !== currentUserId && (
              <button
                onClick={() => handleRemove(member.id)}
                className="flex-shrink-0 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
                aria-label={`Remove ${member.profiles?.full_name || member.profiles?.username}`}
              >
                Remove
              </button>
            )}
            {!isOwner && member.user_id === currentUserId && (
              <button
                onClick={handleLeave}
                className="flex-shrink-0 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                Leave
              </button>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <p className="text-sm text-gray-500 py-2">No members yet.</p>
        )}
      </div>
    </div>
  );
}
