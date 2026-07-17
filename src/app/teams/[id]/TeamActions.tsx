"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Team {
  id: string;
  status: string | null;
}

interface Props {
  team: Team;
}

export default function TeamActions({ team }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (
    newStatus: "Open" | "Closed" | "Completed" | "Archived"
  ) => {
    setLoading(true);
    await supabase.from("teams").update({ status: newStatus }).eq("id", team.id);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this team? This cannot be undone."))
      return;

    setLoading(true);
    await supabase.from("teams").delete().eq("id", team.id);
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {team.status === "Open" && (
        <button
          onClick={() => handleStatusChange("Closed")}
          disabled={loading}
          className="rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
        >
          Close
        </button>
      )}
      {team.status === "Closed" && (
        <button
          onClick={() => handleStatusChange("Open")}
          disabled={loading}
          className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
        >
          Reopen
        </button>
      )}
      {(team.status === "Open" || team.status === "Closed") && (
        <button
          onClick={() => handleStatusChange("Completed")}
          disabled={loading}
          className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
        >
          Mark Complete
        </button>
      )}
      <button
        onClick={() => handleStatusChange("Archived")}
        disabled={loading}
        className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        Archive
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
