"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/lib/database.types";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError("");
    setSuccess("");
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        skills: profile.skills,
        location: profile.location,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        portfolio_url: profile.portfolio_url,
      })
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (skillInput.trim() && profile) {
      const skills = [...(profile.skills || []), skillInput.trim()];
      setProfile({ ...profile, skills });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    if (profile) {
      const skills = (profile.skills || []).filter((_, i) => i !== index);
      setProfile({ ...profile, skills });
    }
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${profile.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    setProfile({ ...profile, avatar_url: publicUrl });
    setSuccess("Avatar updated!");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
            <p className="mt-3 text-sm text-gray-500">Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (!profile) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 page-container-narrow py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your personal information and social links
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
          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* Avatar */}
          <div>
            <label className="input-label">Avatar</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile.full_name || profile.username)
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div>
                <label
                  htmlFor="avatar-upload"
                  className="btn-secondary btn-sm cursor-pointer"
                >
                  Change photo
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="sr-only"
                />
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="input-label">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="input-label">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={profile.bio || ""}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
              className="input resize-none"
              placeholder="Tell others about yourself..."
            />
          </div>

          <div>
            <label htmlFor="location" className="input-label">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={profile.location || ""}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              className="input"
              placeholder="City, Country"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="input-label">Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-secondary btn-md flex-shrink-0"
              >
                Add
              </button>
            </div>
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 pl-3 pr-1.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(i)}
                      className="rounded-full p-0.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-900">
              Social Links
            </h3>
            <div>
              <label htmlFor="github_url" className="input-label">
                GitHub
              </label>
              <input
                id="github_url"
                type="url"
                value={profile.github_url || ""}
                onChange={(e) =>
                  setProfile({ ...profile, github_url: e.target.value })
                }
                className="input"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label htmlFor="linkedin_url" className="input-label">
                LinkedIn
              </label>
              <input
                id="linkedin_url"
                type="url"
                value={profile.linkedin_url || ""}
                onChange={(e) =>
                  setProfile({ ...profile, linkedin_url: e.target.value })
                }
                className="input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label htmlFor="portfolio_url" className="input-label">
                Portfolio
              </label>
              <input
                id="portfolio_url"
                type="url"
                value={profile.portfolio_url || ""}
                onChange={(e) =>
                  setProfile({ ...profile, portfolio_url: e.target.value })
                }
                className="input"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary btn-md w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
