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

    // Update application status
    const { error } = await supabase
      .from("applications")
      .update({ status: action })
      .eq("id", applicationId);

    if (error) {
      alert(error.message);
      setLoading(null);
      return;
    }

    // If accepted, add to team_members
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
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Applications ({pendingApps.length} pending)
      </h2>

      {pendingApps.length > 0 ? (
        <div className="mt-4 space-y-4">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {app.profiles?.full_name || app.profiles?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{app.profiles?.username}
                  </p>
                  {app.profiles?.skills && app.profiles.skills.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {app.profiles.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(app.created_at!).toLocaleDateString()}
                </span>
              </div>
              {app.message && (
                <p className="mt-3 text-sm text-gray-700 bg-gray-50 rounded p-3">
                  &ldquo;{app.message}&rdquo;
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() =>
                    handleAction(app.id, app.user_id, "Accepted")
                  }
                  disabled={loading === app.id}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleAction(app.id, app.user_id, "Rejected")
                  }
                  disabled={loading === app.id}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">
                  {app.profiles?.full_name || app.profiles?.username}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    app.status === "Accepted"
                      ? "bg-green-100 text-green-700"
                      : app.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
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
