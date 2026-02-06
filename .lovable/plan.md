
# Product Audit: 3 Critical Business Logic & UX Gaps

After a thorough analysis of the BARYON carbon management platform, I've identified three significant issues that could confuse new users, break the user's flow, or weaken the product's value proposition.

---

## Issue #1: Goals Are Disconnected from Emissions Data Entry Flow

### The Problem
There is a critical gap between data entry and goal tracking that breaks the value chain.

**Current State:**
- Users enter emissions data via the Data Entry wizard (IndustryAwareWizard)
- Goals are created separately in the Goals page (EnhancedGoalForm)
- Goal progress is calculated by querying emissions_entries against baseline values

**The Flaw:**
1. When a user enters new emissions data, there is **no feedback** about how this affects their active goals
2. Users must manually navigate to the Goals page to see if they're on track
3. The Goal creation form asks for baseline emissions but doesn't offer to **pull existing data** from the system
4. There's no alert when emissions data pushes a goal "at risk" or "off track"

**User Impact:**
A VP of Sustainability enters monthly data for 6 months, never realizing their Net Zero goal has gone off-track until they randomly visit the Goals page. This undermines the core value proposition of "track Net Zero progress."

### Recommended Fix
- Show a "Goal Impact Preview" panel in the Data Entry review step showing affected goals
- Trigger notifications when new data changes goal status
- Pre-populate baseline emissions from actual data when creating goals

---

## Issue #2: The Organization-to-User Relationship is Fragile for New Signups

### The Problem
New users who sign up may end up in a broken state where they have no organization, which silently breaks most platform features.

**Current State:**
- Signup (AuthPage.tsx) captures company_name but doesn't automatically create an organization
- Organization creation appears to happen via a database trigger (create_user_organization function)
- Multiple services check for organization_id and fail silently if null

**Evidence from the database:**
Looking at organizations table, some have null industry values and generic names like "admin@admin.com's Organization", suggesting auto-creation works, but the onboarding flow has gaps.

**The Flaw:**
1. If the trigger fails or runs late, services like approval workflows, emissions entry with organization_id, and facility creation will fail
2. The goalsService queries by user_id (works), but approvalService queries by organization_id (may return empty results for users without orgs)
3. The OnboardingWizard tries to fetch organizationId but if null, it blocks industry selection with "Please select an industry" even when user has selected

**User Impact:**
A new user signs up, goes through onboarding, but all approval-related features show empty states. They can create emissions data but can't see it in the Approvals page, creating confusion about where their data went.

### Recommended Fix
- Add explicit organization creation in signup flow (don't rely solely on triggers)
- Add a blocking error state when organization is missing instead of silent failures
- Show "Setup incomplete" banner prompting organization setup when detected

---

## Issue #3: Approval Workflow Creates Data "Limbo" Without Clear Resolution Path

### The Problem
Entries submitted for approval can enter states where the submitter has no clear path forward.

**Current State:**
- Users enter data with approval_status = 'draft'
- Data is submitted for review to supervisors
- Supervisor can: Approve, Reject, or Request Changes
- The ApprovalQueue shows pending/approved/rejected/changes_requested entries

**The Flaw:**
1. When "Changes Requested" is selected, the **original submitter has no way to see their rejected entries** - the Approvals page is supervisor-focused
2. There's no notification system for the submitter to know changes were requested
3. There's no "Edit and Resubmit" workflow - users would need to know to go back to Data Entry, find the entry somehow, edit it, and resubmit
4. The entry is simply marked as "changes_requested" but the submitter can't respond, edit, or resubmit from the Approvals UI
5. The Data Entry page doesn't show existing entries at all - it's purely for new entries

**User Impact:**
An operations manager submits monthly emissions data. The supervisor requests changes. The operations manager never sees this feedback. The data sits in "changes_requested" limbo indefinitely, creating data gaps in reports.

### Recommended Fix
- Create "My Submissions" view showing user's own entries and their statuses
- Add email/in-app notifications when entry status changes
- Add "Edit Draft" capability from the entry list
- Create resubmit flow: Changes Requested → Edit → Resubmit → Pending Review

---

## Summary Impact Assessment

| Issue | Severity | User Segment Affected | Value Proposition Impact |
|-------|----------|----------------------|-------------------------|
| Goals Disconnected | High | All users tracking Net Zero | Weakens "track progress" claim |
| Organization Fragility | Critical | New signups (100% of growth) | Broken first experience |
| Approval Limbo | High | Organizations with approval workflows | Data quality & completeness |

These three issues, if addressed, would significantly improve the first-use experience, data completeness, and the core value delivery of the platform.
