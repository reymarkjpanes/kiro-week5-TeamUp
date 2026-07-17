"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      if (exists) return prev.filter((r) => r.role_id !== roleId);
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

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ ...form, owner_id: user.id })
      .select()
      .single();

    if (teamError) {
      setError(teamError.message);
      setLoading(false);
      return;
    }

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
      <main className="flex-1 page-container-narrow py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Create a New Team
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Fill in the details to publish your team listing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-8 space-y-6">
          {error && (
            <div
              className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="input-label">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="e.g. AI Health Monitor"
            />
          </div>

          <div>
            <label htmlFor="description" className="input-label">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input resize-none"
              placeholder="Describe your project, what you're building, and what kind of people you're looking for..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="input-label">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="input"
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
              <label htmlFor="max_members" className="input-label">
                Maximum Members
              </label>
              <input
                id="max_members"
                type="number"
                min={2}
                max={50}
                value={form.max_members}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_members: parseInt(e.target.value) || 5,
                  })
                }
                className="input"
              />
            </div>
          </div>

          {/* Roles Selection */}
          <div>
            <label className="input-label">Required Roles</label>
            <p className="text-xs text-gray-500 mb-3">
              Select roles you need and specify how many slots for each
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {roles.map((role) => {
                const selected = selectedRoles.find(
                  (r) => r.role_id === role.id
                );
                return (
                  <button
                    type="button"
                    key={role.id}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                            updateSlots(
                              role.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-14 rounded-md border border-indigo-300 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          aria-label={`Slots for ${role.name}`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-100 sm:flex-row">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary btn-md sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-md flex-1 sm:flex-none"
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
