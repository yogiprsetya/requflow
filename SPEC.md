# SPEC.md — UI Layout

> Layout specification for **SpecLess** (API Playground). This document defines the structural regions of the application shell and their responsibilities. Refer to `spec_api_playground.md` for product/data/API spec — this file covers UI structure only.

---

## 1. Layout Overview

The application shell is divided into three persistent regions:

```
┌─────────────────────────────────────────────────────────┐
│                       Navbar                            │
┌────┬───────────────┬────────────────────────────────────┐
│    │               │                                    │
│ D  │   Sidebar     │              Main                  │
│ o  │  (Endpoint    │         (Playground Area)          │
│ c  │   Explorer)   │                                    │
│ k  │               │                                    │
│    │               │                                    │
└────┴───────────────┴────────────────────────────────────┘
```

| Region      | Width                           | Persistent?         | Purpose                                                                         |
| ----------- | ------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| **Dock**    | Fixed, narrow (icon-rail width) | Always visible      | Global controls: toggle sidebar, create new workspace                           |
| **Sidebar** | Fixed, collapsible              | Toggleable via Dock | Endpoint Explorer — browse/search endpoints from both Spec Mode and Manual Mode |
| **Main**    | Fluid, fills remaining space    | Always visible      | Playground — request builder, response viewer, active endpoint detail           |

---

## 2. Dock

The leftmost, narrow vertical rail. Always visible regardless of sidebar state — this is the anchor for global, workspace-level actions (not endpoint-specific actions, which belong in Sidebar or Main).

### Contents

1. **Toggle Sidebar button**
   - Icon button, collapses/expands the Sidebar (Endpoint Explorer).
   - When collapsed, Main expands to fill the freed space.
   - State persists per session (localStorage/session state — not server-persisted, since it's a UI preference not app data).

2. **Create New Workspace button**
   - Opens a modal/panel to create a new workspace.
   - A workspace is the top-level grouping that contains endpoints from both Spec Mode (imported specs) and Manual Mode (manually added endpoints) — see `spec_api_playground.md` section 3.1 and the `endpoints.workspace_id` field.
   - After creation, the new workspace becomes active and Sidebar refreshes to show its (initially empty) endpoint list.

### Out of Scope for Dock

- No endpoint-level actions here (e.g., "add endpoint" lives in Sidebar, not Dock).
- No settings/profile — keep Dock minimal; if user settings are added later, they get their own icon here, but this is not part of MVP scope.

---

## 3. Sidebar — Endpoint Explorer

Shows the list of endpoints belonging to the **active workspace**, sourced from both modes.

### Structure

```
Sidebar
├── Workspace switcher (dropdown, shows active workspace name)
├── Search/filter input
├── [+ Add Endpoint] — opens choice: "Import Spec" vs "Add Manually"
├── Grouped endpoint list
│   ├── Group: by OpenAPI tag (for Spec Mode endpoints)
│   ├── Group: "Manual" (for Manual Mode endpoints, until inferred/tagged)
│   └── Each item: METHOD badge + path, click to open in Main
└── (Fase 4) Environment switcher (dev/staging/prod)
```

### Behavior Notes

- Endpoints from Spec Mode and Manual Mode appear in the **same list**, visually distinguished by a small badge/icon indicating `source_type` (`spec` vs `manual`) — consistent with the unified `endpoints` data model.
- Clicking an endpoint loads its detail into Main; it does not open a new view/route by default (single-pane focus, avoids tab-sprawl complexity for MVP).
- Search/filter matches on path, method, and tag/group name.
- Collapsible per group (tag), so large specs with many endpoints stay navigable.

---

## 4. Main — Playground Area

The primary work area. Content depends on what's selected in Sidebar (or empty state if nothing selected yet).

### States

1. **Empty state** (no endpoint selected)
   - Shown when a workspace has no endpoints yet, or none is selected.
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

## 5. Responsive Behavior (MVP scope note)

- MVP targets desktop/wide viewports primarily (this is a developer tool, not consumer-facing).
- Sidebar auto-collapses (via the same Dock toggle logic) below a defined breakpoint, but a dedicated mobile layout is explicitly **out of scope** for MVP — note this in README as a known limitation rather than half-implementing it.

---

## 6. Component Mapping to React Design System (Repo #2)

| UI Element                      | Design System Component to Reuse                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Dock icon buttons               | Button (icon variant)                                                                                                  |
| Workspace switcher              | Select/Dropdown                                                                                                        |
| Endpoint list items             | List item / custom composed from Badge + Text primitives                                                               |
| Search input                    | Input                                                                                                                  |
| Request builder tabs            | Tabs                                                                                                                   |
| Key-value editors (Manual Mode) | Input + composable row pattern (build as new DS component if not existing — candidate for a small addition to Repo #2) |
| Response viewer                 | Table (headers), Code block (body) — Code block may need to be added to Design System if not already present           |

> If a needed component doesn't exist yet in the Design System, add it there first (with its own test + story), then consume it here — do not build one-off styled components inside SpecLess that duplicate what belongs in the shared library. This keeps the "ekosistem yang koheren" narrative intact for portfolio purposes.
