# EventFlow

**Event & Registration Management System**

EventFlow is a front-end web application that helps organizations, schools, clubs, and small event organizers manage events and participant registrations from a single dashboard — no server, no database setup, no installation.

---

## Description

EventFlow gives an organizer everything needed to run events day to day: creating and editing events, tracking who has registered, monitoring how full an event is getting, and reviewing registration performance across all events. It's built to feel like a real event-management product — sidebar navigation, live dashboard statistics, capacity progress bars, filters, and toast notifications — while running entirely in the browser.

## Features

- **Dashboard** — total events, upcoming events, completed events, total participants, pending registrations, and available slots, all recalculated live as data changes.
- **Event management** — add, edit, delete, and view detailed event records with category, location, date/time, organizer, capacity, and registration fee.
- **Search, filter & sort** — search events by name or location, filter by category or status, and sort by date or name.
- **Participant management** — add, edit, delete, and search attendees; filter by event or registration status; update registration and payment status inline.
- **Event details view** — full event profile with a live capacity/registration progress bar and a list of registered participants.
- **Reports** — registration totals, confirmed/attendance counts, capacity usage, and a visual registration-status breakdown.
- **Modal-based forms** with required-field validation and inline error messages.
- **Toast notifications** confirming every add, edit, and delete action.
- **Empty states** for events and participants when no records match the current filters.
- **Responsive layout** that adapts down to mobile, with a collapsible sidebar.

## Technologies

- HTML5
- CSS3 (custom properties, CSS Grid & Flexbox — no framework)
- Vanilla JavaScript (ES6+, no build step)
- Browser `localStorage` for persistence
- Google Fonts (Space Grotesk, Inter)
- Inline SVG icons

**This is a front-end-only project.** There is no backend, server, or database. All data is created on first load as sample data and stored in your browser's `localStorage`. Clearing your browser storage will reset the app back to its sample data.

## How to Run

1. Download or clone this repository.
2. Open `index.html` directly in any modern browser (Chrome, Firefox, Edge, Safari).
3. That's it — no build step, no server, no dependencies to install.

> Tip: because data is stored in `localStorage`, it is specific to the browser and device you open the app in.

## Project Structure

```
eventflow/
├── index.html      # App shell, views, and modal markup
├── style.css        # Design tokens, layout, and component styles
├── script.js         # Application logic (state, rendering, CRUD, storage)
└── README.md
```

## Main Functionality

| Area | What it does |
|---|---|
| Dashboard | Aggregates live statistics from events and participants |
| Events | Full CRUD, search, category/status filters, date/name sorting |
| Participants | Full CRUD, search, event/status filters, inline status updates |
| Event Details | Capacity bar, registered participant list, key event info |
| Reports | Registration summary, status breakdown, capacity usage per event |

On first launch, EventFlow seeds itself with realistic sample events (a robotics showcase, a tech conference, a community fun run, and more) and matching participant registrations, so the app is immediately explorable rather than empty.

## Screenshots

_Add screenshots of the Dashboard, Events grid, Participants table, and Reports view here before publishing._

```
docs/
├── dashboard.png
├── events.png
├── participants.png
└── reports.png
```

## Future Improvements

- Export events and participant lists to CSV
- Email/SMS reminder simulation for upcoming events
- Multi-organizer accounts with role-based permissions
- Calendar view for events
- Drag-and-drop event status updates (Kanban-style)
- Dark mode

---

Built with HTML5, CSS3, and vanilla JavaScript. No frameworks, no backend — just open and use.
