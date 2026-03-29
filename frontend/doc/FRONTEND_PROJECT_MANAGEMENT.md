# Frontend — Remaining Work & Assignments

Summary
- **Scope Completed:** Backend, marketing/home page, login, signup, and user dashboard are implemented.
- **Purpose:** This doc lists remaining frontend features, groups them by category, assigns owners (Shalon, Dinil, Rukshan, Migara), gives rough estimates, and proposes a 2-sprint plan and QA checklist.

**Remaining Features**

- **Auth & Account Flows:** (Completed)
  - Status: Login, signup, token handling and core auth flows are implemented and verified. Social OAuth (Google/Facebook) is optional and can be scheduled separately if desired.
  - **Account Settings / Profile Edit:** Update avatar, bio, contact. **Owner:** Shalon. **Est:** 2d. **Priority:** High. (if not already done)

- **Investor Dashboard Enhancements:**
  - **Invest Flow UI:** Investment modal, confirmation flow, error handling. **Owner:** Shalon. **Est:** 4d. **Priority:** High.
  - **Transaction History / Pagination:** Wallet transactions, filters, export. **Owner:** Shalon. **Est:** 3d. **Priority:** High.
  - **Portfolio / Holdings View:** Visual summary and charts. **Owner:** Dinil. **Est:** 4d. **Priority:** Medium.

- **Startup Listings & Profiles:**
  - **Startup Directory / Search & Filters:** Keyword search, tag filters, sorting. **Owner:** Dinil. **Est:** 4d. **Priority:** High.
  - **Startup Detail Page:** Team, traction, attachments, pitch deck viewer. **Owner:** Dinil. **Est:** 3d. **Priority:** High.

- **Mentor Hub:**
  - **Mentor Directory / Search & Filters:** Browse mentors by expertise, availability, and rating. **Owner:** Rukshan. **Est:** 4d. **Priority:** High.
  - **Mentor Profile Page:** Bio, areas of expertise, session types, reviews. **Owner:** Rukshan. **Est:** 3d. **Priority:** High.
  - **Booking / Scheduling UI:** Book sessions, calendar integration, confirmations. **Owner:** Rukshan. **Est:** 4d. **Priority:** High.
  - **Event Creation & Management:** Create mentor events (webinars, workshops), display on mentor hub. **Owner:** Rukshan. **Est:** 3d. **Priority:** High. **Status:** UI wired to real endpoints.
  - **Mentor Dashboard / Notes:** Session management, notes, and status. **Owner:** Rukshan. **Est:** 3d. **Priority:** Medium.

- **Messaging & Notifications:**
  - **In-app Messaging UI:** Conversation list, message composer, attachments. **Owner:** Rukshan. **Est:** 5d. **Priority:** Medium.
  - **Notifications Center:** Real-time toast + notification page, mark read/unread. **Owner:** Rukshan. **Est:** 3d. **Priority:** Medium.

- **Payments & Wallet Integration:**
  - **Top-up / Payment Flow UI:** Integrate PayHere popup flow, UX for failures. **Owner:** Shalon. **Est:** 3d. **Priority:** High. **Status:** Implemented (sandbox popup, failure handling, status polling).
  - **Withdraw / Refund UI:** Request withdraw flow + validations. **Owner:** Migara. **Est:** 3d. **Priority:** Medium.

- **Admin / Moderation UI:**
  - **Admin Dashboard:** User management, content moderation, reports. **Owner:** Migara. **Est:** 5d. **Priority:** Medium.
  - **Evaluation Review Pages:** View and act on AI evaluations. **Owner:** Rukshan. **Est:** 3d. **Priority:** Low.

- **UX, Accessibility & Responsiveness:**
  - **Responsive fixes across pages:** mobile/tablet adjustments. **Owner:** Dinil. **Est:** 3d. **Priority:** High.
  - **WCAG / Keyboard navigation & ARIA:** baseline accessibility fixes. **Owner:** Migara. **Est:** 2d. **Priority:** Medium.

- **Testing & CI:**
  - **Unit tests for core components:** auth, dashboard widgets. **Owner:** Shalon. **Est:** 3d. **Priority:** Medium.
  - **End-to-end tests (critical flows):** login, invest, payment. **Owner:** Rukshan. **Est:** 4d. **Priority:** High.

**Sprint Plan (suggested)**

- **Sprint 1 (2 weeks): Focus on core flows & stability**
  - Shalon: Account settings, Invest Flow UI, Transaction History (8d)
  - Dinil: Startup Directory + Startup Detail responsiveness (7d)
  - Rukshan: Notifications Center + start E2E scaffolding (6d)
  - Migara: Admin MVP routes + OAuth scaffolding (7d)

- **Sprint 2 (2 weeks): Feature polish & testing**
  - Shalon: Payments top-up + unit tests (6d)
  - Dinil: Responsive polish + Portfolio view + bug fixes (6d)
  - Rukshan: Messaging UI + Mentor Hub (directory, booking, events) + finish E2E tests (10d)
  - Migara: Accessibility, withdraw UI, Admin polish (6d)

Estimates assume focused work and small bugfix overhead; adjust per team velocity.

**Task Breakdown & Acceptance Criteria**

- For each feature deliverable include:
  - **UI Implementation:** matches design / responsive.
  - **API Integration:** calls existing backend endpoints; handle errors and loading states.
  - **Tests:** unit tests for critical logic + basic E2E for flow.
  - **Docs:** brief README note for any new env vars or setup steps.

**QA Checklist (per feature)**
- Works on desktop, tablet, mobile.
- Handles API failures gracefully with user-facing messages.
- No console errors in production build.
- Accessibility: focus order, aria-labels for controls.
- Cross-origin flows (payments/auth) tested on deployed staging.

**Deployment / Env Notes**
- `VITE_API_BASE` should point to the deployed backend for staging testing.
- Confirm CORS and cookie settings when testing local frontend vs deployed backend.

**Communication & Handover**
- Add short PR descriptions explaining changes and relevant env settings.
- Link designs and mockups in PRs where applicable.
- Payment setup reference: see `frontend/doc/PAYHERE_WALLET_SETUP.md` for sandbox credentials, env vars, webhook URL, and test checklist.
- Use this doc as the source of truth and update it after each sprint planning meeting.

**Ownership Summary**
- **Shalon (you):** Invest flow, account settings, wallet/transactions, unit tests.
- **Dinil:** Startup directory, startup detail, responsive polish, portfolio view.
- **Rukshan:** Messaging, notifications, Mentor Hub (directory, booking, events, dashboard), E2E tests, evaluation review pages.
- **Migara:** Admin interfaces, OAuth/social login, accessibility and withdraw UI.

--
Generated by project manager assistant to guide the remaining frontend work. Update assignments and estimates as team discusses.
