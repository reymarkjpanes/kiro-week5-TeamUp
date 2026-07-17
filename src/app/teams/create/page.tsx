"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

interface Role {
  id: string;
  name: string;
}

export default function CreateTeamPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<
    { role_id: string; slots: number }[]
  >([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    max_members: 5,
  });

  const categories = [
    "Hackathon",
    "Capstone Project",
    "Startup",
    "Research",
    "Open Source",
    "Side Project",
    "Study Group",
    "Competition",
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      const { data } = await supabase.from("roles").select("*").order("name");
      if (data) setRoles(data);
    };
    fetchRoles();
  }, [supabase]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) => {
      const exists = prev.find((r) => r.role_id === roleId);
      if (exists) {
        return prev.filter((r) => r.role_id !== roleId);
      }
      return [...prev, { role_id: roleId, slots: 1 }];
    });
  };

  const updateSlots = (roleId: string, slots: number) => {
    setSelectedRoles((prev) =>
      prev.map((r) => (r.role_id === roleId ? { ...r, slots } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create a team.");
      setLoading(false);
      return;
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        ...form,
        owner_id: user.id,
      })
      .select()
      .single();

    if (teamError) {
      setError(teamError.message);
      setLoading(false);
      return;
    }

    // Add selected roles
    if (selectedRoles.length > 0) {
      const teamRoles = selectedRoles.map((r) => ({
        team_id: team.id,
        role_id: r.role_id,
        slots: r.slots,
      }));

      const { error: rolesError } = await supabase
        .from("team_roles")
        .insert(teamRoles);

      if (rolesError) {
        setError(rolesError.message);
        setLoading(false);
        return;
      }
    }

    router.push(`/teams/${team.id}`);
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Create a New Team
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-8 border border-gray-200 shadow-sm"
        >
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Team Name *
            </label>
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. AI Health Monitor"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Describe your project, what you're building, and what kind of people you're looking for..."
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category *
            </label>
            <select
              id="category"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="max_members"
              className="block text-sm font-medium text-gray-700"
            >
              Maximum Members
            </label>
            <input
              id="max_members"
              type="number"
              min={2}
              max={50}
              value={form.max_members}
              onChange={(e) =>
                setForm({ ...form, max_members: parseInt(e.target.value) || 5 })
              }
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Roles Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Roles
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select roles you need and specify how many slots for each
            </p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const selected = selectedRoles.find(
                  (r) => r.role_id === role.id
                );
                return (
                  <div
                    key={role.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleRole(role.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          selected ? "text-indigo-700" : "text-gray-700"
                        }`}
                      >
                        {role.name}
                      </span>
                      {selected && (
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={selected.slots}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateSlots(role.id, parseInt(e.target.value) || 1)
                          }
                          className="w-12 rounded border border-indigo-300 px-1 py-0.5 text-center text-xs"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
