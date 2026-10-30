# GreenFleet — Frontend

## v2 changes (contract alignment pass)

This pass cross-checked every page against `API_CONTRACT.md`, `DATABASE_DESIGN.md`,
`BUSINESS_WORKFLOW.md` and the Frontend↔Backend Integration Contract, and fixed the
following so backend integration should be a drop-in swap in `src/data/api.js`:

- **Wrong endpoint paths fixed** — approve/reject were pointed at `/api/requests/:id/approve`
  and `/api/requests/:id/reject`; the contract actually defines
  `PATCH /api/admin/request/{id}/approve` and `PATCH /api/admin/request/{id}/reject`
  (singular "request", under `/admin`). Corrected in `api.js`.
- **Missing `POST /api/login` and `POST /api/logout`** — added to `api.js` with the exact
  request/response shape from the contract. (Note: `AuthContext.jsx` still uses a demo
  role-picker rather than calling these yet — see "Wiring up the real backend" below.)
- **snake_case ↔ camelCase field mapping added** — the contract's request/response bodies
  use `current_location`, `departure_time`, `driver_status`, `trip_id`, `category`,
  `description`, etc. The frontend's internal state uses camelCase. `api.js` now does this
  translation in one place (`toRequestPayload`, `fromRequestResponse`, and inline mapping in
  `confirmArrival`/`createComplaint`) so no page component needs to know about the wire format.
- **Two flows that silently weren't calling any API** — `RequestReview.jsx` (approve/reject)
  and `RequestDetails.jsx` (arrival confirmation, complaint submission) previously just
  updated local state and showed a toast. They now call `approveRequest`/`rejectRequest`/
  `confirmArrival`/`createComplaint` from `api.js`, with basic error handling.
- **Ride completion now sends `branch_id`, not a branch name** — `RideCompletionModal.jsx`
  was submitting the branch's display name; it now submits the branch `id`, matching the
  contract's `branch_id` field.
- **Endpoints flagged that aren't in the contract yet** — the whole "System" portal (Users,
  Settings, Email Templates, Roles & Permissions, Audit Logs, Analytics) plus the standalone
  Branches and Complaints-list views call endpoints that don't appear in any of the four
  contract documents. These are marked `PROPOSED` in `api.js` — flag them to your backend
  partner before she builds against them, per the Development Agreement's change-control rule.
- **Rebranded** from "Fleet Request" / "Prime Trust Bank" placeholders to **GreenFleet** /
  **Greenwich Merchant Bank** throughout (sidebar, login screen, email templates, settings,
  page title, package name).

---

A React + Vite + Tailwind implementation of the GreenFleet design spec: three portals
(Staff, Transport Admin, System Admin) sharing one design system and one mock data layer.
No backend is wired up — every network call is mocked so the whole app runs standalone,
with clearly marked hooks for the real API.

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL. You'll land on `/login`. There's a demo-only
**"log in as"** role picker on the login screen (not part of the spec) — pick any role to
jump straight into that portal. Remove that dropdown once real auth exists (see below).

## Project structure

```
src/
  components/       Shared design-system components (Button, Table, Modal, TripTimeline...)
  context/          AuthContext (session/role), ToastContext (toast notifications)
  data/
    mockData.js     All fake data — single source of truth for the mocks
    api.js          Thin async wrapper around mockData.js. PAGES IMPORT FROM HERE.
  lib/
    nav.js          Sidebar nav items per portal
  pages/
    staff/          Staff Portal (spec section 2)
    transport/       Transport Admin Portal (spec section 3)
    system/          System Admin Portal (spec section 4)
```

## Wiring up the real backend

Every data call in the app goes through `src/data/api.js`, never directly through
`mockData.js`. Each function in that file has a `// TODO(backend): ...` comment with the
suggested REST call. To connect a real backend, you should only need to edit that one
file — swap the mock implementation for a `fetch`/`axios` call with the same return shape.
Pages themselves don't know or care that the data is fake.

A few other integration points worth knowing about:

- **`src/context/AuthContext.jsx`** — currently a fake session with a `login(role)`
  function. Replace with real JWT/session handling. `portal` (`'staff' | 'transport' |
  'system'`) drives which sidebar/routes render; a Super Admin can switch between all
  three from the topbar user menu.
- **`src/components/ProtectedRoute.jsx`** — gates each portal's routes by role at the
  router level (typing the URL directly doesn't bypass it). Update the redirect logic
  once you have real role data from the backend.
- **Login demo picker** (`src/pages/Login.jsx`) — the "Demo: log in as" field is scaffolding
  I added so every portal is reachable without a backend. It's clearly commented; delete
  the `<Field>` block and the `role` state once real auth returns a role.

## Decisions I made that weren't fully specified

I flagged these inline in code comments too, but calling them out here:

1. **Audit Log (3.14) + Activity Logs (4.5) merged into one page** —
   `src/pages/system/AuditLogs.jsx`. The two spec pages had near-identical columns
   (timestamp / user / action / status) with only the target portal differing. I merged
   them into one table with a Type filter (Requests / System / Auth) instead of building
   two nearly-duplicate tables. If you'd rather they be two distinct routes with different
   access scopes, that's a quick split — see the comment at the top of that file.
2. **"All" time filter added to My Requests** — the spec's filters were Today/This
   Week/This Month; I added an "All" option as a sane default landing view. Easy to
   remove in `src/pages/staff/MyRequests.jsx`.
3. **Priority pill colors** — the spec didn't define a color mapping for Low/Normal/High
   priority tags, so I mapped High→red, Normal→amber, Low→gray for quick scannability.
   Adjust in `src/pages/transport/Requests.jsx` / `RequestReview.jsx` if you want
   something else.
4. **Maintenance history on Vehicle Details** — the spec calls for a maintenance history
   table but doesn't define its data shape anywhere else, so I stubbed two sample rows
   inline in `VehicleDetails.jsx` rather than adding it to the shared mock data file.
   Move it to `mockData.js` once there's a real maintenance-log endpoint.
5. **Live "Active Trips" updates** — spec says this view should update live. There's no
   websocket/polling backend to connect to yet, so I left a placeholder `setInterval` tick
   with a TODO comment rather than faking data changes every minute, which could be
   confusing in a demo.

## Design system

Tailwind config (`tailwind.config.js`) encodes the palette, type scale, and radii from the
spec as reusable tokens (`bg-brand-green`, `text-ink-600`, `rounded-card`, etc.) — use
those tokens rather than one-off hex values when extending the UI, so a future rebrand is
a config change, not a find-and-replace.

The Trip Timeline stepper (`src/components/TripTimeline.jsx`) is the one component reused
across the most pages (Request Details, Active Trips row expansion, Ride Completion modal)
— worth knowing about before building anything else that shows trip progress.
