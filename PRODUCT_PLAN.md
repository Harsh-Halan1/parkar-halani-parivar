# Parkar Halani Parivar — Product, Architecture, and Delivery Plan

**Document version:** 2.0  
**Last updated:** 15 November 2026  
**Status:** Consolidated planning baseline; implementation has not been authorized by this document alone.  
**Purpose:** Preserve the product requirements and architectural decisions agreed during planning, distinguish confirmed decisions from provisional choices, and provide an implementation roadmap.

> **Decision-status legend**
>
> - **Confirmed:** Explicitly selected or accepted during planning.
> - **Preferred / conditional:** The current recommendation, subject to a stated proof of concept or final validation.
> - **Proposed:** A recommended implementation detail that has not been explicitly ratified.
> - **Open:** Requires a future decision, product clarification, or implementation evidence.
> - **Deferred:** Intentionally excluded from the first release or foreseeable roadmap.

---

## 1. Executive summary

Parkar Halani Parivar is a Gujarati-first digital community directory and administration website for the Parkar Halani community (also referred to as the Halani family). It replaces a physical family book that is difficult to keep updated and redistributed.

The first release is a responsive website for approximately 500 current community members, designed to accommodate around 1,000 people. Expected traffic and compute requirements are modest. The harder problems are data integrity, privacy, authorization, household history, reviewed member changes, duplicate-safe spreadsheet operations, auditability, and reliable recovery.

Visitors can browse approved public information without signing in. Email-verified accounts can sign in, but restricted information and member-change capabilities depend on a separate community-verification decision. A verified account may remain unlinked from a directory member. Authentication identity, community account, and member record are distinct concepts.

### 1.1 Current architectural direction

| Layer | Current decision | Status |
|---|---|---|
| Frontend | React + Vite | Confirmed |
| Backend | NestJS | Confirmed |
| Application architecture | Modular monolith | Confirmed |
| Database | Neon PostgreSQL | Confirmed |
| Database access | Drizzle ORM + Drizzle Kit | Confirmed |
| PostgreSQL driver | `pg` / node-postgres | Selected direction; pin exact version during implementation |
| Runtime DB connection | Neon pooled connection | Confirmed direction |
| Migration/maintenance DB connection | Neon direct connection | Confirmed direction |
| Request validation/contracts | Zod 4 in shared `packages/contracts` package | Confirmed |
| API style | REST, URL prefix `/api/v1` | Confirmed |
| API documentation | NestJS Swagger / OpenAPI | Confirmed |
| Production API docs | No Swagger UI or OpenAPI HTTP endpoint registered in production | Confirmed |
| Authentication | Better Auth | Preferred, conditional on a successful proof of concept |
| Authentication fallback | Firebase Authentication | Fallback if Better Auth integration or operational fit fails validation |
| Transactional email | Resend | Preferred/selected sender, subject to domain setup and PoC; Brevo was considered as a possible later alternative/failover but is not selected for launch |
| Frontend hosting | Cloudflare Pages Free initially | Confirmed direction |
| Backend hosting | Render Free for development/pilot; Render Starter before production use of sensitive family records | Confirmed direction |
| Database hosting | Neon Free initially; review plan before production | Confirmed direction |
| Original media storage | Cloudflare R2 | Confirmed direction |
| Image transformations | Cloudflare Images Free initially | Confirmed direction |
| Off-provider backup | Backblaze B2 | Confirmed direction |
| Source control | GitHub Free, private repository | Confirmed |
| Repository structure | Single monorepo | Confirmed |
| Domain | `halani.in`, GoDaddy registrar, Cloudflare authoritative DNS | Preferred direction; registration/purchase still to be verified |

### 1.2 Immediate next task

Build an isolated **Better Auth proof of concept** using the intended NestJS, Drizzle, Neon, and Resend stack. Do not freeze the authentication-related production schema or begin full authentication implementation until the PoC passes its acceptance criteria in Section 18.

---

## 2. Product purpose, audience, and scale

### 2.1 Purpose

Create one maintained digital space for the Parkar Halani community to browse household and member information and community announcements. The platform replaces a physical family book that is difficult to keep current and redistribute.

### 2.2 Intended users

- Community visitors who browse public announcements, households, and member directory information.
- People who register an account and verify control of their email address.
- Community-verified accounts, whether or not linked to a directory member.
- Verified accounts linked to a member record.
- Moderators who handle routine account reviews and community-record administration.
- Administrators who have full moderation capabilities, including review of previously rejected accounts.

### 2.3 Workload assumptions

These are planning estimates, not load-test results or service guarantees:

- Current community size: approximately 500 people.
- Design capacity: approximately 1,000 people.
- Expected peak concurrency: approximately 10 simultaneous users as an initial sizing assumption.
- Browsing estimate discussed: each member may visit roughly once or twice per month, implying approximately 1,000–2,000 member visits per month at 1,000 members if that estimate holds.
- Household moves and household-head changes are expected to be rare, approximately 1–4 per year. Their importance is correctness and auditability, not compute volume.
- Imports/exports may cause occasional processing bursts.
- Photo delivery and the initial registration wave are more relevant to capacity and bandwidth than rare household transfers.

The application should be designed for modest compute and traffic, with high care around data integrity, privacy, and recovery. Do not introduce infrastructure for hypothetical scale without measured need.

---

## 3. Product principles and confirmed business rules

1. Gujarati is the primary language. The interface supports Gujarati, Hindi, and English, with Gujarati as the default.
2. Member names are stored and displayed in Gujarati in every interface language.
3. Announcement content is entered in Gujarati.
4. Public directory, household, and announcement pages can be browsed without signing in, subject to the field-visibility rules in this plan.
5. Public directory and household pages should be excluded from search-engine indexing. No-index directives are not access control; restricted fields must still be protected by the backend.
6. Children follow the same public-field visibility rules as adults in the first release.
7. A directory member does not need an account. An account does not automatically represent a directory member.
8. Email verification, community verification, and member linkage are separate states/relationships.
9. An account can be community-verified without being linked to a member record. Linking may happen later.
10. A person has at most one current household. Prior household assignments remain in history for admin/moderator use.
11. Kinship links (parent, child, spouse, sibling, etc.) are separate from household membership and are deferred until a family-tree feature is approved.
12. Admins and moderators make household-head decisions. The system does not select a head automatically.
13. Admins and moderators review member requests and administer members, households, and announcements.
14. Members can see their own request status. Dashboard notifications are sufficient for the first release; general email/SMS/push notifications are not required for first release.
15. Imports never silently overwrite or merge records. Suspected duplicates are presented for human review.
16. Household and member IDs are stable identifiers and are included in exports for safe updates and cross-template references.
17. Blank spreadsheet cells preserve existing values on update. Clearing a value requires an explicit clear instruction.
18. Moderation audit history is required.
19. The first release uses email/password authentication. Google sign-in is a future addition, not first-release scope. Phone-code/OTP sign-in is not planned in the foreseeable roadmap. Apple sign-in is not planned for the near future and may be reconsidered only if a future requirement emerges.
20. Only a member's Gujarati name, full date of birth, and current household are required at entry. Other profile details may be unknown and filled later.

---

## 4. Accounts, authentication, verification, and roles

### 4.1 Three separate concepts

These concepts must never be conflated:

1. **Authentication identity:** proves who is signing in (for example, a Better Auth user).
2. **Community account:** stores application-specific status, role, language preference, and other community-account state.
3. **Member record:** represents a person in the family directory.

A community account may be unlinked from a member record. A member record may exist without any account. Do not use an email address as the permanent identity key for a member or community account.

The community account must have its own stable application identifier independent of Better Auth's internal user ID or a future provider's UID. Authentication-provider IDs should be stored as identity mappings, not used as the permanent key for family records.

### 4.2 First-release authentication

- Email/password registration and login.
- Email confirmation required before the account can sign in to the application.
- Password-reset flow.
- Logout and server-side session validation/revocation.
- Resend is the planned primary transactional email sender for authentication emails. Brevo was considered as a possible later alternative/failover, but a second sender is not selected for launch.
- Gujarati is the default authentication-email language; Hindi and English templates are also required.
- Do not implement phone OTP or phone-number login in the first release.
- Do not implement Google sign-in in the first release; preserve a clean path for adding it later.
- Apple sign-in is not in the near-term roadmap.

### 4.3 Authentication-provider selection

**Preferred candidate: Better Auth, conditional on a successful proof of concept.**

Reasons for preferring Better Auth:

- It can store identity, credential, and session records in our PostgreSQL database through its Drizzle adapter.
- It aligns with the selected NestJS + Drizzle + Neon architecture.
- Resend can be used for custom, multilingual verification and password-reset emails.
- Authentication data can be included in the same encrypted off-provider database backup as application data.
- It avoids making a separate managed identity platform the authoritative store for user identities.

**Fallback: Firebase Authentication.**

Firebase remains a valid fallback if Better Auth's NestJS integration proves brittle, its operational requirements are not acceptable, or the PoC identifies an unacceptable security/reliability issue. Firebase would keep identity records external and require a reliable mapping to local community accounts, separate identity-recovery procedures, and explicit lifecycle reconciliation.

Do not describe Better Auth as production-approved until the PoC passes. Do not switch to Firebase merely because of a minor configuration problem; evaluate whether the problem can be solved and maintained cleanly.

### 4.4 Better Auth proof-of-concept requirements

The immediate next implementation task is an isolated spike using the intended stack. It should validate:

1. Better Auth routes work inside the selected NestJS HTTP adapter without breaking normal NestJS JSON endpoints or Zod validation.
2. The integration handles body parsing, route mounting, cookies, headers, and errors correctly. Evaluate Better Auth's underlying Node/Express handler first; evaluate a community NestJS wrapper only if useful and actively maintained.
3. Better Auth's Drizzle schema can be generated, reviewed, migrated, and operated alongside application tables on a Neon development branch.
4. Runtime pooled database connectivity and direct migration connectivity work as intended.
5. Registration, email verification, login, logout, password reset, and session revocation work end to end.
6. A NestJS guard can validate the session and attach the authenticated principal to the request.
7. Unverified users cannot use protected application endpoints.
8. Resend sends Gujarati, Hindi, and English authentication email templates correctly.
9. Cookie security, exact-origin credentialed CORS, trusted origins, and CSRF protections work between the planned frontend and API hostnames.
10. Implicit account linking can be disabled, and matching email addresses do not silently merge identities.
11. Authentication tables can be restored from an encrypted database backup; restored sessions are invalidated before service is returned to users.
12. Dependency compatibility, release stability, security advisories, and maintenance ownership are acceptable.

Use a separate Neon development branch and non-production credentials. Do not use production member data. Keep the PoC isolated from the production application until it passes.

### 4.5 Account verification workflow

1. Account creation places the community account in a pending-review queue.
2. The account holder confirms control of their email address before sign-in is enabled.
3. Once email is confirmed, the user may sign in even while community verification is pending.
4. An admin or moderator separately verifies or rejects community membership.
5. A rejected account remains active but community-unverified. It can browse public pages but cannot see restricted fields or submit member-change requests.
6. Rejected cases leave the moderator's pending queue and appear in an admin-only rejected list.
7. Admins can later verify a previously rejected account. Moderators cannot verify a previously rejected case.
8. An account may be community-verified without being linked to a member.
9. Admins/moderators can link a verified account to an existing member at any point, or leave it unlinked.

An account holder may request closure of their community account. A valid authenticated request must be completed; Admin processes the request but cannot deny it. On submission, disable sign-in and revoke active sessions immediately, then place the closure in the admin queue. After processing, permanently remove the authentication identity and provider mapping, unlink the account from any member record, and preserve the separate member record and household history. Retain an opaque local community-account ID as a closed-account tombstone so minimal closure/audit history can remain attributable without retaining login credentials or unnecessary account details.

**Important:** authentication proves control of a login identity; it does not establish family/community membership or member-record ownership.

### 4.6 Roles and access states

| Role/state | Public pages | Restricted member details | Requests and administration |
|---|---|---|---|
| Visitor | Browse announcements, households, and public member fields | No | No member-change requests |
| Email-unconfirmed account | Public pages remain available without login; account sign-in is not enabled | No | No |
| Email-confirmed, community-unverified account | Public browsing | No | Cannot submit member-change requests |
| Verified account, not linked to a member | Public browsing | Yes | Can request linkage to an existing member; no household-based requests |
| Verified account linked to a member | Public browsing | Yes | Can request corrections for self/current household members, household moves, and household additions |
| Moderator | All public and restricted information; operational dashboard | Yes | Can review pending account registrations, manage members/households/announcements, and review member requests |
| Admin | Full access | Yes | All moderator permissions; can review rejected cases and verify them later |

Both admins and moderators can approve or reject **pending** registrations. Only admins can later verify a previously rejected account.

Only admins may grant or revoke moderator/admin roles, change role assignments or permissions, or manage administrator accounts. Moderators may perform routine operational account, member, household, request, announcement, import/export, and media work within the approved permission matrix, but cannot manage roles or permissions.

### 4.7 Future social login and account linking

- Google sign-in is planned as a possible later release.
- Apple sign-in is not planned in the near future; reassess only if a concrete requirement arises.
- Phone-number login/OTP is not planned in the foreseeable roadmap. A member's mobile number remains a profile/contact field, not an authentication credential.
- Multiple login methods for one authentication identity are optional. Users are not required to connect Google if they prefer email/password.
- If Google is added, a signed-in user must explicitly initiate linking from account settings and complete Google authentication.
- Do not automatically merge or link accounts solely because email addresses match.
- If a social identity is already linked to another authentication identity, reject the linking operation and use an explicit account-recovery process.
- Do not allow a user to disconnect their last usable authentication method.
- Re-authentication should be required for sensitive operations such as linking/unlinking providers, changing email, and account deletion.
- Use stable provider subject/identity identifiers rather than email addresses to recognize social identities.
- A verified identity-provider email may be considered for satisfying email-verification requirements only after the provider's verification claim and the Better Auth flow are validated. This policy remains an implementation detail to confirm. Community approval remains a separate mandatory state.

For Better Auth, the intended policy is to enable explicit account linking while disabling implicit linking. Confirm the exact configuration and behaviour against the stable version used in the PoC.

### 4.8 Authentication security and session policy

The following are required design constraints; exact durations and thresholds remain to be finalized:

- Use secure, HTTP-only cookies for browser sessions; do not store session tokens in `localStorage`.
- In production, use `Secure` cookies and an appropriate `SameSite` policy.
- Prefer a host-only session cookie on the API hostname rather than a cookie shared across all `halani.in` subdomains.
- Configure credentialed CORS for the exact frontend origin, not a wildcard.
- Configure trusted origins and CSRF protections for state-changing cookie-authenticated requests.
- Support logout and session revocation, including an administrative response to compromised accounts.
- Do not enable session caching initially if it weakens the immediacy of session revocation; revisit only after measurement.
- Rate-limit registration, login, verification resend, and password-reset endpoints.
- Avoid responses that disclose whether an account/email exists where that would enable account enumeration.
- Keep authentication secrets and provider credentials server-side.
- Use separate credentials and provider projects/configuration for development, staging, and production.
- Monitor security advisories and upgrade to patched stable releases. Pin versions and review release notes; do not automatically adopt prereleases for production.
- The primary maintainer has agreed to own authentication maintenance: advisory review, dependency updates, configuration, incident investigation, and recovery testing. This is not a 24/7 on-call commitment.

---

## 5. Member and household information

### 5.1 Member record

The initial member profile includes:

- Full name in Gujarati.
- Full date of birth; age is calculated from the date and is not stored separately.
- Gender: Male, Female, Others, Prefer not to say.
- Profile photo.
- Occupation: broad category plus optional free-text detail.
- Marital status: Married, Single, Divorced, Widowed.
- Current household.
- Public city/district location for directory discovery.
- Deceased status and date of death, when applicable.
- Mobile number and email.
- Blood group: A+, A−, B+, B−, AB+, AB−, O+, O−.
- Address, normally inherited from the household; an optional member-specific address can be entered when it differs.

At entry, only Gujarati name, full date of birth, and current household are mandatory. Other profile fields may be unknown and filled later. Blank optional details are valid for new spreadsheet-import records.

### 5.2 Address structure

Address fields are structured as address line, city, district, state, and postal code. The first release assumes India-only addresses, so country is not a field in the initial model.

The public city/district location is a separate coarse location field. It is not a partial disclosure of the restricted postal address.

### 5.3 Field visibility

| Public without sign-in | Verified accounts, moderators, and admins |
|---|---|
| Gujarati name, profile photo, gender, full date of birth and calculated age, occupation, marital status, public city/district, current household listing, deceased status/date when the deceased filter is used | Mobile number, email, full address, blood group |

Children follow the same visibility rules as adults in the first release. This policy should be reviewed with the community before launch because full date of birth is public under the current product decision.

The household directory shows current members and the current head. Deceased people are omitted from normal Families and Members views. They appear in Members when the deceased filter is enabled. Their data is retained. Past household assignments and household history are admin/moderator-only.

Public pages should emit no-index directives and should not publish a sitemap that advertises individual personal profiles. These measures reduce indexing but are not security controls. The API must enforce all field-visibility rules independently of the UI.

### 5.4 Occupation approach

Occupation has too many specialties for one exhaustive dropdown. Store a broad category for filtering plus optional free-text occupation/specialty (for example, Healthcare + Cardiologist, or Engineering/Technology + Civil Engineer).

A starter category list could include Business, Engineering/Technology, Healthcare, Education, Student, Retired, Homemaker, Not currently working, Other, and Not specified. Exact category names and allowed values remain open for review against real records before data entry.

### 5.5 Household rules

- A household represents people living in one house/household, not a branch in a genealogy tree.
- Each person has at most one current household assignment.
- Previous assignments are retained with history; they do not cause a person to appear in multiple current households.
- Household identity is stable and is displayed using its current head's name. A head change does not change the household ID or erase history.
- Admins/moderators choose the household head, even when an eldest son is present. The system does not infer the head.
- When a head dies, the person is retained in the records, removed from normal current listings, and appears under the Members deceased filter. Admins/moderators choose a replacement head.
- When a head moves, they may be assigned to an existing or newly created household. Other household members may move with them.
- Head changes and unresolved vacancies appear in the admin/moderator dashboard.
- A household move or head change must preserve prior assignment/history and be applied transactionally.
- On a member's death, end their current household assignment effective on the date of death. Retain the member record and closed household-history entry.
- If a household has no living current members, archive it from the current Families directory while retaining its stable record and history.

The archive state should be reversible by an admin/moderator if that household is legitimately used again; the precise reactivation workflow can be finalized during schema design.

---

## 6. Pages and capabilities

### 6.1 Visitor-facing website

1. **Home:** Entry page and navigation to Announcements, Families, and Members.
2. **Announcements:** Community-wide list and detail pages; category filtering is recommended.
3. **Families:** Household list and detail pages showing current head, current members, and public city/district. No past-membership history is exposed publicly.
4. **Members:** Searchable directory with filters for name, household, city, occupation, marital status, and deceased members.
5. **Member details:** Public fields are visible to everyone; restricted fields require a community-verified account.
6. **Account pages:** Email/password account creation and sign-in, email-verification state, community-review state, and the verified member's own request status.

### 6.2 Admin/moderator dashboard

- Overview of pending account reviews, member-change requests, and household-head decisions.
- Member management: create, view, edit, and mark a member deceased; retain meaningful records and history rather than deleting them casually.
- Household management: create/update households, assign current members, move members, set shared address, and choose the head.
- Announcement management: create, edit, publish, archive/remove community-wide announcements according to the final retention rules.
- Account review and optional account-to-member linking.
- Request review with approval/decline and status updates.
- Spreadsheet import and spreadsheet/printable-report export.
- Admin/moderator-only moderation audit history.
- Media moderation for member-photo submissions and announcement images.

---

## 7. Announcements

### 7.1 Categories

- Birthday
- Anniversary
- Wedding
- Birth
- Death
- General

### 7.2 Rules

- Announcements are community-wide and written in Gujarati.
- Announcements may include an image.
- Event-oriented categories (Birthday, Anniversary, Wedding, Birth, Death) have an occasion date and may link to one or more relevant member records when applicable.
- General announcements may omit an occasion date and can remain standalone.
- Record publication date separately from creation date.
- Admin/moderator forms manage content and category.
- Published announcements have no automatic expiry. Admins/moderators may archive a post to hide it publicly while retaining its content, image references, and audit history for admin review. Accidental unpublished drafts may be removed.
- Comments, reactions, audience targeting, and social engagement are not in first-release scope.
- Announcement images are managed by admins/moderators only.

---

## 8. Member change requests

### 8.1 Requests available to verified, linked accounts

Verified accounts linked to a member can request:

- Corrections to their own details.
- Corrections to another member of their current household, including members without accounts.
- A household move.
- Addition of a child or another person to their household.

Requests do not directly update directory records. Admins/moderators review them, apply approved changes, and update request status. The requester can view their own status.

### 8.2 Requests available to verified but unlinked accounts

A verified but unlinked account can request to be linked to an existing member record. Admins/moderators review and approve that request. Household-based requests are unavailable until the account is linked. Broader request permissions for unlinked accounts are not in the first release.

### 8.3 Request states

States are **Pending**, **Approved**, **Declined**, and **Withdrawn**. The requester may withdraw a request while it is Pending. A reason is not required, but an optional note may be provided. Approved and Declined requests are terminal and cannot be reopened; if the requester still needs a change, they submit a new request.

### 8.4 Approval and transaction requirements

- Only authorized admins/moderators can approve or decline requests.
- Applying an approved request and changing its status must be part of one database transaction when the operation changes related records.
- The request decision and resulting record changes must be audited.
- Require a reason for request decisions.

### 8.5 Closed request data minimization

- When a member-change request reaches Approved, Declined, or Withdrawn, erase its detailed proposed-value payload. Keep only the minimal request type, target record, requester/reference, status, timestamps, decision outcome, required decision reason, and audit metadata needed to understand the request history.
- An optional withdrawal note is submitted request content and is erased when the request closes. Do not copy sensitive proposed values into audit records; decision reasons should be concise and avoid repeating sensitive data.

---

## 9. Import, export, and duplicate handling

### 9.1 Import scope and order

Import templates cover households, members, and announcements from the first release, in separate steps and in this order:

1. Households.
2. Members.
3. Announcements.

Accepted formats: CSV and Excel/XLSX.

Each imported household receives a stable household ID. The member template references that ID rather than relying on a household head's name, which may change.

Household and member IDs are stable across exports and later imports. IDs must be present to directly target an update.

The member template includes a proposed household-head column. Validation flags households with zero or multiple proposed heads for moderator/admin review; an admin/moderator confirms the final head.

Announcement templates include optional member references for relevant occasion posts; General posts may be standalone.

### 9.2 Duplicate and update policy

- Possible duplicate members are flagged by Gujarati name plus full date of birth.
- If DOB is absent, same-name matches are flagged for manual review.
- A reviewer explicitly selects the existing record before choosing update. A suggested match is never applied automatically.
- For each flagged possible duplicate, the reviewer chooses create a new record, update the matched record, or skip the row.
- No automatic merge or silent overwrite is allowed.
- On update, blank cells preserve existing values.
- Clearing an existing value requires a separate explicit clear instruction, not an empty cell.
- Stable IDs are used for direct update targets; a blank ID or a single suggested match must never silently determine an update.

### 9.3 Import workflow

Upload → validate and preview → flag possible duplicates and row errors → human review → explicit create/update/skip decision → confirm import → show result summary.

Import writes must be transaction-safe. A batch may be processed in manageable transactions, but partial completion and retry semantics must be explicit and reported; the application must never claim a whole file succeeded if only part was committed.

### 9.4 Export scope

- CSV, Excel/XLSX, and printable PDF reports.
- Admin/moderator selects data and format.
- Exports containing restricted fields are privileged actions and are recorded in audit history.
- Export field selection and permission checks are server-side.

Final spreadsheet template columns, header names, sample files, and exact error-report format remain open for detailed design.

---

## 10. Media and image handling

### 10.1 Intended storage design

- Cloudflare R2 stores original image objects.
- Cloudflare Images is the intended initial transformation/delivery layer, subject to validating the selected plan and limits.
- Approved/public profile and announcement images may be delivered through the public media hostname.
- Pending member-upload submissions must remain private until approved.
- Keep media object identifiers stable and store media references/metadata in PostgreSQL.

### 10.2 Upload permissions

- A linked member may upload/replace photos for themselves and people in their current household.
- Moderators/admins may upload, replace, or remove anyone's photo.
- Announcement images are managed by admins/moderators only.

### 10.3 Moderation policy — confirmed

Verified, linked members may submit or replace photos for themselves or people in their current household. Member-submitted/changed photos enter private pending storage and require admin/moderator approval before becoming public. Moderator/admin changes may publish directly, with audit logging.

### 10.4 Media safety and lifecycle

- Validate file type, actual content, size, and image dimensions on the server; do not trust filename or browser MIME type alone.
- Use separate private pending and public approved object paths/buckets or equivalent access policies.
- Do not expose private pending object URLs to public clients.
- Use unique object IDs; avoid overwriting an existing original in place. Upload a new asset, verify it, then update the database reference.
- Back up original image objects, not generated transformation/cache variants.
- Keep prior originals for the approved retention period, subject to the final privacy/deletion policy.
- Deletion from active storage and deletion from backups must follow an explicit retention/privacy policy; do not assume that deleting a database reference deletes the object or its backups.
- Keep a member-photo submission pending until it is reviewed. Delete rejected submissions from active storage 30 days after rejection.
- Keep the current approved profile photo while the member record exists. Retain a replaced approved original in active storage for up to 12 months, then delete it; corresponding backups expire on their normal retention schedule.
- When an approved privacy/deletion request requires removing media, promptly delete it from active storage; encrypted backups expire on their normal retention schedule rather than triggering an ad hoc purge.

---

## 11. Moderation audit history

### 11.1 Minimum audit fields

Retain audit history indefinitely. Access is limited to admins and moderators, and entries must contain only the minimum information needed for accountability.

Record at least:

- Actor/account identifier.
- Timestamp.
- Action/event type.
- Affected record and record identifier.
- Changed field names.
- Outcome/result.
- Reason where required.
- Correlation/request identifier where available.

### 11.2 Audited operations

- Member, household, and announcement creation/updates/removals.
- Account verification/rejection and later verification of rejected cases.
- Account/member linking and unlinking.
- Request approval/decline and applied changes.
- Request withdrawal by the requester.
- Household moves and head changes.
- Imports and exports, including restricted exports.
- Media upload, replacement, approval, rejection, and removal.
- Administrative role or permission changes.
- Authentication-security actions where appropriate (for example, administrative session revocation), without logging secrets or tokens.

### 11.3 Sensitive data rules

For sensitive values (phone, email, address, blood group), record which field changed without copying the old/new value into the audit entry. Require a reason for sensitive record changes and for request decisions. Admins and moderators can view the audit history.

Do not place passwords, session tokens, verification tokens, reset links, private addresses, phone numbers, or blood-group values into application logs or generic audit payloads.

---

## 12. Localization and language

- Gujarati is the default interface language.
- Hindi and English are supported interface languages.
- Member names remain Gujarati in all interface languages.
- Announcement content is entered in Gujarati.
- Authentication email templates support Gujarati, Hindi, and English, with Gujarati as the default.
- Store a user language preference if the user changes the default; exact fallback rules are open.
- Do not assume a provider's built-in translation is sufficient. Authentication email templates should be controlled through Resend if Better Auth passes the PoC.
- Date formatting, digits, pluralization, and Gujarati font/rendering must be tested in the frontend.

---

## 13. Application architecture and technology decisions

### 13.1 Overall architecture: modular monolith

Use one NestJS backend application organized into business-capability modules. Use one relational PostgreSQL database. Do not introduce microservices, service discovery, distributed transactions, or a message broker for the first release.

The workload is moderate in business logic and security sensitivity but light in expected compute and traffic. A modular monolith is sufficient and easier to operate.

### 13.2 NestJS module structure

The 12 primary feature modules are:

1. `AuthModule` — authentication library integration, authentication routes, session verification, and authenticated identity extraction.
2. `AccountsModule` — local community accounts, email/community verification status, registration review workflow, and account lifecycle.
3. `AccessControlModule` — application roles, permission checks, guards, and policies.
4. `MembersModule` — member profiles and member-owned write operations.
5. `HouseholdsModule` — household records, current membership, head assignment, and household history.
6. `MemberRequestsModule` — link requests, profile corrections, household moves, additions, and request lifecycle.
7. `DirectoryModule` — public/verified directory queries, searching, filtering, sorting, and pagination.
8. `AnnouncementsModule` — announcements, categories, publication, and member references.
9. `MediaModule` — upload authorization, image metadata, object storage integration, moderation state, and media lifecycle.
10. `DataManagementModule` — spreadsheet imports, previews, duplicate review, exports, and printable reports.
11. `NotificationsModule` — notification templates, language selection, and delivery integration where enabled.
12. `AuditModule` — structured audit recording and authorized audit-history queries.

The transactional outbox and its worker are cross-cutting infrastructure. They may be implemented as a dedicated `OutboxModule` or as an infrastructure component used by the feature modules; this exact module boundary is still open.

### 13.3 Proposed source layout

```text
parkar-halani-parivar/
├── apps/
│   ├── web/                         # React + Vite
│   └── api/                         # NestJS
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── config/
│           │   ├── configuration.ts
│           │   └── environment.validation.ts
│           ├── common/
│           │   ├── decorators/
│           │   ├── guards/
│           │   ├── filters/
│           │   ├── interceptors/
│           │   ├── pipes/
│           │   └── types/
│           ├── database/
│           │   ├── database.module.ts
│           │   ├── database.provider.ts
│           │   ├── schema/
│           │   └── relations.ts
│           └── modules/
│               ├── auth/
│               ├── accounts/
│               ├── access-control/
│               ├── members/
│               ├── households/
│               ├── member-requests/
│               ├── directory/
│               ├── announcements/
│               ├── media/
│               ├── data-management/
│               ├── notifications/
│               └── audit/
├── packages/
│   └── contracts/                   # Shared Zod request/response contracts
├── docs/
│   ├── architecture/
│   ├── deployment/
│   ├── operations/
│   └── api/
├── .github/workflows/
├── package.json
├── pnpm-workspace.yaml              # Proposed; confirm during repo setup
├── pnpm-lock.yaml                   # If pnpm is confirmed
├── .node-version
├── .gitignore
├── .env.example
└── README.md
```

The repository name `parkar-halani-parivar` is the recommended name. GitHub Free private repository, single monorepo, and private visibility are confirmed. A pnpm workspace and pinned Node LTS version are proposed implementation conventions; exact package-manager/runtime versions are to be pinned during setup.

### 13.4 Layer responsibilities

Use the following request flow:

`HTTP request → Controller → Service/use case → Repository/query layer → Drizzle/PostgreSQL`.

| Layer | Responsibility | Avoid |
|---|---|---|
| Controller | HTTP routing, request/response handling, authenticated actor context | SQL and business workflow logic |
| Service/use case | Business rules, authorization-related decisions, workflow orchestration, transaction boundaries | HTTP-specific response formatting and ad hoc SQL everywhere |
| Repository | Feature-owned persistence queries and writes | Deciding business workflows |
| Query service | Complex/read-oriented projections, joins, search and pagination | Owning feature writes |
| PostgreSQL | Durable data, constraints, foreign keys, indexes, transactions | Depending on application-side assumptions alone |

Controllers should be thin. Business operations should not depend on HTTP so that the same use case can be initiated by an API endpoint, an import workflow, or an administrative action.

### 13.5 Data-access pattern: hybrid repository pattern

**Confirmed.**

- Use repositories for feature-owned persistence operations and complex writes.
- Use dedicated query services where read models/search projections are materially different from writes (for example, the directory).
- Simple read queries may live in a feature service when a repository wrapper would add no useful boundary.
- Do not create generic `BaseRepository<T>` CRUD wrappers for every table. Drizzle already provides query-building and type-safe SQL access; avoid abstraction that hides PostgreSQL capabilities.
- Do not expose a feature's private repository to unrelated modules.
- A module may perform read-only joins across feature-owned tables when justified, but it must not bypass another module's write rules.

### 13.6 Transaction propagation: explicit

**Confirmed.**

- The service/use case coordinating a multi-record workflow owns the transaction boundary.
- Pass the Drizzle transaction executor (`tx`) explicitly to every repository operation participating in the transaction.
- Every query within the transaction must use `tx`, not the globally injected database connection.
- Do not use hidden transaction propagation/AsyncLocalStorage initially.
- Do not keep a database transaction open while calling Resend, R2, or another external service.

Example pattern (illustrative, not final implementation code):

```typescript
await db.transaction(async (tx) => {
  await requestRepository.approve(tx, requestId);
  await memberRepository.transferHousehold(tx, memberId, householdId);
  await auditRepository.record(tx, auditEvent);
  await outboxRepository.insert(tx, event);
});
```

PostgreSQL constraints remain authoritative for data invariants. TypeScript/Zod validation does not replace unique constraints, foreign keys, check constraints, or transaction safety.

### 13.7 Module communication

**Confirmed hybrid communication model.**

- Use direct calls to exported application services for synchronous operations that need a result or must participate in the same database transaction.
- Use events for independent follow-up work that does not need to block the initiating request.
- A requesting module must call another module's public service rather than importing its private repository.
- Keep dependency direction clear and avoid circular NestJS module dependencies.
- Cross-module read projections may join tables, but write ownership stays with the owning feature module.

### 13.8 Database access technology

**Confirmed: Drizzle ORM + Drizzle Kit + `pg` driver.**

- Target a stable Drizzle ORM 0.45.x release at initial implementation; pin the exact stable version in the lockfile.
- Do not adopt Drizzle 1.0 prereleases/RCs for the initial production implementation without a separate upgrade decision.
- Use Drizzle Kit to generate and apply reviewed migrations.
- Runtime application connections should use the Neon pooled connection string.
- Migrations and maintenance should use the Neon direct connection string.
- Keep schema definitions organized by domain (`members`, `households`, `accounts`, `requests`, `announcements`, `audit`, auth adapter tables, etc.).
- Keep generated migration SQL version-controlled and reviewed.
- Do not use `drizzle-kit push` as the production migration strategy.
- Do not automatically run migrations at every application startup; use a controlled release/deployment step.
- Verify Better Auth's generated schema and migrations during its PoC before finalizing account/auth tables.

### 13.9 Database module layout (proposed)

```text
apps/api/
├── src/database/
│   ├── database.module.ts
│   ├── database.provider.ts
│   ├── schema/
│   └── relations.ts
├── drizzle/
├── drizzle.config.ts
└── package.json
```

The precise provider-injection implementation remains an implementation detail. Prefer a small NestJS database provider/module over adopting a prerelease integration package solely for convenience.

---

## 14. API architecture and conventions

### 14.1 API style and versioning

**Confirmed: REST API with URL-prefix versioning.**

All API endpoints use `/api/v1/...` initially. Resource-oriented endpoints are preferred, with explicit action endpoints for workflow transitions such as approve/decline.

Illustrative endpoints:

```text
GET    /api/v1/directory/members
GET    /api/v1/members/:id
GET    /api/v1/households/:id
POST   /api/v1/member-requests
POST   /api/v1/member-requests/:id/approve
POST   /api/v1/accounts/:id/approve
GET    /api/v1/announcements
POST   /api/v1/announcements
POST   /api/v1/media/uploads
```

These examples do not constitute a finalized endpoint contract. Exact paths, HTTP methods, permissions, schemas, and response codes will be specified during API design.

### 14.2 Validation and shared contracts

**Confirmed: Zod 4.**

- Use Zod as the single application schema-validation library for request/response contracts.
- Place shared schemas and inferred TypeScript types in `packages/contracts`.
- React may use shared schemas for client-side form feedback.
- NestJS must independently validate all incoming request data at runtime; frontend validation is never trusted as a security boundary.
- Use NestJS Standard Schema validation support (such as `StandardSchemaValidationPipe`) if supported by the selected stable NestJS version; verify this in the PoC. If needed, write a small adapter rather than adding multiple validation frameworks.
- Do not add `class-validator`/`class-transformer` solely for the same request-validation job if Zod integration works.
- Use strict object schemas for sensitive write operations where unexpected properties should be rejected.
- Keep request schemas separate from response schemas and separate from Drizzle database table definitions.
- Zod validates shape, type, and declared constraints. Services still enforce business rules and authorization. PostgreSQL still enforces persistence invariants.

Example shared package layout:

```text
packages/contracts/src/
├── accounts/
├── members/
├── households/
├── member-requests/
├── announcements/
├── media/
└── common/
    ├── api-response.schema.ts
    └── api-error.schema.ts
```

### 14.3 Successful response format

**Confirmed response envelope:**

```json
{
  "data": {},
  "meta": {}
}
```

- `data` contains the resource or collection.
- `meta` is optional and holds pagination or other response metadata.
- A `204 No Content` response has no body and therefore no envelope.
- Use appropriate HTTP success codes (for example 200, 201, 202, 204).

### 14.4 Error response format

**Confirmed: RFC 9457 Problem Details with application-specific extensions.**

Use a consistent error object with standard problem fields such as `type`, `title`, `status`, `detail`, and `instance`, plus stable application fields such as `code`, field-level `errors`, and `traceId` where appropriate.

Example (illustrative):

```json
{
  "type": "https://<configured-domain>/problems/validation-error",
  "title": "Request validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/accounts/register",
  "code": "VALIDATION_FAILED",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Enter a valid email address."
    }
  ],
  "traceId": "<request-correlation-id>"
}
```

The configured production domain must replace the placeholder before implementing public problem-type URLs. Human-readable messages may be localized; clients should branch on stable machine-readable error codes, not parse message strings.

### 14.5 HTTP status conventions

| Code | Meaning / typical use |
|---|---|
| 200 | Successful retrieval or update with a body |
| 201 | Resource created |
| 202 | Accepted asynchronous operation |
| 204 | Successful operation with no response body |
| 400 | Invalid request or validation failure |
| 401 | Missing/invalid authentication |
| 403 | Authenticated user lacks permission or required community status |
| 404 | Resource not found or intentionally not disclosed to caller |
| 409 | Duplicate/conflicting resource or incompatible workflow state |
| 429 | Rate limit exceeded |
| 500 | Unexpected internal server error |
| 503 | Required service temporarily unavailable |

### 14.6 Response serialization and data exposure

**Confirmed:** never return raw Drizzle database records directly.

- Construct explicit response DTO/schema projections.
- Return only fields the authenticated caller is allowed to see.
- Keep public, verified-account, and administrative projections separate where needed.
- Do not expose auth tables, private account fields, audit internals, or sensitive columns through generic object serialization.
- Use camelCase JSON keys.
- Serialize dates as ISO 8601 strings, normally in UTC for timestamps.
- Represent IDs consistently as strings at the API boundary.
- Zod response schemas provide contracts and can be used in tests. Do not assume every response needs repeated runtime parsing in production; explicit mapping is the primary exposure boundary.

### 14.7 API documentation

**Confirmed: NestJS Swagger / OpenAPI.**

- Use `@nestjs/swagger` to generate the OpenAPI specification and serve Swagger UI in local development and staging.
- Reuse Zod schemas for request contracts where the selected NestJS/OpenAPI integration supports it.
- Explicitly document response schemas, status codes, authentication requirements, and error responses; TypeScript return types alone are not sufficient documentation.
- Generate an OpenAPI JSON artifact in CI for internal review/versioning.
- **Production must not register the Swagger UI route or the OpenAPI HTTP JSON route.** The user explicitly does not want a `/docs` endpoint in production. Do not merely hide the UI while leaving a public JSON route.
- Do not add API client-generation tooling unless a concrete need arises.

### 14.8 Error handling and logging

- Use a global NestJS exception filter to normalize API errors.
- Never expose stack traces, SQL statements, raw driver errors, secrets, or internal exception messages to API clients.
- Keep technical diagnostic details in restricted operational logs and correlate them with `traceId`.
- Do not log passwords, session cookies, tokens, verification links, private contact fields, addresses, or blood groups.

---

## 15. Background processing and transactional outbox

### 15.1 Worker architecture

**Confirmed:** one worker runs inside the same NestJS application deployment initially.

- Do not create a separately deployed worker service at launch.
- Do not introduce Redis, BullMQ, Kafka, RabbitMQ, or another broker initially.
- Store durable work events in PostgreSQL using a transactional outbox.
- The same transaction that changes business state inserts the corresponding outbox event.
- A worker in the NestJS process claims and handles pending events.
- If measured workload later justifies it, the worker can be separated into its own deployment while retaining the PostgreSQL outbox design.

### 15.2 Delivery guarantee

**Confirmed: at-least-once processing is acceptable; exactly-once delivery is not required.**

- A rare duplicate email is acceptable to the user.
- Use stable event IDs and provider idempotency where supported, but do not build an elaborate exactly-once system.
- A crash after an external provider accepts a message but before the database records success can cause a retry and duplicate. Document this limitation.
- Never hold a PostgreSQL transaction open while waiting for Resend or another external service.

### 15.3 Processing pattern

Recommended pattern:

1. Begin business transaction.
2. Apply business changes.
3. Insert audit record.
4. Insert outbox event.
5. Commit transaction.
6. Worker claims the event in a short transaction.
7. Worker performs external work outside the claim transaction.
8. Mark success or schedule retry.
9. Recover events left in processing after a worker crash using an expiring lease/claim timeout.

`FOR UPDATE SKIP LOCKED`, a claim lease, retry count, retry schedule, and exponential backoff with jitter are proposed implementation techniques. The exact schema and polling interval remain to be finalized. An initial 5–10 second polling interval was suggested but is not yet an approved requirement.

### 15.4 Notifications in first release

- Authentication verification and password-reset emails are required and use Resend if Better Auth passes.
- General email/SMS/push notifications for member requests or announcements are not required in the first release; dashboard notifications are sufficient.
- The outbox and NotificationsModule provide an architecture for future asynchronous notifications without committing to broad notification delivery in the first release.

---

## 16. Hosting, domain, and infrastructure

### 16.1 Selected infrastructure direction

| Component | Provider / plan | Status and notes |
|---|---|---|
| Source control | GitHub Free, private repo | Confirmed |
| Frontend | Cloudflare Pages Free | Confirmed direction |
| API | Render Free initially for development/pilot | Confirmed |
| API production | Render Starter, planned before production use of sensitive family data | Confirmed direction; verify current price/limits before purchase |
| PostgreSQL | Neon Free initially | Confirmed direction; review production requirements and limits before launch |
| Media originals | Cloudflare R2 | Confirmed direction |
| Image transformation/delivery | Cloudflare Images Free initially | Confirmed direction; verify current terms and transformation limits |
| Transactional email | Resend | Preferred/selected; verify domain and sending limits |
| Backup storage | Backblaze B2 | Confirmed direction |
| DNS | Cloudflare authoritative DNS | Confirmed direction |
| Registrar | GoDaddy | Preferred direction; domain purchase status to be confirmed |

### 16.2 Hosting philosophy and budget

- Aim for $0 recurring cost initially where reasonable.
- A modest ongoing spend of approximately USD $10–$30/month is acceptable; this is a comfort range, not a hard ceiling.
- Security, privacy, backups, and recoverability take priority over saving the last few dollars.
- Render Free is for development/pilot and may be used during early validation. Upgrade to Render Starter before production use involving sensitive family records so the backend does not depend on free-tier sleep/best-effort behaviour.
- Neon Free may be used initially, but production readiness depends on limits, backup strategy, connection needs, and actual use—not on the label “free.”
- Do not use Render Free PostgreSQL as the sole durable production database. Its free database limitations/expiry were a disqualifier in prior planning.
- Verify all provider pricing, quotas, policies, and regional options again at purchase/deployment time. Prices quoted during earlier planning are snapshots and are not guarantees.

### 16.3 Domain and hostnames

Preferred domain: `halani.in`. Preferred registrar: GoDaddy. Cloudflare is intended to provide authoritative DNS.

Planned hostnames:

| Hostname | Purpose |
|---|---|
| `halani.in` | Reserved root domain; no website or redirect initially |
| `parakar.halani.in` | Public frontend on Cloudflare Pages |
| `api.parakar.halani.in` | NestJS API on Render |
| `media.halani.in` | Approved/public media delivery via R2 custom domain |
| `notify.halani.in` | Resend sending-domain authentication/transactional email domain |

The `parakar` spelling in the frontend subdomain is the hostname chosen during planning; keep it exact unless the user explicitly changes it. The domain has not been confirmed as purchased/registered; verify before configuring provider records.

### 16.4 DNS and TLS plan

1. Add `halani.in` as a Cloudflare zone.
2. Review existing DNS records before changing nameservers.
3. If DNSSEC is enabled at the registrar, remove the old DS record before changing nameservers; after Cloudflare becomes authoritative, enable DNSSEC in Cloudflare and add the new DS record at GoDaddy.
4. Replace registrar nameservers with the exact Cloudflare-assigned nameservers.
5. Wait until Cloudflare reports the zone active.
6. Configure Cloudflare Pages, Render custom domain, R2 custom domain, and Resend domain authentication using the exact DNS records displayed by each provider. Do not invent CNAME, TXT, SPF, DKIM, or Return-Path values.
7. Initially keep the Render API custom-domain DNS record DNS-only while Render provisions/validates TLS. Test the API and certificate before considering Cloudflare proxying.
8. If API proxying is enabled later, use Full (strict) TLS after the origin certificate is valid, disable inappropriate caching for authenticated API routes, and verify cookies, CORS, request size, and webhook behaviour.
9. Email-authentication records (SPF/DKIM/Return-Path and DMARC) should be configured exactly as Resend instructs. Begin DMARC in monitoring (`p=none`) before tightening the policy after reviewing reports.
10. Outbound email only is intended initially. Do not add root-domain MX records or inbound mailbox routing unless a later requirement calls for receiving mail. Provider-specific return-path records may still be required for sending authentication.

GoDaddy WHOIS redaction was checked during prior planning using example domains. Do not purchase a domain-protection add-on solely for public WHOIS privacy without reviewing its actual security features, terms, and current price. Evaluate domain protection for transfer/DNS/account security instead. Domain purchase and add-on choices remain pending.

### 16.5 Development, staging, and production environments

| Environment | Frontend | Backend | Database | Data policy |
|---|---|---|---|---|
| Local | Vite development server | Local NestJS | Neon development branch or isolated local DB | Synthetic/test records only |
| Staging | Cloudflare Pages preview/develop deployment | Render development/staging service | Separate Neon development/staging branch | Synthetic records only; never copy production personal data casually |
| Production | Cloudflare Pages deployment from `main` | Render production API | Neon production database/branch | Real community data |

Separate environment credentials, email configuration, OAuth credentials, and storage buckets/prefixes. Do not use production secrets in local/staging. Frontend `VITE_*` variables are browser-visible and must contain only public configuration; never place secrets in them.

---

## 17. Git, repository, CI/CD, and release process

### 17.1 Repository decisions

- GitHub Free.
- Private repository.
- Single monorepo.
- Recommended name: `parkar-halani-parivar`.
- Preserve existing Git history; the clean rebuild must not discard useful prior work or uncommitted changes.

### 17.2 Proposed branch model

This is the recommended workflow; confirm final branch settings at repository setup:

- `main` — production.
- `develop` — integrated development/staging.
- `feature/*`, `fix/*`, `chore/*` — focused work branches.
- Use pull requests; avoid direct pushes to `main`.
- Promote reviewed work from `develop` to `main` through a release PR.
- Tag releases with versions such as `v1.0.0`.

GitHub Free private-repository enforcement capabilities should be checked at setup. Until required checks/branch rules can be enforced, use documented manual PR and merge discipline rather than assuming the platform blocks every unsafe merge.

### 17.3 Proposed CI checks

- Formatting and linting.
- Type checking.
- Unit and integration tests.
- Frontend and backend production builds.
- Zod contract validation/tests.
- Database migration test against a clean ephemeral/development database.
- Security/dependency checks (`pnpm audit` if pnpm is selected), secret scanning (for example Gitleaks), and dependency-update review.
- OpenAPI JSON generation and internal artifact retention.
- Backup workflow checks where relevant.

Production deployment must not proceed after failed required checks. Cloudflare Pages native deployments and Render deployment triggers must be configured so a branch push does not bypass the intended CI/release gate.

### 17.4 Migrations and releases

- Generate migrations in development.
- Review generated SQL.
- Commit migrations to Git.
- Test from a clean database in CI.
- Back up production before risky schema changes.
- Use expand/migrate/contract for changes that need compatibility across releases.
- Run production migrations as a controlled deployment/release step, not automatically on every application startup.
- Render Free has no production-grade pre-deploy command workflow; use an explicit CI/release migration job or the planned paid service's supported deployment process.
- Document rollback/forward-fix steps. Database rollback is not always safe after data has been written in the new schema.

### 17.5 Secrets

- Local secrets in ignored local environment files.
- Maintain a sanitized `.env.example`.
- Store backend secrets in Render environment/secrets configuration.
- Store only non-secret public frontend configuration in frontend build variables.
- Restrict GitHub Actions secrets to the specific backup/deployment workflows that need them.
- Use separate least-privilege keys for B2, R2, Neon, Resend, and other providers.
- Never commit `.env` files, provider service-account JSON, private age keys, database URLs, OAuth secrets, or session secrets.

---

## 18. Security, privacy, and operational controls

### 18.1 Authorization

- All restricted-field access must be enforced by NestJS on the server, not only hidden in React.
- Authentication does not imply community verification.
- Community verification does not imply member linkage.
- Application roles and member-link relationships are stored in PostgreSQL, not trusted from client-submitted fields or arbitrary provider profile metadata.
- A user must never be able to set their own role, community-verification state, or linked member ID through an ordinary profile-update request.
- Admin/moderator privileges require server-side checks on every protected operation.
- Directory read queries must project only fields visible to the current caller.
- Avoid direct browser access to the database. The NestJS API is the trusted application boundary.

### 18.2 General security

- HTTPS only outside local development.
- Exact-origin credentialed CORS.
- CSRF protections for cookie-authenticated state-changing requests.
- Rate limiting on authentication and abuse-prone endpoints.
- Input validation with Zod 4 and business validation in services.
- PostgreSQL constraints for important data invariants.
- File content/type/size validation and private pending storage.
- No secrets in browser bundles.
- No sensitive PII in operational logs, exception messages, trace attributes, or generic audit payloads.
- Dependabot or equivalent dependency monitoring; secret scanning and dependency audits in CI.
- Review all authentication, database, image, and email-provider security advisories.

### 18.3 Privacy and retention

- No-index public pages, but never rely on indexing controls to secure restricted information.
- Restricted mobile, email, full address, and blood group fields must not be included in public API payloads.
- Audit logs record changed field names, not old/new sensitive values.
- Keep pending media private.
- Routine member/household removal means archive/deactivate with history intact. Only admins may permanently delete accidental, test, or duplicate member/household records; require a reason and block deletion if it would erase meaningful history.
- Retain minimal moderation audit history indefinitely, restricted to admins/moderators. When an authentication identity is removed after account closure, retain only an opaque local community-account ID as needed to preserve audit attribution.
- Erase detailed proposed values and optional withdrawal notes when a member-change request closes; retain only its minimal status and audit history.
- Define handling of media deletion/privacy requests and backup purging before schema approval. Meaningful family history must not be cascade-deleted accidentally.
- Account deletion/deactivation must be separate from member-record and household-history deletion.
- If an account holder requests closure, immediately disable sign-in/revoke sessions. Admin must process a valid authenticated request; after completion, permanently remove the authentication identity/provider mapping and unlink the account. Do not delete the linked member record or household history.
- A valid authenticated account-closure request must be completed; Admin processes but does not deny the request.
- The final privacy notice, consent/notice requirements, and data-subject request workflow remain open product/legal review items.

---

## 19. Backup and disaster recovery

### 19.1 Confirmed direction

- Back up Neon PostgreSQL and Cloudflare R2 originals to Backblaze B2, independent of the primary providers.
- Database backup frequency: every 12 hours.
- Media-original backup frequency: every 12 hours.
- A monthly encrypted offline copy on an external drive is recommended as an additional safeguard; exact ownership and operational routine remain to be assigned.
- Backups must be encrypted, integrity-checked, retained, monitored, and periodically restored. A backup job that has never been restored is not considered proven.

### 19.2 Database backup design (proposed implementation)

- Use PostgreSQL custom-format `pg_dump` archives (`pg_dump -Fc`) with the direct/unpooled Neon connection where appropriate.
- Schedule two backups approximately 12 hours apart (example times discussed: 05:47 and 17:47 IST; exact schedule can be set during implementation).
- Include application tables, Better Auth tables if selected, community account/role data, household history, requests, announcements, media references, and audit records.
- If Firebase is ultimately selected, authentication identities are external and require a separate export/recovery procedure.
- Use separate B2 prefixes or buckets for database backups and media backups.
- Governance/Object Lock retention values of approximately 15 days for half-daily database backups, 57 days for weekly backups, and 366 days for monthly backups were discussed as a possible configuration; verify B2 support, costs, and operational consequences in a disposable bucket before enabling them.

### 19.3 Proposed retention

The following retention policy was proposed and should be verified against cost, B2 plan, and privacy requirements before configuration:

- 12-hour database backups: 14 days.
- Weekly backups: 8 weeks.
- Monthly backups: 12 months.
- Pre-change/pre-migration backups: at least 30 days or the agreed change-retention window.

Do not treat provider free-tier storage allowances as guaranteed capacity. Monitor actual stored size and projected retention cost.

### 19.4 Encryption and integrity

- Encrypt backup archives locally before upload using `age` or an equivalent reviewed encryption tool.
- Keep the private decryption key in a secure password manager and an offline recovery copy; the backup workflow should need only the public recipient key.
- Test key recovery/decryption before production launch.
- Generate SHA-256 checksums and a manifest containing backup ID, timestamp, source category, size, and checksum.
- Do not include personal names, phone numbers, emails, or other PII in backup filenames or manifests.
- B2 buckets should be private. Use bucket/prefix-restricted, least-privilege application keys.
- Evaluate Object Lock/Governance retention in a disposable bucket before enabling it for production. A writer key should not have governance-bypass or unrestricted delete permissions; keep break-glass administration separate.
- Database and media retention rules must be independent.

### 19.5 Media backups

- Copy original R2 objects, not Cloudflare Images generated variants or caches.
- Use incremental copying without destructive mirror behaviour. Do not use a delete-capable `rclone sync --delete` mirror as the backup strategy.
- Use unique object IDs and avoid overwriting an original in place.
- Retain replaced approved profile-photo originals in active storage for up to 12 months, then delete them; backups expire on their normal retention schedule.
- Retain pending member-photo submissions until review; delete rejected submissions from active storage 30 days after rejection.
- For approved privacy/deletion requests, promptly remove affected media from active storage and let encrypted backups expire under the normal retention schedule; do not trigger an ad hoc backup purge.

### 19.6 Automation and monitoring

- GitHub Actions is the proposed backup scheduler/orchestrator.
- Alert if a successful database backup is older than 14 hours.
- Verify upload completion and checksum; verify dump integrity.
- Keep backup credentials least-privileged and isolated from normal deployment secrets.
- GitHub scheduled workflows are best-effort; add an independent heartbeat/monitor for missed backups if required.
- Send backup success/failure notifications without attaching the database archive to ordinary email. Store encrypted archives in private B2 storage.

### 19.7 Restore tests and targets

- Restore monthly into a separate Neon test database.
- Verify decryption, PostgreSQL restore, row counts/sanity checks, foreign-key integrity, key workflows, media references and object availability.
- Run application smoke checks after restore.
- Target recovery point objective (RPO): 12 hours.
- Target recovery time objective (RTO): 4 hours.

RPO/RTO are goals, not proven guarantees. Measure them in restore drills and revise if actual recovery takes longer.

---

## 20. Monitoring, reliability, and operations

- Expose health endpoints such as `/health/live` and `/health/ready`.
- Liveness indicates the process is alive; readiness indicates required dependencies are available enough to serve traffic.
- Use Render logs for operational diagnostics, but do not log sensitive personal data, tokens, cookies, or full private payloads.
- Keep audit records in PostgreSQL; do not substitute ephemeral host logs for the audit trail.
- Cloudflare Web Analytics is an option for privacy-conscious website usage measurement.
- Sentry or another error-tracking service is optional; assess PII scrubbing and data-processing settings before enabling it.
- Monitor database connections, query latency, outbox backlog, failed jobs, email delivery failures, media storage/bandwidth, and backup age.
- Use dependency/security scanning and secret detection in CI.
- Do not introduce real-time dashboard infrastructure initially; normal page/API reads are sufficient.
- Render Free sleep/cold-start behaviour is acceptable for development/pilot, not the intended production experience with sensitive family records.

---

## 21. Cost and capacity posture

- Initial goal: minimize recurring spend and use free tiers where practical.
- Comfortable recurring budget discussed: approximately $10–$30/month, with no hard ceiling where reliability or security justifies spending.
- The plan intentionally does not rely on keeping a free Render API warm through artificial heartbeat requests as a production uptime guarantee.
- Render Starter before production use of sensitive family data is the planned reliability step.
- Neon Free may be used during development/early validation; review its plan/limits and backup fit before launch.
- B2 storage, media volume, image delivery bandwidth, Resend sending limits, domain renewal, and paid upgrades may affect total cost.
- All historical provider price figures in the original planning draft were snapshots from October 2026 and must be rechecked. Do not use them as purchase quotes.
- Load-test the expected directory search/browse workload, approximately 10 concurrent users as the initial estimate, and occasional import batches. Tune based on measured results, not speculative scale.

---

## 22. First-release scope and exclusions

### 22.1 First-release capabilities

- Public Home, Announcements, Families, Members, and member-detail pages.
- Email/password registration, verification, login/logout, and password reset.
- Account-closure request workflow, with access-disable timing still to be decided.
- Community account pending/verified/rejected workflow.
- Admin and moderator dashboard and permissions.
- Member and household administration with history.
- Verified-only restricted member details.
- Verified unlinked account-to-member link requests.
- Linked member correction and household-change/addition requests.
- Announcement administration and images.
- Member-photo uploads subject to the final moderation policy.
- CSV/XLSX household, member, and announcement imports with validation, duplicate review, and explicit human decisions.
- CSV/XLSX exports and printable PDF reports.
- Moderation audit history.
- Gujarati/Hindi/English UI, Gujarati default, Gujarati names and Gujarati announcement content.
- Resend authentication emails in the supported languages.

### 22.2 Explicitly excluded from first release

- Google sign-in.
- Apple sign-in.
- Phone OTP or phone-number authentication.
- Family tree and kinship graph.
- Events calendar, RSVP and event reminders.
- Comments, reactions, social feed and audience targeting.
- Community forum, business directory, matrimonial section, oral-history platform, DNA integration, and AI relationship suggestions.
- Native mobile applications and offline mode.
- General email/SMS/push notifications for all product workflows.
- Real-time dashboard updates.
- Microservices, message brokers, distributed event infrastructure, and dedicated search cluster.

### 22.3 Later-feature candidate bank

These ideas may be considered later and require separate product approval and prioritization:

- Family tree and explicit kinship links (parent/child, spouse, sibling, adoption, step-family, extended family).
- Relationship verification, conflict detection, history, and suggestions.
- Separate events calendar, RSVP, reminders, and event notifications.
- Announcement comments, reactions, expiry, pinning, targeting, and archive.
- Photo galleries, document storage, and media tagging.
- Email/SMS/push notifications.
- Google sign-in and optional account linking.
- Apple sign-in only if a future concrete requirement justifies it.
- More self-service profile/account tools.
- Per-field privacy controls and additional access rules.
- Analytics, richer reporting, and advanced audit tools.
- Native mobile apps and offline mode.
- Community forum, business directory, matrimonial section, oral history, AI suggestions, DNA integrations, and other speculative ideas from early drafts.

---

## 23. Implementation roadmap

The sequence below reflects dependencies and the latest architecture decisions. It is a recommended order, not a promise of dates.

### Phase 0 — Repository preservation and authentication PoC

1. Inspect current Git status, remotes, branches, uncommitted changes, and history.
2. Preserve user-owned work in a checkpoint/backup branch or commit before any clean rebuild. Do not discard the previously observed 16 modified tracked files without checking the current state.
3. Set up an isolated Better Auth PoC branch and Neon development branch.
4. Validate NestJS handler integration, Drizzle schema/migrations, Neon connections, Resend flows, cookies/CORS/CSRF, session validation/revocation, and account-linking policy.
5. Decide Better Auth versus Firebase from PoC evidence. If Better Auth passes, record the exact stable versions and integration design.

### Phase 1 — Repository and deployment foundations

6. Establish the private GitHub monorepo and branch/release workflow.
7. Confirm package manager and Node LTS versions; create workspace layout.
8. Establish lint, format, typecheck, tests, production builds, migration CI, secret scanning and dependency auditing.
9. Create local, staging and production provider resources with separate credentials.
10. Configure Cloudflare Pages, Render, Neon, R2, Resend and domain/DNS as applicable.

### Phase 2 — Identity, accounts, permissions, and schema

11. Finalize authentication tables and the separate community-account identity mapping.
12. Design the complete relational schema for members, households, history, requests, announcements, media, audit, outbox, and roles.
13. Approve a role/permission matrix and field-visibility matrix.
14. Implement session verification, guards/policies, email/community verification workflow, and account-to-member linking.
15. Implement audit recording and transactional-outbox foundations.

### Phase 3 — Core community data

16. Implement member and household CRUD and history-safe assignment/move/head operations.
17. Implement public and verified directory query projections, filters, sorting, and pagination.
18. Implement announcement management and public announcement pages.
19. Implement media upload, private pending/public approved lifecycle, and moderation.

### Phase 4 — Requests and administration

20. Implement member link requests and member-change requests.
21. Implement admin/moderator review queues and request decisions.
22. Implement household-head decision queue.
23. Implement administrative dashboard and role-specific views.

### Phase 5 — Imports, exports, localization, and launch readiness

24. Finalize CSV/XLSX templates and import validation/duplicate review.
25. Implement CSV/XLSX and printable PDF exports with privileged-export audit records.
26. Complete Gujarati/Hindi/English UI and authentication-email testing.
27. Implement backup automation, monitoring, and restore drills.
28. Complete privacy/security review, load testing, accessibility checks, and operational documentation.
29. Run end-to-end acceptance tests and controlled production release.

---

## 24. Open decisions and unresolved details

The architecture is substantially planned, but not every implementation detail or product rule is finalized. The following must remain visible rather than being silently assumed:

### 24.1 Immediate blockers / before schema freeze

1. Better Auth PoC outcome and exact integration method.
2. Exact Better Auth/Drizzle/NestJS stable versions and auth adapter schema.
3. Local community-account and provider-identity mapping design.
4. Detailed permission matrix for operational moderator actions, including record edits, restricted exports, media management, and audit access. Admin-only role/permission management and the rejected-account exception are confirmed.
5. Handling media deletion/privacy requests and any legal/exceptional backup purge; the normal approved-request behavior is to remove affected media promptly from active storage and let encrypted backups expire normally. Member/household, account-closure, published-announcement, ordinary photo-retention, audit-history, and closed member-change request retention behavior is recorded in Sections 7.2, 8.5, 10.4, 11.1, 18.3, and 19.5.
6. Whether verified social-provider email claims (when Google is added) satisfy the application's email-verification requirement.

### 24.2 Before feature implementation

8. Final occupation category list.
9. Final member/household import template columns and sample workbooks.
10. Final announcement import columns and linking semantics.
11. Approval/decline decision reasons are required; request withdrawal has an optional note.
12. Exact API route and payload contract for each feature.
13. Frontend router, state/data-fetching approach, form library, design system/component strategy, and localization implementation details.
14. Whether pnpm is the chosen workspace package manager and exact Node/pnpm versions.
15. Exact outbox module boundary, worker scheduling mechanism, poll interval, lease duration, retries, and event retention.
16. Exact database schema, indexes, constraints, and migration ownership.
17. Exact privacy notice, consent/notice language, and deletion-request handling.

### 24.3 Before production deployment

19. Confirm `halani.in` purchase/ownership and registrar account security.
20. Confirm DNS records from provider dashboards and complete DNSSEC/TLS validation.
21. Verify current Render, Neon, Cloudflare, R2, Images, Resend, and B2 plans/limits/prices.
22. Complete B2 backup automation, encryption-key recovery test, retention configuration, and monthly restore test.
23. Complete R2 media backup and deletion/retention policy.
24. Complete session/cookie/CORS/CSRF/security tests using the actual deployed frontend and API origins.
25. Complete production migration and rollback/forward-fix procedure.
26. Verify domain email authentication (SPF, DKIM, DMARC) and Resend deliverability.
27. Define production incident ownership and backup-failure alerts.

---

## 25. Key risks and mitigations

| Risk | Potential impact | Mitigation / status |
|---|---|---|
| Better Auth NestJS integration is brittle | Authentication implementation rework | Isolated PoC before schema freeze; Firebase fallback |
| Authentication account-linking error | Account takeover or duplicate identities | Disable implicit linking; explicit authenticated linking only; patched versions |
| Sensitive field leakage through API | Exposure of phone, email, address, or blood group | Server-side authorization, explicit response projections, tests |
| Incorrect household history | Loss of family membership history | Stable IDs, history records, explicit transaction rules, no cascade-delete assumptions |
| Spreadsheet import overwrites wrong member | Corrupt family records | Stable IDs, preview, duplicate review, human create/update/skip choice |
| Outbox worker retries after provider accepted email | Rare duplicate email | At-least-once accepted; stable event IDs and provider idempotency where supported |
| Worker/API process restarts | Delayed background delivery | Durable PostgreSQL outbox; lease/retry/recovery |
| Free backend sleeps or restarts | Poor user experience or interrupted work | Render Starter before sensitive production use |
| Database or media loss | Irrecoverable family data | Independent encrypted B2 backups and restore drills |
| Restore reactivates old sessions | Previously revoked sessions may become valid after DB restore | Invalidate all auth sessions after recovery before reopening service |
| Public page indexing | Personal directory data discoverable through search | No-index directives and no profile sitemap; never treat these as access controls |
| Provider/DNS misconfiguration | Login, email, or website downtime | Separate environment configs, DNS checklist, staging verification |
| Dependency vulnerability | Authentication or application compromise | Pinned stable releases, advisory monitoring, dependency scanning and patch ownership |
| Personal data in logs/backups | Unnecessary data exposure | PII minimization, encryption, restricted access and retention controls |

---

## 26. Repository restart and legacy-document handling

The agreed direction is a clean rebuild with Git history intact. Existing code should not be discarded until the plan is approved and current uncommitted changes have been reviewed and preserved or deliberately excluded.

The historical Next.js prototype, current Vite frontend, and current backend are references only. Their existence does not override the architecture decisions in this plan.

### 26.1 Previously reviewed uncommitted work

A review on 18 October 2026 observed 16 modified tracked files. At that time, the diff included a substantial frontend page/layout rewrite, SPA route/auth changes, an email/password sign-up/sign-in flow update, an auth-service change making phone optional, and README/database/storage setup updates for Supabase and contact-info reminders.

Those changes were user-owned work and had not been changed by the planning process. They are evidence of explored directions, not automatically approved requirements. The then-current router protected `/app`, `/families`, `/members`, and `/announcements` behind sign-in, which conflicts with the agreed public visitor browsing for non-sensitive directory fields and announcements.

**Before any rebuild or cleanup, inspect the current live Git state again.** The October observation may be stale. Preserve current changes and history before deciding what to carry forward.

### 26.2 Legacy-document conflicts

The current product plan supersedes older incompatible drafts:

| Legacy direction | Current planning decision |
|---|---|
| Family tree, detailed kinship relationships, events, galleries, and rich social announcements treated as central first-release scope | First release is households, members, community-wide announcements, accounts/verification, requests, admin operations, and import/export. Genealogy/events/social features are deferred candidates. |
| Member-to-family many-to-many model and required relationship records | One current household per person; previous household assignments retained as history. Kinship links are separate and deferred. |
| Every account directly linked to one required member record | Accounts may be unlinked; verification is distinct from member linkage. |
| Phone OTP and OAuth in the initial account flow | Email/password initially; Google later if approved; phone login not planned; Apple not in near-term scope. |
| Optional birth date or English-style split-name assumptions | Full date of birth required; member name stored/displayed in Gujarati. |
| Public/private fields governed only by older UI assumptions | Field visibility is defined in Section 5 and must be enforced by the backend. |
| Cascade-delete examples for family/member/history-linked records | Routine member/household removal archives records with history intact; only admins may permanently delete accidental/test/duplicate records with a reason and only when meaningful history is not erased. |
| Previous hosting alternatives involving Supabase-centered or other stacks | Current selected direction is React/Vite + NestJS + Neon + Drizzle + Cloudflare Pages/Render/R2 + Resend, with Better Auth conditional on PoC. |

Treat legacy database schemas, routes, and roadmap checklists as historical reference material, not as approved requirements or a migration target.

---

## 27. Architecture decision register

This table is the concise source of truth for the decisions made during planning. If a later implementation detail conflicts with it, update this plan or record an explicit exception rather than silently changing direction.

| # | Area | Decision | Status |
|---:|---|---|---|
| 1 | Product | Responsive Gujarati-first community website | Confirmed |
| 2 | Public access | Public browsing of non-sensitive pages without login | Confirmed |
| 3 | Search indexing | Public directory/household pages no-indexed; not an access control | Confirmed |
| 4 | Account/member model | Account identity, community account, and member record separate | Confirmed |
| 5 | Community approval | Admin and moderator can approve/reject pending registrations | Confirmed |
| 6 | Rejected accounts | Admin-only rejected queue; admin may later verify; moderator may not | Confirmed |
| 7 | Household model | One current household per person; retain history | Confirmed |
| 8 | Kinship | Family tree/kinship links deferred | Confirmed |
| 9 | Import | Human-reviewed duplicate handling; never silently merge/overwrite | Confirmed |
| 10 | Backend | NestJS | Confirmed |
| 11 | Frontend | React + Vite | Confirmed |
| 12 | Architecture | Modular monolith; no microservices initially | Confirmed |
| 13 | Database | Neon PostgreSQL | Confirmed direction |
| 14 | ORM/access | Drizzle ORM + Drizzle Kit | Confirmed |
| 15 | Driver | `pg` | Selected direction; exact version pending |
| 16 | Runtime connection | Neon pooled connection | Confirmed direction |
| 17 | Migration connection | Neon direct connection | Confirmed direction |
| 18 | Data access | Hybrid repository/query-service pattern | Confirmed |
| 19 | Transactions | Explicit `tx` propagation; orchestrating service owns boundary | Confirmed |
| 20 | Module communication | Direct service calls + events | Confirmed |
| 21 | Event durability | PostgreSQL transactional outbox | Confirmed |
| 22 | Worker | One internal worker in NestJS deployment | Confirmed |
| 23 | Delivery guarantee | At-least-once; rare duplicate emails acceptable | Confirmed |
| 24 | Queue infrastructure | No Redis/BullMQ/message broker initially | Confirmed |
| 25 | API | REST | Confirmed |
| 26 | Versioning | URL prefix `/api/v1` | Confirmed |
| 27 | Validation | Zod 4 | Confirmed |
| 28 | Shared contracts | Zod schemas/types in `packages/contracts` | Confirmed |
| 29 | Success response | `{ data, meta? }` envelope | Confirmed |
| 30 | Error response | RFC 9457 Problem Details + application codes | Confirmed |
| 31 | Serialization | Explicit response mapping; never return raw DB records | Confirmed |
| 32 | API docs | NestJS Swagger/OpenAPI | Confirmed |
| 33 | Production docs | No Swagger UI or OpenAPI HTTP endpoint in production | Confirmed |
| 34 | Auth provider | Better Auth | Preferred; PoC required before final approval |
| 35 | Auth fallback | Firebase Authentication | Fallback if PoC/operational fit fails |
| 36 | First-release login | Email/password | Confirmed |
| 37 | Future social login | Google later; Apple not near-term; phone not planned | Confirmed direction |
| 38 | Account linking | Explicit user-initiated; no automatic same-email linking | Confirmed policy |
| 39 | Auth maintenance | User is willing to be primary maintainer | Confirmed |
| 40 | Email | Resend for authentication email, subject to PoC/domain setup | Preferred/selected direction |
| 41 | Frontend hosting | Cloudflare Pages Free initially | Confirmed direction |
| 42 | Backend hosting | Render Free for development/pilot; Starter before sensitive production | Confirmed direction |
| 43 | Database plan | Neon Free initially; production plan review required | Confirmed direction |
| 44 | Media storage | Cloudflare R2 originals | Confirmed direction |
| 45 | Image transformation | Cloudflare Images Free initially | Confirmed direction |
| 46 | Backup location | Backblaze B2, independent of primary stores | Confirmed |
| 47 | Backup frequency | Database and media every 12 hours | Confirmed |
| 48 | Offline backup | Monthly encrypted external-drive copy recommended | Recommended; operational owner/routine pending |
| 49 | Source control | GitHub Free, private repo, single monorepo | Confirmed |
| 50 | Domain | `halani.in`, GoDaddy registrar, Cloudflare DNS | Preferred; purchase status pending |
| 51 | Death and household history | Close the deceased member's current assignment on date of death; archive empty households from Families while retaining records/history | Confirmed |
| 52 | Member photo moderation | Verified linked household members may submit photos; photos stay private pending admin/moderator approval; admins/moderators may publish directly | Confirmed |
| 53 | Member/household deletion | Routine removal archives with history intact; admin-only permanent deletion for accidental/test/duplicate records, with reason, blocked when meaningful history would be erased | Confirmed |
| 54 | Account closure | Account holders may request closure; sign-in/sessions are disabled immediately; Admin must complete a valid authenticated request and cannot deny it; permanently remove authentication identity/provider mapping, unlink the account, preserve member/household history, and retain an opaque local account tombstone for minimal audit attribution | Confirmed |
| 55 | Member-change request lifecycle | Requester may withdraw while Pending; Approved/Declined are terminal; follow-up requires a new request | Confirmed |
| 56 | Request withdrawal note | No reason required; requester may add an optional note and the withdrawal is audited | Confirmed |
| 57 | Published announcement retention | No automatic expiry; admin/moderator archive hides the post publicly but retains content, image references, and audit history; accidental unpublished drafts may be removed | Confirmed |
| 58 | Role management | Only admins may grant/revoke moderator/admin roles or change permissions; moderators cannot manage roles | Confirmed |
| 59 | Profile-photo retention | Pending until review; rejected files deleted from active storage after 30 days; current approved photo kept while member exists; replaced approved original kept up to 12 months; backups expire on their normal schedule | Confirmed |
| 60 | Audit retention | Retain minimal audit history indefinitely, restricted to admins/moderators; use opaque local account IDs as tombstones when authentication identities are deleted | Confirmed |
| 61 | Closed member-change request data | Erase proposed values and optional withdrawal notes at closure; retain minimal status and audit history | Confirmed |
| 62 | Deletion requests and backups | Promptly delete affected media from active storage; encrypted backups expire on normal retention schedule | Confirmed |

---

## 28. Change control and planning status

This document consolidates the product requirements and architecture decisions discussed through 15 November 2026. It is a planning baseline, not evidence that services have been purchased, infrastructure configured, code implemented, or tests passed.

When a decision changes:

1. Record the change and reason in the decision register or a dated change log.
2. Identify affected product rules, schema, APIs, deployment, security, and backup procedures.
3. Update dependent sections in this document.
4. Do not silently treat a proposed or conditional decision as confirmed.

**Current overall status:** product scope and major architecture direction are substantially defined. Detailed database schema, authorization matrix, API endpoint contracts, frontend design-system/state-management choices, final import templates, and the Better Auth proof of concept remain outstanding. The next active task is the Better Auth proof of concept described in Section 4.4.
