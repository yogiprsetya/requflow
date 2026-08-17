# Requflow

Most API testing tools assume you have OpenAPI documentation. Many teams don't.

## Problem

Most API tools need OpenAPI documentation to work. But many APIs don't have docs.

If your API has a spec, you use Swagger UI. If not, you manually add every endpoint in Postman. There's no tool that works for both.

**The gap**: You either have docs or you don't. No middle ground.

## Demo

**Live demo**: [requflow.vercel.app](https://requflow.vercel.app)

## Key Features

- **Two modes**: Import OpenAPI specs OR add endpoints manually. Both work in the same workspace.
- **Same data structure**: Spec and manual endpoints use the same format. Easy to switch between them.
- **Runs in browser**: No backend needed. Your API keys stay private.
- **Multiple workspaces**: Organize by project. Each workspace is separate.
- **Saves locally**: All data stored in your browser (localStorage).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Client                          │
│  ┌──────────────┐    ┌─────────────────────────────────────┐    │
│  │  Next.js App │───▶│  Zustand Store (persisted)          │    │
│  │  (React 19)  │    │  - Workspaces                       │    │
│  │              │    │  - Imported specs (JSON)            │    │
│  │              │    │  - Manual endpoints                 │    │
│  └──────┬───────┘    │  - Request history (planned)        │    │
│         │            └─────────────────────────────────────┘    │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Request Executor (fetch API)                            │   │
│  │  - Build URL from params/path/query                      │   │
│  │  - Merge headers (spec defaults + user overrides)        │   │
│  │  - Execute request                                       │   │
│  │  - Parse response (JSON detection, timing, size)         │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Target API   │
                    │  (any origin) │
                    └───────────────┘
```

**Why run in browser?**

No backend to deploy. Your API keys stay private. Fast requests.

Downside: CORS errors. You need to configure CORS on your API or use a browser extension.

**Later**: Add optional proxy server for CORS and logging.

## Key Design Decisions & Trade-offs

### 1. Same data structure for both modes

Spec and manual endpoints use the same data type. They have a `source_type` field (`spec` or `manual`).

Other options (separate stores, different components) would copy the same code many times.

**Why**: Mix both types in one workspace. No duplicate code. Easy to add "Infer Spec" feature later.

**Downside**: Slightly more complex types. But TypeScript handles this well.

### 2. Store data in browser

All data saved in localStorage (browser storage). Uses Zustand for state management.

Other options (database, cloud) need authentication, servers, and are slower.

**Why**: No setup needed. Data stays private. Fast switching between workspaces.

**Downside**: Only works on one device. 5-10MB limit. Good for demo. Real apps would add cloud sync.

### 3. Save full spec as JSON string

Store the complete spec as one JSON string. Don't split it into separate endpoints.

Keeps all info (servers, security, etc). Easy to re-import (just replace the string). Can validate anytime.

**Downside**: Uses more storage. But specs are usually less than 1MB.

### 4. No proxy server yet

Requests run directly in browser using `fetch()`. CORS errors can happen.

Proxy server needs backend, hosting, and config. Too complex for MVP. Users can fix CORS themselves.

**Add proxy when**: Users say CORS is blocking them. Or need logging/auditing.

**Fix**: CORS solutions in Getting Started section.

### 5. Manual mode has no validation

Manual endpoints only store basic info (method, path, headers, body). No JSON Schema validation.

Manual mode is for speed. Test APIs quickly without writing schemas. Add validation later with "Infer Spec" feature.

**Downside**: No autocomplete or validation. OK because developers already know their API.

## Tech Stack

| Layer          | Technology                           | Why                                                                |
| -------------- | ------------------------------------ | ------------------------------------------------------------------ |
| **Framework**  | Next.js 16                           | App Router, React Server Components, built-in routing              |
| **UI Library** | React 19                             | Latest concurrent features, improved hydration                     |
| **Styling**    | Tailwind CSS 4                       | Utility-first, rapid prototyping, consistent design tokens         |
| **Components** | Base UI (Headless) + shadcn patterns | Accessible primitives without runtime overhead                     |
| **State**      | Zustand                              | Lightweight (1KB), no boilerplate, built-in persistence middleware |
| **Icons**      | Lucide React                         | Tree-shakeable, consistent stroke width, actively maintained       |
| **Validation** | Custom (YAML parser + JSON Schema)   | OpenAPI 3.x validation without heavy dependencies                  |
| **Testing**    | Node.js test runner (`tsx --test`)   | Zero-config, native ESM support, fast feedback                     |

**Why these choices**:

- **Base UI over Radix**: Better TypeScript support. Smaller size.
- **No Axios**: Native `fetch()` is enough. Axios adds 13KB we don't need.
- **YAML parsing**: `yaml` package handles both JSON and YAML files.

## Getting Started

### What you need

- Node.js 20 or higher
- pnpm 8 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/requflow.git
cd requflow

# Install dependencies
pnpm install
```

### Environment Variables

None required. All data is stored client-side.

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Start

1. Click **Import Spec** in the navbar
2. Choose **Upload file** or **Import from URL**
3. Try the live demo with a public OpenAPI spec (e.g., `https://petstore3.swagger.io/api/v3/openapi.json`)
4. Endpoints appear in the sidebar—click any endpoint to see the auto-generated request builder

### Fix CORS Errors

If you see CORS errors:

1. **Own the API?** Add your URL to `Access-Control-Allow-Origin` header
2. **Testing locally?** Install CORS Unblock (Chrome) or CORS Everywhere (Firefox)

⚠️ **Never disable CORS on real websites**

## Project Structure

```
requflow/
├── app/
│   ├── (platform)/          # Main application routes (workspace/playground)
│   │   ├── constant.ts      # HTTP methods, event names, defaults
│   │   ├── types.ts         # Core domain types (Workspace, Endpoint, Request/Response)
│   │   ├── workspace-store.ts  # Zustand store with persistence
│   │   ├── navbar.tsx       # Top bar (brand, import spec CTA, avatar/notifications)
│   │   ├── sidebars.tsx     # Endpoint explorer (grouped by tag, search/filter)
│   │   ├── sidedock.tsx     # Left rail (toggle sidebar, create workspace, env switcher)
│   │   ├── playground/      # Request builder + response viewer + tabs
│   │   └── utils/           # OpenAPI parsing, request execution, import/export
│   ├── globals.css          # Tailwind base + custom CSS variables
│   └── layout.tsx           # Root layout (theme provider, fonts)
├── components/
│   ├── ui/                  # Atomic components (Button, Dialog, Input, Tabs, etc.)
│   └── common/              # Composed components (JsonEditor, HighlightJson, SearchField)
├── lib/
│   ├── openapi-validator.ts # OpenAPI 3.x spec validation
│   └── css.ts               # Tailwind merge utility
├── tests/                   # Unit tests (workspace store, helpers, import/export)
├── SPEC.md                  # UI layout specification
├── CLAUDE.md                # Coding conventions and architecture principles
└── TODO.md                  # Feature backlog and known gaps
```

**Key files**:

- `workspace-store.ts`: Single source of truth for workspace data
- `utils/openapi-import.ts`: File upload, URL fetch, validation, parsing
- `utils/request-executor.ts`: Request execution, response parsing, error handling
- `playground/request-builder.tsx`: Dual-mode request builder

## What's Not Built Yet

These features are **not included on purpose**. They're for later, not missing work:

### Request History & Replay

Save past requests and run them again. Not built yet because it's complex and doesn't prove the main idea works. See `TODO.md` (P0).

### Schema Validation for Manual Endpoints

Validation and autocomplete for manual endpoints. Not built yet because it would slow down testing. Later: "Infer Spec" feature (learn from history → create schema).

### Code Snippet Generator

Export as cURL, fetch, Axios, Python, etc. Nice to have but not needed to test the main idea. See `TODO.md` (Phase 4).

### Diff Mode for Spec Updates

Show what changed when re-importing. Not built yet. Need to see if users update specs often. Now: re-import replaces everything (simple).

### Authentication Presets

Built-in OAuth2, API keys, Bearer tokens. Not built yet because every API is different. Now: add `Authorization` header manually.

### Proxy Server for CORS

Backend to fix CORS. Not built yet to keep things simple. Now: fix CORS yourself or use browser extension (see Getting Started).

**Why**: These are choices, not forgotten work. Each will be built when users ask for it or data shows it's needed.

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/workspace-store.test.ts
```

**Test coverage**:

- ✅ Workspace store (create, rename, delete, switch)
- ✅ Import/export workspace data
- ✅ Helper functions (URL building, header merging, parameter grouping)
- ⏳ OpenAPI parsing (planned)
- ⏳ Request execution (planned—requires mock fetch)

## Deployment

Client-side only—deploy to any static host (Vercel, Netlify, Cloudflare Pages).

```bash
pnpm build  # Production build
pnpm start  # Test locally
```

**Vercel** (recommended): Push to GitHub → Import in dashboard → Deploy (zero config).

## Contributing

This is a portfolio project. It shows dual-mode design, clean code structure, and smart scope choices.

**If you're reviewing for hiring**, look at:

1. **Design choices** (Key Design Decisions) - why I chose this approach
2. **Code quality** (`CLAUDE.md`) - coding style and patterns
3. **Scope control** (What's Not Built Yet) - what I left out and why

Pull requests welcome. This is a learning project, not production code.

## Author

**[YOUR NAME]**  
[LinkedIn](https://linkedin.com/in/yourprofile) • [GitHub](https://github.com/yourusername)

_Built to show product thinking: found a real problem (testing APIs without docs), designed a solution (dual-mode), and built an MVP with clear limits._

## License

MIT License - feel free to use this code for learning or as a starting point for your own projects.

---
