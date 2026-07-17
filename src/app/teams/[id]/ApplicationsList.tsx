"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Application {
  id: string;
  message: string | null;
  status: string | null;
  created_at: string | null;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    skills: string[] | null;
    bio: string | null;
  } | null;
}

interface Props {
  applications: Application[];
  teamId: string;
}

export default function ApplicationsList({ applications, teamId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    applicationId: string,
    userId: string,
    action: "Accepted" | "Rejected"
  ) => {
    setLoading(applicationId);

    const { error } = await supabase
      .from("applications")
      .update({ status: action })
      .eq("id", applicationId);

    if (error) {
      alert(error.message);
      setLoading(null);
      return;
    }

    if (action === "Accepted") {
      await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: userId,
      });
    }

    setLoading(null);
    router.refresh();
  };

  const pendingApps = applications.filter((a) => a.status === "Pending");
  const processedApps = applications.filter((a) => a.status !== "Pending");

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Applications{" "}
        {pendingApps.length > 0 && (
          <span className="badge-yellow ml-2">{pendingApps.length} pending</span>
        )}
      </h2>

      {pendingApps.length > 0 ? (
        <div className="mt-4 space-y-4">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {app.profiles?.full_name || app.profiles?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{app.profiles?.username}
                  </p>
                  {app.profiles?.skills && app.profiles.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.profiles.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="badge-gray text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(app.created_at!).toLocaleDateString()}
                </span>
              </div>
              {app.message && (
                <p className="mt-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">
                  &ldquo;{app.message}&rdquo;
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() =>
                    handleAction(app.id, app.user_id, "Accepted")
                  }
                  disabled={loading === app.id}
                  className="btn bg-emerald-600 text-white hover:bg-emerald-700 btn-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleAction(app.id, app.user_id, "Rejected")
                  }
                  disabled={loading === app.id}
                  className="btn bg-red-600 text-white hover:bg-red-700 btn-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">No pending applications.</p>
      )}

      {/* Processed applications */}
      {processedApps.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">History</h3>
          <div className="space-y-2">
            {processedApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="text-gray-700 truncate">
                  {app.profiles?.full_name || app.profiles?.username}
                </span>
                <span
                  className={`flex-shrink-0 ${
                    app.status === "Accepted"
                      ? "badge-green"
                      : app.status === "Rejected"
                      ? "badge-red"
                      : "badge-gray"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
