"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  teamId: string;
  userId: string;
}

export default function ApplicationForm({ teamId, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.from("applications").insert({
      team_id: teamId,
      user_id: userId,
      message,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">Apply to Join</h2>
      <p className="mt-1 text-sm text-gray-600">
        Tell the team owner why you&apos;d be a great addition.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && (
          <div
            className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="apply-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="apply-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder="Hi! I'd love to join your team because..."
            className="input resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn-md"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
