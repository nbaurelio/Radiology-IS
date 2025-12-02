Purpose
-------
This file gives concise, actionable guidance for an AI coding agent (Copilot/assistant) to be immediately productive in this repository.

**Big picture**
- **Frontend app**: a React single-page app (entry: `main.jsx`, `App.jsx`) likely built with a Vite/modern toolchain — check `package.json` for exact scripts.
- **Service layer**: local API wrappers live in `src/services/*.js` (e.g. `patientService.js`, `reportService.js`, `studyService.js`) — these encapsulate data-access and should be the first place to add new backend interactions.
- **Auth & persistence**: `src/lib/supabase.js` provides the Supabase client used across contexts and services for auth, DB, and realtime features.
- **State management**: lightweight React Contexts in `src/contexts/` (e.g. `AuthContext.jsx`, `NotificationContext.jsx`) manage global state instead of Redux.
- **Routing & guards**: `src/components/ProtectedRoute.jsx` is used to protect routes; pages live in `src/pages/`.

Key files & locations (quick reference)
- `src/lib/supabase.js`: Supabase client, check for environment variable usage. Do not commit secrets.
- `src/contexts/AuthContext.jsx`: authentication flow and current-user shape.
- `src/contexts/NotificationContext.jsx` + `services/notificationService.js`: notification delivery pattern.
- `src/services/*.js`: where API calls and remote logic live.
- `src/components/ProtectedRoute.jsx`: how route protection is implemented (used across pages).
- `src/utils/pdfGenerator.js`: example of generating client-side artifacts; follow for similar features.
- `src/pages/UploadDicom.jsx`, `src/pages/DicomViewerPage.jsx`: DICOM-specific flows — keep DICOM handling isolated to these pages unless adding shared viewer logic.

Conventions and patterns to follow
- Services export small, focused functions (e.g., `getPatients`, `createReport`) and are imported directly into pages or contexts.
- Context providers wrap the app and expose simple APIs: read `AuthContext.jsx` to match method names and user object fields when authenticating or checking permissions.
- Prefer adding new domain logic to `src/services/` and tests near those modules rather than placing API calls directly in components.
- UI components are small and presentation-focused under `src/components/`; stateful logic belongs in pages or contexts.
- Use existing helper `src/utils/pdfGenerator.js` as the canonical implementation for client PDF export.

Developer workflows (what an agent should run/verify)
- Check `package.json` for the exact scripts. Typical commands to try locally:
  - `npm install`
  - `npm run dev` (start dev server) or `npm start` depending on scripts
  - `npm run build` (production build)
  - `npm run preview` (if using Vite)
- When unsure, open `package.json` before proposing run commands.

Security & secrets
- All Supabase keys and other secrets must come from environment variables. Confirm any new code reads from `process.env` or `import.meta.env` (Vite) rather than hardcoding.
- Do not add or expose credentials in new commits.

Adding features (practical checklist)
- Add low-level API calls to `src/services/<domain>Service.js`.
- Expose cross-cutting behavior through contexts in `src/contexts/` (e.g., notifications, auth).
- Use `ProtectedRoute.jsx` for routes that require authentication.
- Add small, focused unit tests close to modified modules (repo currently has no tests — confirm before adding test frameworks).

Debugging notes
- Use browser DevTools and the console for React state and network inspection.
- For Supabase realtime or auth issues, inspect `src/lib/supabase.js` for client options and confirm env vars.

Agent-specific preferences
- Prefer small, incremental edits and create PRs against the current branch. Keep changes minimal and consistent with existing style.
- When making changes that affect runtime credentials or deployment (e.g., env var names), add a short note in the PR description about required environment variables.
- Explicit model preference: this document does not enable external models. If an agent should prefer a model for reasoning/code generation, annotate PRs with the recommended model (e.g., "recommend model: GPT-5 mini") — enabling models for all clients is an administrative action outside this repository.

Examples (copy-paste snippets you may need)
- Import supabase client: `import supabase from '../lib/supabase'`
- Use a service: `import { getPatients } from '../services/patientService'`
- Wrap app with providers (see `main.jsx` / `App.jsx`) and follow provider props.

If anything in this file is unclear or you'd like me to expand examples (e.g., a short checklist for submitting PRs, or automatic code formatting rules), tell me which area to expand and I'll iterate.
