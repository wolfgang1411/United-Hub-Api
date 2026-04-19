# Retrieval App UI/UX Prompt

Design a modern Retrieval Web App for investigation workflows.

Product context:

- Users login with email and password.
- Roles:
  - SUPERADMIN can access all targets.
  - USER can access only linked targets.
- Navigation flow is strict hierarchy: Target -> App -> Chat -> Messages.

What the UI must support:

1. Login screen
2. Targets list
3. Apps list filtered by selected target
4. Chats list filtered by selected target and app
5. Messages view filtered by selected target, app, and chat

Required filters in Messages view:

- Date range (from/to)
- Direction (incoming/outgoing)
- Text search
- Checkbox: Hide possible noise

Noise filter behavior:

- Default OFF
- When ON, hide messages with possibleNoise = true

UX requirements:

- Keep selected context always visible (active target, app, chat)
- Strong empty, loading, and error states
- Fast and clean investigative workflow
- Desktop multi-pane layout + mobile drill-down layout
- Breadcrumb on mobile: Target > App > Chat

Deliverables:

- Information architecture diagram
- User flow diagram
- Lo-fi wireframes for all screens
- Hi-fi UI for desktop and mobile
- Component inventory with all key states
- Clickable prototype for full end-to-end journey
