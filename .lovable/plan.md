## Goal
Let you (the creator) temporarily unlock the demo account (`user@yopmail.com`) so you can edit/update its data, without exposing that toggle to anyone else.

## Approach
A server-controlled flag, toggled from your own Settings screen, that the demo user's session reads to decide whether read-only restrictions apply.

### Why server-side (not localStorage)
A localStorage toggle would let any visitor flip it in DevTools and bypass the demo lock. The flag must live in the DB and only your account may write it; the demo session only reads it.

## Technical Details

### 1. New table `public.app_settings`
Single-row key/value config table.
- `key text primary key`
- `value jsonb`
- GRANTs: `SELECT` to `authenticated` (so demo session can read the flag), `ALL` to `service_role`.
- RLS:
  - SELECT: allowed to any authenticated user (flag is non-sensitive).
  - INSERT/UPDATE/DELETE: blocked at RLS level — only the edge function (service role) can write, and it checks the caller is you.

Seed row: `('demo_editable', 'false'::jsonb)`.

### 2. Edge function `admin-settings`
- `GET` → returns `{ demo_editable: boolean }` (any authenticated user).
- `POST` → updates `demo_editable`. Hardcoded allow-list: only `creator` email (your real account — you'll tell me which email) may call this; everyone else gets 403. Demo user is explicitly rejected.

### 3. Settings page (`src/pages/Settings.tsx`)
- New "Creator Controls" card, rendered only when `user.email === <creator email>`.
- Toggle: "Allow demo account to edit data". Calls `admin-settings` POST.

### 4. Demo-mode hook (`src/lib/demo-user.ts`)
- Add `useDemoEditable()` that fetches the flag once on mount and subscribes to changes.
- Add `useDemoReadOnly()` = `useIsDemoUser() && !demoEditable`.
- Replace existing `useIsDemoUser()` call sites that gate UI (Dashboard add button, Statistics delete/copy/import, AddParticulars fieldset + submit guard, warning banner) with `useDemoReadOnly()`.

When you flip the toggle ON and sign in as the demo user, all restrictions disappear and you can edit normally. Flip OFF to restore demo behavior.

## Open question
What's the email of your creator/admin account? I'll hardcode it as the only address allowed to toggle the flag. (If you'd rather, I can use a `CREATOR_EMAIL` edge-function secret instead of hardcoding.)
