import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}

export default async function TeamsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("teams")
    .select(
      "*, profiles!teams_owner_id_fkey(username, full_name, avatar_url), team_members(count)"
    )
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
      <main className="flex-1 page-container py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Browse Teams
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Find open teams looking for members like you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                name="search"
                type="text"
                defaultValue={params.search || ""}
                placeholder="Search teams..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                name="sort"
                defaultValue={params.sort || "recent"}
                className="input w-full sm:w-auto"
              >
                <option value="recent">Most Recent</option>
                <option value="members">Most Members</option>
                <option value="alpha">Alphabetical</option>
              </select>
              <button type="submit" className="btn-primary btn-md whitespace-nowrap">
                Search
              </button>
            </div>
          </form>

          {/* Category Pills - horizontal scroll on mobile */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={
                    cat === "All"
                      ? "/teams"
                      : `/teams?category=${encodeURIComponent(cat)}`
                  }
                  className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    (cat === "All" && !params.category) ||
                    params.category === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {teams && teams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="card-hover group p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="badge-indigo mb-2">
                      {team.category || "General"}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate sm:text-lg">
                      {team.title}
                    </h3>
                  </div>
                  <span className="badge-green flex-shrink-0">Open</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {team.description || "No description provided."}
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="truncate">
                    by{" "}
                    {team.profiles?.full_name || team.profiles?.username}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1">
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
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                    {team.team_members?.[0]?.count ?? 0}/{team.max_members}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card border-dashed p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <p className="mt-4 text-base text-gray-500">No teams found.</p>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
