import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="page-container py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold text-indigo-600">
              TeamUp
            </Link>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              Find the right people. Build better teams. A collaboration
              platform for hackathons, projects, and startups.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/teams" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Browse Teams
                </Link>
              </li>
              <li>
                <Link href="/teams/create" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Create a Team
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/teams?category=Hackathon" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/teams?category=Startup" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Startups
                </Link>
              </li>
              <li>
                <Link href="/teams?category=Open+Source" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Open Source
                </Link>
              </li>
              <li>
                <Link href="/teams?category=Research" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Research
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TeamUp. Built with Next.js &
            Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
}
