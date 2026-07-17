import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Props {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}

export default async function TeamsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("teams")
    .select("*, profiles!teams_owner_id_fkey(username, full_name, avatar_url), team_members(count)")
    .eq("status", "Open");

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,category.ilike.%${params.search}%`
    );
  }

  switch (params.sort) {
    case "members":
      query = query.order("max_members", { ascending: false });
      break;
    case "alpha":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: teams } = await query;

  const categories = [
    "All",
    "Hackathon",
    "Capstone Project",
    "Startup",
    "Research",
    "Open Source",
    "Side Project",
    "Study Group",
    "Competition",
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Teams</h1>
            <p className="mt-1 text-gray-600">
              Find open teams looking for members like you
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form className="flex gap-3">
            <input
              name="search"
              type="text"
              defaultValue={params.search || ""}
              placeholder="Search by title, description, or category..."
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              name="sort"
              defaultValue={params.sort || "recent"}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="recent">Most Recent</option>
              <option value="members">Most Members</option>
              <option value="alpha">Alphabetical</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={
                  cat === "All"
                    ? "/teams"
                    : `/teams?category=${encodeURIComponent(cat)}`
                }
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  (cat === "All" && !params.category) ||
                  params.category === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Teams Grid */}
        {teams && teams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="group rounded-xl bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 mb-2">
                      {team.category || "General"}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                      {team.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Open
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {team.description || "No description provided."}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    by {team.profiles?.full_name || team.profiles?.username}
                  </span>
                  <span>
                    {team.team_members?.[0]?.count ?? 0}/{team.max_members} members
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <p className="text-lg text-gray-500">No teams found.</p>
            <p className="mt-2 text-sm text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
