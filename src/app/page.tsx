import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="relative page-container py-16 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Find the Right People.
                <br />
                <span className="text-indigo-200">Build Better Teams.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100 sm:mt-6 sm:text-lg lg:text-xl">
                Create teams or join existing ones for hackathons, capstone
                projects, research, or startup ideas. No more scattered DMs.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/signup"
                  className="btn-lg w-full rounded-xl bg-white px-8 font-semibold text-indigo-600 shadow-lg hover:bg-gray-50 sm:w-auto"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/teams"
                  className="btn-lg w-full rounded-xl border-2 border-white/30 bg-white/10 px-8 font-semibold text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                >
                  Browse Teams
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-spacing">
          <div className="page-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                How TeamUp Works
              </h2>
              <p className="mt-3 text-gray-600 sm:text-lg">
                Three simple steps to find your next team
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  step: "1",
                  title: "Create or Discover",
                  desc: "Post your team listing with roles you need, or browse open teams that match your skills and interests.",
                  color: "bg-indigo-100 text-indigo-600",
                },
                {
                  step: "2",
                  title: "Apply & Connect",
                  desc: "Send a message to the team owner explaining why you're a great fit. Review applicants and build your dream team.",
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  step: "3",
                  title: "Collaborate",
                  desc: "Once accepted, jump into your team dashboard. Track members, manage roles, and build something awesome together.",
                  color: "bg-pink-100 text-pink-600",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="card p-6 sm:p-8"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold ${item.color}`}
                  >
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="section-spacing bg-gray-100/70">
          <div className="page-container">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Find Teams By Category
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
              {[
                { name: "Hackathon", icon: "🏆" },
                { name: "Capstone Project", icon: "🎓" },
                { name: "Startup", icon: "🚀" },
                { name: "Research", icon: "🔬" },
                { name: "Open Source", icon: "💻" },
                { name: "Side Project", icon: "🛠️" },
                { name: "Study Group", icon: "📚" },
                { name: "Competition", icon: "⚡" },
              ].map((cat) => (
                <Link
                  key={cat.name}
                  href={`/teams?category=${encodeURIComponent(cat.name)}`}
                  className="card-hover flex flex-col items-center gap-2 p-4 text-center sm:p-6"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-spacing">
          <div className="page-container">
            <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-12 text-center sm:px-12 sm:py-16">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />
              <div className="relative">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Ready to find your team?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-indigo-100">
                  Join hundreds of students and developers building projects
                  together.
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex btn-lg rounded-xl bg-white px-8 font-semibold text-indigo-600 shadow-lg hover:bg-gray-50"
                >
                  Create Your Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
