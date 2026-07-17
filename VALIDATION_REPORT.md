# TeamUp — PRD Validation Report

**Date:** 2026-07-17  
**Reviewed By:** Kiro (automated audit)  
**Source of Truth:** `TeamUp_PRD.md` v1.2  
**Project:** `teamup-app` (Next.js 16 + Supabase)

---

## Summary

The project has a solid foundation with working authentication, team CRUD, browse/search, applications, and member management. However, several PRD requirements are missing or incomplete, and there are form validation gaps, missing UI states, and edge-case bugs that need to be addressed before the app is production-ready.

| Priority | Issues |
|----------|--------|
| **High** | 7 |
| **Medium** | 9 |
| **Low** | 6 |

---

## HIGH Priority Issues

### H1. Missing Team Edit Page
- **What:** The PRD (§5.2, §6.3) requires team owners to edit their teams. There is no `/teams/[id]/edit` route.
- **Why:** Users cannot update team details (title, description, max members, roles) after creation. The only way to manage is via status change or deletion.
- **Fix:** Create a `/teams/[id]/edit/page.tsx` with a pre-populated form matching the create form. Gate access to team owner only.

### H2. No "Cancel Application" Flow for Applicants
- **What:** PRD §5.4 states: "As an applicant, I want to cancel my own pending application." The team detail page shows pending status but has no cancel button.
- **Why:** Users are locked into pending applications with no self-service withdrawal.
- **Fix:** Add a "Cancel Application" button on the team detail page when `userApplication.status === "Pending"`. Call `supabase.from('applications').update({ status: 'Cancelled' }).eq('id', appId)`.

### H3. Missing Duplicate Application Prevention (Client-side)
- **What:** PRD §11 requires: "A user cannot submit a duplicate Pending application to the same team." The `ApplicationForm` component has no client-side check — it relies solely on DB constraints which may or may not exist.
- **Why:** If the DB constraint is missing, users can spam applications. Even with the constraint, the error message will be a raw Supabase error, not user-friendly.
- **Fix:** Before showing the form, check for an existing pending application. The team detail page already partially does this (shows pending status card), but the logic for showing the form allows re-application after rejection/cancellation. Add explicit guard and friendly error message on duplicate insert failure.

### H4. No Member-already-belongs Check Before Application
- **What:** PRD §11 states: "A user cannot apply to a team they already belong to." The team detail page hides the form if `isMember`, but does not account for edge cases (e.g., user was removed, re-applies before page re-renders).
- **Why:** Race condition could let a member submit an application to their own team.
- **Fix:** Add a server-side DB constraint (unique on team_id + user_id in team_members) and add a check in the form submission handler. Currently the UI logic is correct but fragile.

### H5. Password Validation Too Weak
- **What:** PRD §7 requires security-gated actions. The signup form requires only 6 characters (minLength={6}). The reset password page also uses minLength={6}. No strength indicator or complexity requirements.
- **Why:** Weak passwords are a security risk. No feedback to users about password quality.
- **Fix:** Add client-side password strength validation (minimum 8 chars, at least one uppercase, one number). Show a password strength indicator. Keep server-side validation as backup.

### H6. Username Uniqueness Not Validated on Signup
- **What:** PRD §10 specifies `username: text, unique` on the profiles table. The signup form collects username but does not check uniqueness before submission.
- **Why:** Users will get a raw database error if the username is taken. No pre-submission feedback.
- **Fix:** Add a debounced username availability check that queries `profiles` table for existing usernames. Show inline feedback ("Username taken" / "Available").

### H7. Missing Team Logo Upload
- **What:** PRD §6.3 specifies teams have a `logo_url` (image upload). The create team form has no logo upload field. The database types confirm `logo_url` exists but it's never populated.
- **Why:** Teams appear without logos throughout the app. Visual identity is missing for team listings.
- **Fix:** Add a logo upload field to the create team form (and future edit form). Use Supabase Storage bucket `team-logos` with path `{team.id}/logo.{ext}`.

---

## MEDIUM Priority Issues

### M1. No "Transfer Ownership" Feature
- **What:** PRD §5.5 states: "As a creator, I want to transfer ownership, so the team can continue if I step away."
- **Why:** If a team owner becomes inactive, the team is orphaned with no management.
- **Fix:** Add a "Transfer Ownership" action in `TeamActions` dropdown that updates `teams.owner_id` to a selected member.

### M2. Search Does Not Filter by Skill
- **What:** PRD §6.4 specifies search by "title, skill, category." Current search only queries title, description, and category.
- **Why:** Users cannot find teams based on required skills — a primary discovery use case.
- **Fix:** Extend the search query to join `team_roles → roles` and include role names in the search filter, or add a skills/tags field to teams.

### M3. No Loading States for Client-Side Data Fetches in Teams Browse
- **What:** The `/teams` page is a server component (good), but when navigating with search params, there is no visual loading feedback during the server re-render.
- **Why:** Users may think the page is frozen while waiting for results.
- **Fix:** Add a `loading.tsx` file in `/teams/` directory for Next.js streaming/suspense, or add a loading skeleton.

### M4. No Error State for Failed API Calls in Dashboard
- **What:** The dashboard page (`dashboard/page.tsx`) does not handle cases where Supabase queries fail (network errors, RLS denials). It only checks `if (!user)`.
- **Why:** If any query fails, the user sees empty sections with no indication something went wrong.
- **Fix:** Check `.error` on each query response. Show an error banner when data fails to load.

### M5. Avatar Upload Has No File Size Validation
- **What:** The profile page states "JPG, PNG up to 2MB" in helper text but does not actually validate file size before uploading.
- **Why:** Users can upload arbitrarily large files, potentially failing silently or consuming storage.
- **Fix:** Add `if (file.size > 2 * 1024 * 1024) { setError("File too large..."); return; }` before the upload call.

### M6. No Confirmation After Successful Team Creation
- **What:** After creating a team, the user is redirected to the team detail page. There's no toast/success message confirming creation succeeded.
- **Why:** Users may be uncertain if the action completed, especially on slow connections.
- **Fix:** Either show a success toast on the team detail page (via query param), or add a brief success state before redirect.

### M7. Forgot-Password and Reset-Password Not Protected in Middleware
- **What:** The middleware only protects `/dashboard`, `/teams/create`, and `/profile`. The `/reset-password` page is accessible without the password reset token session, meaning it could show an empty form that errors on submit.
- **Why:** Users navigating to `/reset-password` directly (without clicking the email link) will see a form that silently fails.
- **Fix:** Add a check in the reset-password page to verify the user has an active recovery session. If not, redirect to `/forgot-password` with a message.

### M8. No Notifications UI
- **What:** PRD §6.7 marks notifications as optional, but the database already has a `notifications` table defined. There's no UI to display them.
- **Why:** Accepted/rejected applicants and team owners receiving applications get no in-app feedback.
- **Fix:** (Lower priority since marked optional) Add a notifications bell icon in the Navbar with a dropdown showing unread notifications. Create notifications when applications are accepted/rejected.

### M9. Team Detail Page — No Back Navigation
- **What:** The team detail page has no "Back to teams" or breadcrumb navigation.
- **Why:** Users must use the browser back button or the nav links. Poor UX flow.
- **Fix:** Add a breadcrumb or "← Back to teams" link at the top of the team detail page.

---

## LOW Priority Issues

### L1. No `aria-live` Regions for Dynamic Updates
- **What:** Error and success messages appear dynamically but don't have `aria-live="polite"` attributes (except some with `role="alert"`).
- **Why:** Screen reader users may miss success/error feedback in some components.
- **Fix:** Ensure all dynamic feedback areas have `role="alert"` or `aria-live="polite"`.

### L2. Category Filter Doesn't Preserve Search Term
- **What:** Clicking a category pill navigates to `/teams?category=X`, dropping any active search term.
- **Why:** Users lose their search context when filtering by category.
- **Fix:** Include `search` and `sort` params in category links when they're active.

### L3. No Empty State for Roles in Create Team
- **What:** If the `roles` table is empty, the "Required Roles" section shows nothing with no explanation.
- **Why:** Users don't know if roles are loading or if none exist.
- **Fix:** Add a loading state and an empty state message ("No roles available. Contact an admin.").

### L4. Footer Shows Auth Links Regardless of Auth State
- **What:** The footer always shows "Log In" and "Sign Up" links even when the user is authenticated.
- **Why:** Minor UX inconsistency — signed-in users see irrelevant auth links.
- **Fix:** Either make the footer auth-aware (convert to client component) or keep it static with all links (acceptable tradeoff for SSR).

### L5. No `max_members` Enforcement on Accept
- **What:** When a team owner accepts an application, there is no check that the team hasn't already reached `max_members`.
- **Why:** Teams could exceed their declared capacity.
- **Fix:** Before inserting into `team_members`, check current count vs. `max_members`. Show an error if full. Ideally enforce via a Postgres function/trigger.

### L6. TeamActions Dropdown Accessibility
- **What:** The dropdown menu in `TeamActions` uses a plain `div` with no keyboard navigation, no `role="menu"`, and no escape-key handling.
- **Why:** Keyboard-only users cannot navigate the dropdown options.
- **Fix:** Add `role="menu"` to the dropdown, `role="menuitem"` to buttons, arrow-key navigation, and close on Escape.

---

## Features Correctly Implemented ✓

| Feature | Status |
|---------|--------|
| User registration (email + password) | ✅ |
| Login / Logout | ✅ |
| Forgot password / reset flow | ✅ |
| Email verification (post-signup message) | ✅ |
| Profile editing (name, username, bio, skills, social links) | ✅ |
| Avatar upload | ✅ |
| Team creation with roles | ✅ |
| Browse teams with search/filter/sort | ✅ |
| Category filtering | ✅ |
| Application submission | ✅ |
| Accept/reject applications (owner) | ✅ |
| Team status management (Open/Closed/Completed/Archived) | ✅ |
| Team deletion | ✅ |
| Member removal (owner) | ✅ |
| Leave team (member) | ✅ |
| Protected routes (middleware) | ✅ |
| Responsive design | ✅ |
| Mobile navigation | ✅ |
| Empty states for dashboard sections | ✅ |
| Auth state redirects | ✅ |
| Supabase SSR + server/client split | ✅ |

---

## Recommended Next Steps (Priority Order)

1. **H1** — Create team edit page (highest user-facing gap)
2. **H2** — Add cancel application button
3. **H5** — Strengthen password validation
4. **H6** — Username availability check on signup
5. **H7** — Add team logo upload
6. **H3** — Duplicate application prevention UX
7. **M7** — Protect reset-password page from direct access
8. **M5** — File size validation on avatar upload
9. **L5** — Enforce max_members on accept
10. **M1** — Transfer ownership feature

---

*This report was generated without making any code changes. Proceed with fixes in the recommended order.*
