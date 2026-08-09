# SPEC.md — UI Layout

> Layout specification for **SpecLess** (API Playground). This document defines the structural regions of the application shell and their responsibilities. Refer to `spec_api_playground.md` for product/data/API spec — this file covers UI structure only.

---

## 1. Layout Overview

The application shell is divided into four persistent regions:

```
┌─────────────────────────────────────────────────────────────┐
│                          Navbar                             │
├────┬──────────────┬─────────────────────────────────────────┤
│    │              │                                         │
│ D  │   Sidebar    │              Main                       │
│ o  │  (Endpoint   │         (Playground Area)               │
│ c  │   Explorer)  │                                         │
│ k  │              │                                         │
│    │              │                                         │
└────┴──────────────┴─────────────────────────────────────────┘
```

| Region      | Width/Height                    | Persistent?         | Purpose                                                                               |
| ----------- | ------------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| **Navbar**  | Fixed, spans full width, top    | Always visible      | Brand identity (left) + global user/account actions and primary import action (right) |
| **Dock**    | Fixed, narrow (icon-rail width) | Always visible      | Global controls: toggle sidebar, create new workspace                                 |
| **Sidebar** | Fixed, collapsible              | Toggleable via Dock | Endpoint Explorer — browse/search endpoints from both Spec Mode and Manual Mode       |
| **Main**    | Fluid, fills remaining space    | Always visible      | Playground — request builder, response viewer, active endpoint detail                 |

### Workspace Model

- The playground supports multiple workspaces.
- Each workspace is an independent top-level container for its own imported and manually added endpoints.
- Exactly one workspace is active at a time; the active workspace determines the endpoints shown in the Sidebar and the endpoint context loaded in Main.
- Creating or selecting a workspace must not modify endpoints in any other workspace.
- The active workspace is restored when the user returns to the application. Workspace data and names are persisted according to the application's storage strategy.

---

## 2. Navbar

Full-width bar fixed at the top of the application shell. Divided into two sides — left for brand identity, right for global user/account and primary actions.

### Structure

```
┌──────────────┬───────────────────────────────────  [Avatar] [Notif] [Import Spec] ─┐
│  Brand/Logo   │                                                                       │
└──────────────┴─────────────────────────────────────────────────────────────────────┘
```

### Left Side — Brand

- App logo/wordmark ("SpecLess").
- Click behavior: navigates to home/default workspace view (standard convention, not a functional requirement to build custom logic around beyond routing).

### Right Side — Actions

Ordered **right to left**: Avatar → Notification → Import Spec button.

Listed here in reading order (left to right, i.e. the order they appear in the DOM/layout) for implementation clarity:

1. **Import Spec button** (rightmost)
   - Primary CTA, visually the most prominent element on the right side (e.g. filled/solid button style vs icon-only for the other two).
   - **Trigger behavior**: opens the **Import OpenAPI Spec dialog** (modal) — does not navigate away from the current view.
   - See Section 2.1 for dialog spec.

2. **Notification icon**
   - Icon button, opens a notification panel/dropdown on click (e.g. spec refresh results, infer-spec completion, import errors surfaced asynchronously).
   - Badge/dot indicator when there are unread notifications.
   - Full notification content/backend is out of MVP scope — for MVP, this can be a static/empty-state panel; do not block Navbar implementation on building a full notification system.

3. **Avatar** (leftmost of the three, i.e. closest to center)
   - User avatar, opens account dropdown on click (profile, workspace settings link, logout).
   - For MVP without full auth, this can render a placeholder/default avatar — do not gate Navbar layout work on auth being fully implemented.

### Navbar vs Dock — Division of Responsibility

To avoid overlap/confusion with the Dock (Section 3):

- **Navbar** = identity + account-level + the single most important global action (Import Spec).
- **Dock** = workspace-level structural controls (toggle sidebar, create workspace).
  Import Spec lives in Navbar rather than Dock because it's the primary top-level action for the whole app (not workspace-management), and benefits from maximum visual prominence at all times, including when Sidebar is collapsed.

---

### 2.1 Import Spec Dialog

Triggered exclusively by the **Import Spec** button in Navbar.

**Purpose**: entry point for adding endpoints via Spec Mode (see `spec_api_playground.md` Section 3.1 — this dialog is the UI for that flow; Manual Mode entry happens separately, from the Sidebar's "+ Add Endpoint" action, not from this dialog).

**Contents**:

- Two input methods, presented as tabs or a toggle within the dialog:
  1. **Upload file** — file picker, accepts `.json` / `.yaml` / `.yml`.
  2. **Import from URL** — text input for a spec URL, with a "Fetch" action.
- **Workspace target selector** — dropdown to choose which workspace the imported spec's endpoints should be added to (defaults to the currently active workspace).
- Primary action: **Import** button (disabled until a valid file/URL is provided).
- Secondary action: **Cancel** (closes dialog, discards input).

**On successful import**:

- Dialog closes.
- Sidebar refreshes to show the newly parsed endpoints under the target workspace, grouped by tag (per Section 4 grouping rules).
- A confirmation toast/notification is triggered (surfaces in the Notification panel per Section 2 item 2).

**On failure** (malformed spec, unreachable URL, parse error):

- Dialog remains open, shows inline error message — do not close the dialog and silently fail.
- This ties back to the "Spec parsing edge cases" documented in `spec_api_playground.md` Section 6 (invalid/malformed spec handling) — the dialog's error state is the UI surface for that logic.

---

## 3. Dock

The leftmost, narrow vertical rail. Always visible regardless of sidebar state — this is the anchor for global, workspace-level actions (not endpoint-specific actions, which belong in Sidebar or Main).

### Contents

1. **Toggle Sidebar button**
   - Icon button, collapses/expands the Sidebar (Endpoint Explorer).
   - When collapsed, Main expands to fill the freed space.
   - State persists per session (localStorage/session state — not server-persisted, since it's a UI preference not app data).

2. **Create New Workspace button**
   - Opens a modal/panel to create a new workspace.
   - A workspace is the top-level grouping that contains endpoints from both Spec Mode (imported specs) and Manual Mode (manually added endpoints) — see `spec_api_playground.md` section 3.1 and the `endpoints.workspace_id` field.
   - The creation flow requires a workspace name.
   - After creation, the new workspace becomes active and Sidebar refreshes to show its initially empty endpoint list.

3. **Workspace management**
   - Users can rename the active workspace from the workspace switcher or its workspace actions menu.
   - Renaming updates the workspace name everywhere it is displayed without changing its ID, endpoints, or request history.
   - The rename action must reject an empty name and preserve the previous name when validation fails.

### Out of Scope for Dock

- No endpoint-level actions here (e.g., "add endpoint" lives in Sidebar, not Dock).
- No settings/profile — keep Dock minimal; if user settings are added later, they get their own icon here, but this is not part of MVP scope.

---

## 4. Sidebar — Endpoint Explorer

Shows the list of endpoints belonging to the **active workspace**, sourced from both modes.

### Structure

```
Sidebar
├── Workspace switcher (dropdown, shows active workspace name)
│   ├── List of all workspaces
│   ├── Select workspace
│   └── Rename active workspace
├── Search/filter input
├── [+ Add Endpoint] — opens choice: "Import Spec" vs "Add Manually"
├── Grouped endpoint list
│   ├── Group: by OpenAPI tag (for Spec Mode endpoints)
│   ├── Group: "Manual" (for Manual Mode endpoints, until inferred/tagged)
│   └── Each item: METHOD badge + path, click to open in Main
└── (Fase 4) Environment switcher (dev/staging/prod)
```

### Behavior Notes

- The workspace switcher lists all available workspaces and clearly marks the active workspace.
- Selecting a workspace changes the active workspace and refreshes the Sidebar and Main context to that workspace's endpoints. If the selected workspace has no endpoints, show the empty state.
- Workspace switching must preserve each workspace's endpoint data independently; unsaved request-builder input may be discarded or preserved according to the application's state-management decision, but this behavior must be consistent.
- Workspace names are user-editable. Renaming is available without recreating the workspace and does not alter references based on the workspace ID.
- Endpoints from Spec Mode and Manual Mode appear in the **same list**, visually distinguished by a small badge/icon indicating `source_type` (`spec` vs `manual`) — consistent with the unified `endpoints` data model.
- Clicking an endpoint loads its detail into Main; it does not open a new view/route by default (single-pane focus, avoids tab-sprawl complexity for MVP).
- Search/filter matches on path, method, and tag/group name.
- Collapsible per group (tag), so large specs with many endpoints stay navigable.

---

## 5. Main — Playground Area

The primary work area. Content depends on what's selected in Sidebar (or empty state if nothing selected yet).

### States

1. **Empty state** (no endpoint selected)
   - Shown when the active workspace has no endpoints yet, or none is selected.
   - Prompts the two entry actions: "Import an OpenAPI spec" or "Add an endpoint manually" — mirrors the dual-mode value proposition front and center.

2. **Endpoint selected — Spec Mode**
   - Auto-generated request builder form (from schema).
   - Tabs/sections: Params, Headers, Body, (Fase 4: Auth/Environment).
   - Response viewer below/beside the builder after execution.

3. **Endpoint selected — Manual Mode**
   - Manual request builder (method dropdown, URL bar, key-value editors for headers/params, raw JSON or form body editor) — same visual pattern as Spec Mode builder where possible, so switching between modes feels consistent, not like two different tools bolted together.
   - Response viewer identical component to Spec Mode (shared, not duplicated — see CLAUDE.md "dual-mode parity" principle).

4. **History view** (when a past request is opened from history instead of the live endpoint)
   - Read-only replay of a past request/response, with a "Re-run" action that loads it back into the active builder.

### Shared Sub-components (used across states)

- **Response Viewer** — status, headers, body (formatted), timing. Identical component regardless of mode.
- **Request Builder Shell** — shared layout wrapper (tabs for Params/Headers/Body) with either auto-generated fields (Spec Mode) or manual key-value inputs (Manual Mode) slotted in.

---

## 6. Responsive Behavior (MVP scope note)

- MVP targets desktop/wide viewports primarily (this is a developer tool, not consumer-facing).
- Sidebar auto-collapses (via the same Dock toggle logic) below a defined breakpoint, but a dedicated mobile layout is explicitly **out of scope** for MVP — note this in README as a known limitation rather than half-implementing it.

---

## 7. Component Mapping to React Design System (Repo #2)

| UI Element                      | Design System Component to Reuse                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Dock icon buttons               | Button (icon variant)                                                                                                  |
| Workspace switcher              | Select/Dropdown                                                                                                        |
| Endpoint list items             | List item / custom composed from Badge + Text primitives                                                               |
| Search input                    | Input                                                                                                                  |
| Request builder tabs            | Tabs                                                                                                                   |
| Key-value editors (Manual Mode) | Input + composable row pattern (build as new DS component if not existing — candidate for a small addition to Repo #2) |
| Response viewer                 | Table (headers), Code block (body) — Code block may need to be added to Design System if not already present           |
| Navbar avatar/notif icons       | Button (icon variant) + Badge (unread dot)                                                                             |
| Import Spec dialog              | Modal/Dialog + Tabs (upload vs URL) + Input + Select (workspace target)                                                |

> If a needed component doesn't exist yet in the Design System, add it there first (with its own test + story), then consume it here — do not build one-off styled components inside SpecLess that duplicate what belongs in the shared library. This keeps the "ekosistem yang koheren" narrative intact for portfolio purposes.
