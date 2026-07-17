import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-24">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Find the Right People.
              <br />
              <span className="text-indigo-200">Build Better Teams.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
              TeamUp helps you create teams or join existing ones for
              hackathons, capstone projects, research initiatives, or startup
              ideas. No more scattered DMs — discover, apply, and collaborate in
              one place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg hover:bg-gray-50"
              >
                Get Started Free
              </Link>
              <Link
                href="/teams"
                className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Browse Teams
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                How TeamUp Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Three simple steps to find your next team
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Create or Discover
                </h3>
                <p className="mt-2 text-gray-600">
                  Post your team listing with roles you need, or browse open
                  teams that match your skills and interests.
                </p>
              </div>
              <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 text-xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Apply & Connect
                </h3>
                <p className="mt-2 text-gray-600">
                  Send a message to the team owner explaining why you&apos;re a
                  great fit. Review applicants and build your dream team.
                </p>
              </div>
              <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-pink-600 text-xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Collaborate
                </h3>
                <p className="mt-2 text-gray-600">
                  Once accepted, jump into your team dashboard. Track members,
                  manage roles, and build something awesome together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-gray-100 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Find Teams By Category
            </h2>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                "Hackathon",
                "Capstone Project",
                "Startup",
                "Research",
                "Open Source",
                "Side Project",
                "Study Group",
                "Competition",
              ].map((cat) => (
                <Link
                  key={cat}
                  href={`/teams?category=${encodeURIComponent(cat)}`}
                  className="rounded-lg bg-white p-4 text-center font-medium text-gray-700 shadow-sm hover:shadow-md hover:text-indigo-600 transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
