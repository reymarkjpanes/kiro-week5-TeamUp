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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStatusChange = async (
    newStatus: "Open" | "Closed" | "Completed" | "Archived"
  ) => {
    setLoading(true);
    setMenuOpen(false);
    await supabase
      .from("teams")
      .update({ status: newStatus })
      .eq("id", team.id);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This cannot be undone."
      )
    )
      return;
    setLoading(true);
    await supabase.from("teams").delete().eq("id", team.id);
    router.push("/dashboard");
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={loading}
        className="btn-secondary btn-sm"
        aria-label="Team actions"
      >
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
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
        Actions
      </button>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg py-1">
            {team.status === "Open" && (
              <button
                onClick={() => handleStatusChange("Closed")}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close Team
              </button>
            )}
            {team.status === "Closed" && (
              <button
                onClick={() => handleStatusChange("Open")}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reopen Team
              </button>
            )}
            {(team.status === "Open" || team.status === "Closed") && (
              <button
                onClick={() => handleStatusChange("Completed")}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Mark as Completed
              </button>
            )}
            <button
              onClick={() => handleStatusChange("Archived")}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Archive
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete Team
            </button>
          </div>
        </>
      )}
    </div>
  );
}
