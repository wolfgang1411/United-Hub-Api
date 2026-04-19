# Retrieval App UI/UX Handoff

Date: 2026-04-03
Audience: UI/UX Designer, Frontend Developer, Product

## 1) Product Goal

Build a retrieval web app where users can:

1. Login
2. See only targets they are allowed to access
3. Click a target to view related apps
4. Click an app to view chats
5. Click a chat to view messages

The experience should prioritize fast investigation, clear hierarchy, and low cognitive load.

## 2) Access Model (Backend-Aligned)

Roles:

- SUPERADMIN: Can access all targets
- USER: Can access only linked targets

Source of truth:

- Access is enforced by backend; frontend should only display what backend returns.
- If user tries to access an unlinked target by URL, backend returns 403.

## 3) Information Architecture

Primary flow:

1. Login
2. Targets list
3. Apps list (scoped by selected target)
4. Chats list (scoped by target + app)
5. Message thread/detail view

Recommended layout:

- Left column: Targets
- Middle-left column: Apps
- Middle-right column: Chats
- Right panel: Messages

Mobile behavior:

- Use drill-down navigation (one pane at a time)
- Preserve breadcrumb: Target > App > Chat

## 4) Screen-by-Screen UX Requirements

### A) Login

Fields:

- Email
- Password

Actions:

- Sign In
- Optional: Remember me

Validation:

- Email format
- Password minimum length feedback

Outcomes:

- Success: store access token and route to Targets
- Failure: inline error message from API

### B) Targets Screen

Purpose:

- Show only accessible targets

Item content:

- Device ID
- Created date
- Optional activity chip (based on summary fetch)

Interactions:

- Click target selects active target
- Trigger Apps load and optional target summary

States:

- Loading skeleton
- Empty state: No targets linked
- Error state with retry

### C) Apps Screen

Purpose:

- Show apps with message/notification activity under selected target

Item content:

- App name
- Package name (secondary)

Interactions:

- Search apps by name/package
- Click app to load chats

States:

- Empty: No apps for this target
- Error: Could not load apps

### D) Chats Screen

Purpose:

- Show chat channels for selected target/app

Item content:

- Chat title
- Last activity timestamp
- Message count

Interactions:

- Search chats by title
- Sort: Most recent first (default)
- Pagination or infinite scroll

States:

- Empty: No chats found
- Error with retry

### E) Messages Screen

Purpose:

- Investigate conversation details quickly

Message row content:

- Direction badge: Incoming/Outgoing
- Message text
- Time
- Event type
- Noise marker when possibleNoise is true

Message toolbar filters:

- Date range (from/to)
- Direction: All, Incoming, Outgoing
- Search text (client-side)
- Noise filter checkbox: Hide possible noise

Noise behavior:

- Checkbox OFF: Show all messages
- Checkbox ON (current app default): Hide messages where possibleNoise = true
- Messages API supports server-side filtering with possibleNoise=false while preserving the same UI control

States:

- Empty: No messages for current filters
- Error: Failed to load messages

## 5) API Endpoints to Use

Auth:

- POST /api/auth/login
- POST /api/auth/refresh

Retrieval:

- GET /api/targets
- GET /api/apps
- GET /api/chats?page=&pageSize=&targetId=&packageName=
- GET /api/messages?page=&pageSize=&targetId=&packageName=&chatTitle=&possibleNoise=&direction=&from=&to=
- GET /api/targets/:targetId/summary

Notes:

- Authorization header required for retrieval endpoints
- Start from targets, then progressively apply target/app/chat filters

## 6) Suggested Frontend State Model

Global:

- auth: user, accessToken, refreshToken
- currentTargetId
- currentAppPackage
- currentChatTitle

Per-view query state:

- chats: page, pageSize, packageName, targetId
- messages: page, pageSize, targetId, packageName, chatTitle, possibleNoise, direction, from, to
- messagesUiOnly: textSearch

## 7) Interaction Quality Bar

Must-have UX quality:

- Keep context visible: active target/app/chat always shown
- Filters persist while navigating back
- URL reflects state for shareable investigations
- Keyboard-friendly list navigation
- Response feedback under 300ms for local interactions where possible

## 8) Acceptance Criteria (V1)

1. User logs in successfully and sees only authorized targets.
2. Selecting target loads apps.
3. Selecting app loads chats.
4. Selecting chat loads messages.
5. Direction and date filters work for messages.
6. Noise checkbox hides possibleNoise messages using the messages API filter while keeping the same UI behavior.
7. Empty/loading/error states are implemented on all main views.
8. Unauthorized deep links are handled gracefully.

## 9) Improved Prompt for UI/UX Designer

Use this prompt with your designer or AI design assistant:

Design a Retrieval Web App for investigation workflows.

Context:

- Users authenticate with email/password.
- There are two roles: SUPERADMIN (all targets) and USER (only linked targets).
- Main journey is hierarchical: Target > App > Chat > Messages.

Design goals:

- Fast analysis of communication data.
- Very clear hierarchy and context persistence.
- Low friction filtering for investigators.

Required screens:

1. Login
2. Targets list
3. Apps list (scoped by selected target)
4. Chats list (scoped by selected target and app)
5. Messages view

Required message filters:

- Date range
- Direction (incoming/outgoing)
- Text search
- Noise checkbox: Hide possible noise messages

Behavior details:

- Noise checkbox defaults to ON in the current Flutter implementation.
- When ON, hide items where possibleNoise = true.
- All retrieval pages require auth token.
- Show strong empty/loading/error states.
- Ensure mobile drill-down UX with breadcrumb context.

Output expected from you:

- User flow diagram
- Low-fidelity wireframes for all screens
- High-fidelity design for desktop and mobile
- Component list with states (default/hover/active/empty/error/loading)
- Clickable prototype for the full journey

## 10) Implementation Note for Frontend

Current messages API exposes a dedicated possibleNoise query parameter. Keep text search client-side, but send possibleNoise=false when the UI is hiding noise.
