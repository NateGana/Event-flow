/* ============================================================
   EventFlow — Application Logic
   Vanilla JS, LocalStorage persistence, no external frameworks
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- Storage keys & state ---------------- */
  const STORAGE_KEY_EVENTS = 'eventflow_events';
  const STORAGE_KEY_PARTICIPANTS = 'eventflow_participants';
  const STORAGE_KEY_SEEDED = 'eventflow_seeded';

  let state = {
    events: [],
    participants: [],
    currentView: 'dashboard',
    deleteTarget: null // { type: 'event'|'participant', id }
  };

  /* ---------------- Utilities ---------------- */
  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return { day: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }) };
  }

  function formatTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  function currency(n) {
    return '₱' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function badgeClass(status) {
    return 'badge-' + String(status).toLowerCase().replace(/\s+/g, '');
  }

  /* ---------------- Persistence ---------------- */
  function saveEvents() {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(state.events));
  }
  function saveParticipants() {
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(state.participants));
  }
  function loadData() {
    const ev = localStorage.getItem(STORAGE_KEY_EVENTS);
    const pt = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
    state.events = ev ? JSON.parse(ev) : [];
    state.participants = pt ? JSON.parse(pt) : [];
  }

  /* ---------------- Seed data ---------------- */
  function seedIfEmpty() {
    if (localStorage.getItem(STORAGE_KEY_SEEDED)) return;

    const today = new Date();
    const addDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0, 10);
    };

    const seedEvents = [
      { id: uid('EVT'), name: 'Regional Robotics Showcase', description: 'A student robotics competition and exhibition featuring teams from six partner schools, judged demonstrations, and a keynote from a local engineering firm.', category: 'School Event', location: 'Meridian High School Gymnasium', date: addDays(14), startTime: '09:00', endTime: '16:00', organizer: 'Meridian STEM Council', capacity: 120, fee: 0, status: 'Upcoming' },
      { id: uid('EVT'), name: 'Digital Marketing Fundamentals Workshop', description: 'A hands-on half-day workshop covering SEO basics, social media strategy, and content planning for small business owners.', category: 'Workshop', location: 'Riverside Community Hall, Room 2', date: addDays(5), startTime: '13:00', endTime: '17:00', organizer: 'Riverside Business Alliance', capacity: 40, fee: 750, status: 'Upcoming' },
      { id: uid('EVT'), name: 'Northbridge Tech Conference 2026', description: 'An annual gathering of developers, designers, and product leaders featuring talks on AI tooling, design systems, and startup growth.', category: 'Conference', location: 'Northbridge Convention Center, Hall B', date: addDays(30), startTime: '08:30', endTime: '18:00', organizer: 'Northbridge Tech Guild', capacity: 300, fee: 2500, status: 'Upcoming' },
      { id: uid('EVT'), name: 'Barangay Fun Run 5K', description: 'A community fun run to raise funds for the local health center, with routes for both competitive and casual runners.', category: 'Sports', location: 'Barangay San Isidro Plaza', date: addDays(-10), startTime: '05:30', endTime: '08:00', organizer: 'San Isidro Sports Committee', capacity: 200, fee: 150, status: 'Completed' },
      { id: uid('EVT'), name: 'Neighborhood Clean-Up Drive', description: 'Volunteer-led clean-up along the riverside walkway followed by a short environmental awareness talk.', category: 'Community', location: 'Riverside Walkway, North Entrance', date: addDays(-3), startTime: '07:00', endTime: '10:30', organizer: 'GreenStep Volunteers', capacity: 80, fee: 0, status: 'Completed' },
      { id: uid('EVT'), name: 'Intro to Public Speaking Seminar', description: 'An evening seminar for young professionals covering speech structure, stage presence, and handling Q&A.', category: 'Seminar', location: 'Lakeside Library Auditorium', date: addDays(2), startTime: '18:00', endTime: '20:00', organizer: 'Lakeside Toastmasters Club', capacity: 60, fee: 200, status: 'Upcoming' },
      { id: uid('EVT'), name: 'Annual Alumni Homecoming', description: 'Reunion dinner and program for graduates, including recognition awards and a campus tour.', category: 'School Event', location: 'Crestview University Grand Hall', date: addDays(45), startTime: '17:00', endTime: '22:00', organizer: 'Crestview Alumni Association', capacity: 250, fee: 1200, status: 'Upcoming' },
      { id: uid('EVT'), name: 'Weekend Futsal League — Finals', description: 'Championship match of the 8-team weekend futsal league, open to spectators with light refreshments.', category: 'Sports', location: 'Eastwood Sports Complex, Court 1', date: addDays(1), startTime: '15:00', endTime: '18:00', organizer: 'Eastwood Futsal Org', capacity: 100, fee: 50, status: 'Upcoming' }
    ];

    const names = [
      ['Isabela Cruz Santos', 'isabela.santos@mail.com', '0917-234-5561'],
      ['Marcus Villareal', 'marcus.villareal@mail.com', '0928-871-2093'],
      ['Andrea Bautista', 'andrea.bautista@mail.com', '0915-402-7788'],
      ['Kenji Ramos', 'kenji.ramos@mail.com', '0933-661-4420'],
      ['Priya Dominguez', 'priya.dominguez@mail.com', '0918-345-9902'],
      ['Noah Fernandez', 'noah.fernandez@mail.com', '0921-778-3312'],
      ['Camille Tolentino', 'camille.tolentino@mail.com', '0927-556-8841'],
      ['Diego Mercado', 'diego.mercado@mail.com', '0919-203-6675'],
      ['Sofia Aquino', 'sofia.aquino@mail.com', '0932-887-1104'],
      ['Ethan Reyes', 'ethan.reyes@mail.com', '0916-440-2298'],
      ['Lara Jimenez', 'lara.jimenez@mail.com', '0930-119-8865'],
      ['Miguel Torralba', 'miguel.torralba@mail.com', '0917-662-5539'],
      ['Chiara Navarro', 'chiara.navarro@mail.com', '0929-874-1120'],
      ['Julian Ocampo', 'julian.ocampo@mail.com', '0918-556-7743'],
      ['Renata Salazar', 'renata.salazar@mail.com', '0922-390-4487'],
      ['Adrian Cabrera', 'adrian.cabrera@mail.com', '0915-778-6621'],
      ['Bianca Del Rosario', 'bianca.delrosario@mail.com', '0931-204-9956'],
      ['Gabriel Sison', 'gabriel.sison@mail.com', '0920-664-3312']
    ];

    const regStatuses = ['Confirmed', 'Confirmed', 'Pending', 'Confirmed', 'Attended', 'Cancelled'];
    const payStatuses = ['Paid', 'Pending', 'Not Required'];

    const seedParticipants = [];
    let nameIdx = 0;
    seedEvents.forEach((ev, evIdx) => {
      const countForEvent = evIdx === 3 || evIdx === 4 ? 6 : (evIdx % 3 === 0 ? 4 : 2);
      for (let i = 0; i < countForEvent && nameIdx < names.length * 3; i++) {
        const person = names[nameIdx % names.length];
        nameIdx++;
        const regStatus = ev.status === 'Completed'
          ? (Math.random() > 0.3 ? 'Attended' : 'Confirmed')
          : regStatuses[Math.floor(Math.random() * regStatuses.length)];
        const payStatus = ev.fee === 0 ? 'Not Required' : payStatuses[Math.floor(Math.random() * 2)];
        const regDate = new Date();
        regDate.setDate(regDate.getDate() - Math.floor(Math.random() * 20));
        seedParticipants.push({
          id: uid('PTC'),
          name: person[0] + (nameIdx > names.length ? ' Jr.' : ''),
          email: person[1],
          phone: person[2],
          eventId: ev.id,
          regDate: regDate.toISOString().slice(0, 10),
          regStatus,
          payStatus
        });
      }
    });

    state.events = seedEvents;
    state.participants = seedParticipants;
    saveEvents();
    saveParticipants();
    localStorage.setItem(STORAGE_KEY_SEEDED, '1');
  }

  /* ---------------- Derived data helpers ---------------- */
  function getEventById(id) {
    return state.events.find(e => e.id === id);
  }

  function participantsForEvent(eventId) {
    return state.participants.filter(p => p.eventId === eventId);
  }

  function eventRegisteredCount(eventId) {
    return participantsForEvent(eventId).filter(p => p.regStatus !== 'Cancelled').length;
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  const viewTitles = {
    dashboard: ['Dashboard', 'Overview of your events and registrations'],
    events: ['Events', 'Create and manage your organization\u2019s events'],
    participants: ['Participants', 'Manage attendee registrations and status'],
    reports: ['Reports', 'Registration performance at a glance']
  };

  function switchView(view) {
    state.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
    document.getElementById('view-' + view).classList.add('is-active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('is-active', n.dataset.view === view));
    document.getElementById('viewTitle').textContent = viewTitles[view][0];
    document.getElementById('viewSubtitle').textContent = viewTitles[view][1];
    document.getElementById('sidebar').classList.remove('is-open');
    renderCurrentView();
  }

  function renderCurrentView() {
    if (state.currentView === 'dashboard') renderDashboard();
    else if (state.currentView === 'events') renderEvents();
    else if (state.currentView === 'participants') renderParticipants();
    else if (state.currentView === 'reports') renderReports();
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function renderDashboard() {
    const totalEvents = state.events.length;
    const upcoming = state.events.filter(e => e.status === 'Upcoming').length;
    const completed = state.events.filter(e => e.status === 'Completed').length;
    const totalParticipants = state.participants.length;
    const pendingRegs = state.participants.filter(p => p.regStatus === 'Pending').length;
    const availableSlots = state.events.reduce((sum, e) => {
      if (e.status === 'Cancelled' || e.status === 'Completed') return sum;
      return sum + Math.max(0, e.capacity - eventRegisteredCount(e.id));
    }, 0);

    const stats = [
      { label: 'Total Events', value: totalEvents, accent: 'citrine' },
      { label: 'Upcoming Events', value: upcoming, accent: 'sky' },
      { label: 'Completed Events', value: completed, accent: 'lime' },
      { label: 'Total Participants', value: totalParticipants, accent: 'citrine' },
      { label: 'Pending Registrations', value: pendingRegs, accent: 'coral' },
      { label: 'Available Event Slots', value: availableSlots, accent: 'sky' }
    ];

    document.getElementById('statGrid').innerHTML = stats.map(s => `
      <div class="stat-card accent-${s.accent}">
        <p class="stat-label">${s.label}</p>
        <p class="stat-value">${s.value}</p>
      </div>
    `).join('');

    // Upcoming events list (soonest 5)
    const upcomingList = state.events
      .filter(e => e.status === 'Upcoming' || e.status === 'Ongoing')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    const upcomingEl = document.getElementById('upcomingEventsList');
    upcomingEl.innerHTML = upcomingList.length ? upcomingList.map(e => {
      const ds = formatDateShort(e.date);
      return `
        <div class="mini-item">
          <div class="mini-date"><div class="d">${ds.day}</div><div class="m">${ds.month}</div></div>
          <div class="mini-info">
            <strong>${escapeHtml(e.name)}</strong>
            <span>${escapeHtml(e.location)} · ${eventRegisteredCount(e.id)}/${e.capacity} registered</span>
          </div>
        </div>`;
    }).join('') : '<p class="empty-inline">No upcoming events scheduled.</p>';

    // Recent registrations (latest 5 by regDate)
    const recentRegs = [...state.participants]
      .sort((a, b) => b.regDate.localeCompare(a.regDate))
      .slice(0, 5);
    const recentEl = document.getElementById('recentRegList');
    recentEl.innerHTML = recentRegs.length ? recentRegs.map(p => {
      const ev = getEventById(p.eventId);
      return `
        <div class="mini-item">
          <div class="mini-date"><div class="d">${formatDateShort(p.regDate).day}</div><div class="m">${formatDateShort(p.regDate).month}</div></div>
          <div class="mini-info">
            <strong>${escapeHtml(p.name)}</strong>
            <span>${ev ? escapeHtml(ev.name) : 'Unknown event'}</span>
          </div>
          <span class="badge ${badgeClass(p.regStatus)}">${p.regStatus}</span>
        </div>`;
    }).join('') : '<p class="empty-inline">No registrations yet.</p>';

    // Capacity overview (active events only)
    const activeEvents = state.events.filter(e => e.status === 'Upcoming' || e.status === 'Ongoing').slice(0, 6);
    document.getElementById('capacityOverview').innerHTML = activeEvents.length ? activeEvents.map(e => capacityRowHtml(e)).join('') : '<p class="empty-inline">No active events to display.</p>';
  }

  function capacityRowHtml(e) {
    const reg = eventRegisteredCount(e.id);
    const pct = e.capacity > 0 ? Math.min(100, Math.round((reg / e.capacity) * 100)) : 0;
    const fillClass = pct >= 90 ? 'is-high' : pct >= 60 ? 'is-mid' : '';
    return `
      <div class="capacity-row">
        <div class="capacity-top">
          <strong>${escapeHtml(e.name)}</strong>
          <span>${reg} / ${e.capacity} Participants</span>
        </div>
        <div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
      </div>`;
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  function populateEventFilterOptions() {
    const categories = ['Seminar', 'Workshop', 'Conference', 'Sports', 'School Event', 'Community', 'Other'];
    const statuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
    const catSel = document.getElementById('eventCategoryFilter');
    const statSel = document.getElementById('eventStatusFilter');
    catSel.innerHTML = '<option value="">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
    statSel.innerHTML = '<option value="">All Statuses</option>' + statuses.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  function getFilteredEvents() {
    const q = document.getElementById('eventSearch').value.trim().toLowerCase();
    const cat = document.getElementById('eventCategoryFilter').value;
    const status = document.getElementById('eventStatusFilter').value;
    const sort = document.getElementById('eventSort').value;

    let list = state.events.filter(e => {
      const matchesQ = !q || e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
      const matchesCat = !cat || e.category === cat;
      const matchesStatus = !status || e.status === status;
      return matchesQ && matchesCat && matchesStatus;
    });

    if (sort === 'date-asc') list.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === 'date-desc') list.sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function eventMetaSvg(name) {
    const icons = {
      calendar: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>',
      clock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
      pin: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
      users: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    };
    return icons[name] || '';
  }

  function renderEvents() {
    const list = getFilteredEvents();
    const grid = document.getElementById('eventsGrid');

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <p>No events found</p>
        <span>Try adjusting your search or filters, or add a new event.</span>
      </div>`;
      return;
    }

    grid.innerHTML = list.map(e => {
      const reg = eventRegisteredCount(e.id);
      const pct = e.capacity > 0 ? Math.min(100, Math.round((reg / e.capacity) * 100)) : 0;
      const fillClass = pct >= 90 ? 'is-high' : pct >= 60 ? 'is-mid' : '';
      return `
      <div class="event-card" data-id="${e.id}">
        <div class="event-card-top">
          <h3>${escapeHtml(e.name)}</h3>
          <span class="event-category-tag">${escapeHtml(e.category)}</span>
        </div>
        <p class="event-desc">${escapeHtml(e.description || 'No description provided.')}</p>
        <div class="event-meta">
          <div class="row">${eventMetaSvg('calendar')} ${formatDate(e.date)}</div>
          <div class="row">${eventMetaSvg('clock')} ${formatTime(e.startTime)} – ${formatTime(e.endTime)}</div>
          <div class="row">${eventMetaSvg('pin')} ${escapeHtml(e.location)}</div>
          <div class="row">${eventMetaSvg('users')} ${reg} / ${e.capacity} registered</div>
        </div>
        <div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
        <div class="event-card-foot">
          <span class="badge ${badgeClass(e.status)}">${e.status}</span>
          <div class="event-actions">
            <button class="btn btn-ghost btn-sm" data-action="view-event" data-id="${e.id}">View</button>
            <button class="btn btn-ghost btn-sm" data-action="edit-event" data-id="${e.id}">Edit</button>
            <button class="btn btn-ghost btn-sm" data-action="delete-event" data-id="${e.id}">Delete</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function openEventModal(eventId) {
    const form = document.getElementById('eventForm');
    form.reset();
    clearFormErrors(form);
    document.getElementById('eventId').value = '';

    if (eventId) {
      const ev = getEventById(eventId);
      if (!ev) return;
      document.getElementById('eventModalTitle').textContent = 'Edit Event';
      document.getElementById('eventId').value = ev.id;
      document.getElementById('eventName').value = ev.name;
      document.getElementById('eventDescription').value = ev.description || '';
      document.getElementById('eventCategory').value = ev.category;
      document.getElementById('eventStatus').value = ev.status;
      document.getElementById('eventLocation').value = ev.location;
      document.getElementById('eventDate').value = ev.date;
      document.getElementById('eventStartTime').value = ev.startTime;
      document.getElementById('eventEndTime').value = ev.endTime;
      document.getElementById('eventOrganizer').value = ev.organizer;
      document.getElementById('eventCapacity').value = ev.capacity;
      document.getElementById('eventFee').value = ev.fee;
    } else {
      document.getElementById('eventModalTitle').textContent = 'Add Event';
      document.getElementById('eventStatus').value = 'Upcoming';
    }
    openModal('eventModalBackdrop');
  }

  function handleEventFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    clearFormErrors(form);

    const name = document.getElementById('eventName').value.trim();
    const category = document.getElementById('eventCategory').value;
    const location = document.getElementById('eventLocation').value.trim();
    const date = document.getElementById('eventDate').value;
    const startTime = document.getElementById('eventStartTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const organizer = document.getElementById('eventOrganizer').value.trim();
    const capacity = parseInt(document.getElementById('eventCapacity').value, 10);

    let hasError = false;
    if (!name) { setFieldError('eventName', 'Event name is required.'); hasError = true; }
    if (!category) { setFieldError('eventCategory', 'Please select a category.'); hasError = true; }
    if (!location) { setFieldError('eventLocation', 'Location is required.'); hasError = true; }
    if (!date) { setFieldError('eventDate', 'Event date is required.'); hasError = true; }
    if (!organizer) { setFieldError('eventOrganizer', 'Organizer is required.'); hasError = true; }
    if (!capacity || capacity < 1) { setFieldError('eventCapacity', 'Capacity must be at least 1.'); hasError = true; }
    if (startTime && endTime && endTime <= startTime) { setFieldError('eventDate', 'End time must be after start time.'); hasError = true; }

    if (hasError) return;

    const id = document.getElementById('eventId').value;
    const payload = {
      name, description: document.getElementById('eventDescription').value.trim(),
      category, location, date, startTime, endTime, organizer, capacity,
      fee: parseFloat(document.getElementById('eventFee').value) || 0,
      status: document.getElementById('eventStatus').value
    };

    if (id) {
      const idx = state.events.findIndex(ev => ev.id === id);
      state.events[idx] = { ...state.events[idx], ...payload };
      showToast('Event updated successfully.');
    } else {
      payload.id = uid('EVT');
      state.events.push(payload);
      showToast('Event added successfully.');
    }

    saveEvents();
    closeModal('eventModalBackdrop');
    populateParticipantEventOptions();
    populateParticipantEventFilter();
    renderCurrentView();
  }

  function viewEventDetails(eventId) {
    const ev = getEventById(eventId);
    if (!ev) return;
    const reg = eventRegisteredCount(ev.id);
    const pct = ev.capacity > 0 ? Math.min(100, Math.round((reg / ev.capacity) * 100)) : 0;
    const fillClass = pct >= 90 ? 'is-high' : pct >= 60 ? 'is-mid' : '';
    const participants = participantsForEvent(ev.id);

    document.getElementById('detailsTitle').textContent = 'Event Details';
    document.getElementById('detailsBody').innerHTML = `
      <div class="details-header">
        <h3>${escapeHtml(ev.name)}</h3>
        <p>${escapeHtml(ev.description || 'No description provided.')}</p>
      </div>
      <div class="details-grid">
        <div class="details-field"><span>Category</span><strong>${escapeHtml(ev.category)}</strong></div>
        <div class="details-field"><span>Status</span><strong><span class="badge ${badgeClass(ev.status)}">${ev.status}</span></strong></div>
        <div class="details-field"><span>Date</span><strong>${formatDate(ev.date)}</strong></div>
        <div class="details-field"><span>Time</span><strong>${formatTime(ev.startTime)} – ${formatTime(ev.endTime)}</strong></div>
        <div class="details-field"><span>Location</span><strong>${escapeHtml(ev.location)}</strong></div>
        <div class="details-field"><span>Organizer</span><strong>${escapeHtml(ev.organizer)}</strong></div>
        <div class="details-field"><span>Registration Fee</span><strong>${ev.fee > 0 ? currency(ev.fee) : 'Free'}</strong></div>
        <div class="details-field"><span>Capacity</span><strong>${ev.capacity}</strong></div>
      </div>
      <div class="details-capacity">
        <div class="capacity-top">
          <strong>Registration Progress</strong>
          <span>${reg} / ${ev.capacity} Participants (${Math.max(0, ev.capacity - reg)} slots left)</span>
        </div>
        <div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
      </div>
      <div style="margin-top:18px">
        <strong style="font-size:0.9rem">Registered Participants (${participants.length})</strong>
        <div class="mini-list" style="margin-top:10px">
          ${participants.length ? participants.slice(0, 8).map(p => `
            <div class="mini-item">
              <div class="mini-info"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.email)}</span></div>
              <span class="badge ${badgeClass(p.regStatus)}">${p.regStatus}</span>
            </div>`).join('') : '<p class="empty-inline">No participants registered yet.</p>'}
          ${participants.length > 8 ? `<p class="empty-inline">+ ${participants.length - 8} more…</p>` : ''}
        </div>
      </div>
    `;
    openModal('detailsModalBackdrop');
  }

  function deleteEvent(eventId) {
    state.events = state.events.filter(e => e.id !== eventId);
    state.participants = state.participants.filter(p => p.eventId !== eventId);
    saveEvents();
    saveParticipants();
    populateParticipantEventOptions();
    populateParticipantEventFilter();
    showToast('Event deleted.', 'error');
    renderCurrentView();
  }

  /* ============================================================
     PARTICIPANTS
     ============================================================ */
  function populateParticipantEventOptions() {
    const sel = document.getElementById('participantEvent');
    sel.innerHTML = '<option value="">Select an event</option>' +
      state.events.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
  }

  function populateParticipantEventFilter() {
    const sel = document.getElementById('participantEventFilter');
    const current = sel.value;
    sel.innerHTML = '<option value="">All Events</option>' +
      state.events.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
    sel.value = current;
  }

  function populateParticipantStatusFilter() {
    const statuses = ['Pending', 'Confirmed', 'Cancelled', 'Attended'];
    document.getElementById('participantStatusFilter').innerHTML =
      '<option value="">All Registration Statuses</option>' + statuses.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  function getFilteredParticipants() {
    const q = document.getElementById('participantSearch').value.trim().toLowerCase();
    const eventFilter = document.getElementById('participantEventFilter').value;
    const statusFilter = document.getElementById('participantStatusFilter').value;

    return state.participants.filter(p => {
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      const matchesEvent = !eventFilter || p.eventId === eventFilter;
      const matchesStatus = !statusFilter || p.regStatus === statusFilter;
      return matchesQ && matchesEvent && matchesStatus;
    }).sort((a, b) => b.regDate.localeCompare(a.regDate));
  }

  function renderParticipants() {
    const list = getFilteredParticipants();
    const tbody = document.getElementById('participantsTableBody');
    const emptyEl = document.getElementById('participantsEmpty');

    if (!list.length) {
      tbody.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    tbody.innerHTML = list.map(p => {
      const ev = getEventById(p.eventId);
      return `
        <tr data-id="${p.id}">
          <td class="cell-name"><strong>${escapeHtml(p.name)}</strong></td>
          <td class="cell-name"><span>${escapeHtml(p.email)}</span><span>${escapeHtml(p.phone)}</span></td>
          <td>${ev ? escapeHtml(ev.name) : '<em>Deleted event</em>'}</td>
          <td>${formatDate(p.regDate)}</td>
          <td>
            <select class="select-input select-inline" data-action="change-reg-status" data-id="${p.id}">
              ${['Pending', 'Confirmed', 'Cancelled', 'Attended'].map(s => `<option value="${s}" ${p.regStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
          <td>
            <select class="select-input select-inline" data-action="change-pay-status" data-id="${p.id}">
              ${['Paid', 'Pending', 'Not Required'].map(s => `<option value="${s}" ${p.payStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost btn-sm" data-action="edit-participant" data-id="${p.id}">Edit</button>
              <button class="btn btn-ghost btn-sm" data-action="delete-participant" data-id="${p.id}">Delete</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function openParticipantModal(participantId) {
    const form = document.getElementById('participantForm');
    form.reset();
    clearFormErrors(form);
    populateParticipantEventOptions();
    document.getElementById('participantId').value = '';

    if (participantId) {
      const p = state.participants.find(x => x.id === participantId);
      if (!p) return;
      document.getElementById('participantModalTitle').textContent = 'Edit Participant';
      document.getElementById('participantId').value = p.id;
      document.getElementById('participantName').value = p.name;
      document.getElementById('participantEmail').value = p.email;
      document.getElementById('participantPhone').value = p.phone;
      document.getElementById('participantEvent').value = p.eventId;
      document.getElementById('participantRegStatus').value = p.regStatus;
      document.getElementById('participantPayStatus').value = p.payStatus;
    } else {
      document.getElementById('participantModalTitle').textContent = 'Add Participant';
    }
    openModal('participantModalBackdrop');
  }

  function handleParticipantFormSubmit(e) {
    e.preventDefault();
    clearFormErrors(e.target);

    const name = document.getElementById('participantName').value.trim();
    const email = document.getElementById('participantEmail').value.trim();
    const phone = document.getElementById('participantPhone').value.trim();
    const eventId = document.getElementById('participantEvent').value;

    let hasError = false;
    if (!name) { setFieldError('participantName', 'Full name is required.'); hasError = true; }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setFieldError('participantEmail', 'Enter a valid email.'); hasError = true; }
    if (!phone) { setFieldError('participantPhone', 'Phone number is required.'); hasError = true; }
    if (!eventId) { setFieldError('participantEvent', 'Please select an event.'); hasError = true; }

    if (hasError) return;

    const id = document.getElementById('participantId').value;
    const payload = {
      name, email, phone, eventId,
      regStatus: document.getElementById('participantRegStatus').value,
      payStatus: document.getElementById('participantPayStatus').value
    };

    if (id) {
      const idx = state.participants.findIndex(p => p.id === id);
      state.participants[idx] = { ...state.participants[idx], ...payload };
      showToast('Participant updated successfully.');
    } else {
      payload.id = uid('PTC');
      payload.regDate = new Date().toISOString().slice(0, 10);
      state.participants.push(payload);
      showToast('Participant registered successfully.');
    }

    saveParticipants();
    closeModal('participantModalBackdrop');
    renderCurrentView();
  }

  function deleteParticipant(id) {
    state.participants = state.participants.filter(p => p.id !== id);
    saveParticipants();
    showToast('Participant removed.', 'error');
    renderCurrentView();
  }

  function changeParticipantField(id, field, value) {
    const idx = state.participants.findIndex(p => p.id === id);
    if (idx === -1) return;
    state.participants[idx][field] = value;
    saveParticipants();
    showToast('Participant record updated.');
    renderDashboard(); // keep stats fresh even though table stays in place
  }

  /* ============================================================
     REPORTS
     ============================================================ */
  function renderReports() {
    const total = state.participants.length;
    const confirmed = state.participants.filter(p => p.regStatus === 'Confirmed').length;
    const attended = state.participants.filter(p => p.regStatus === 'Attended').length;
    const totalCapacity = state.events.reduce((s, e) => s + e.capacity, 0);
    const totalRegistered = state.events.reduce((s, e) => s + eventRegisteredCount(e.id), 0);
    const capacityUsage = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

    document.getElementById('reportSummary').innerHTML = `
      <div class="rs-item"><div class="rs-val">${total}</div><div class="rs-label">Total Registrations</div></div>
      <div class="rs-item"><div class="rs-val">${confirmed}</div><div class="rs-label">Confirmed Participants</div></div>
      <div class="rs-item"><div class="rs-val">${attended}</div><div class="rs-label">Attendance Count</div></div>
      <div class="rs-item"><div class="rs-val">${capacityUsage}%</div><div class="rs-label">Overall Capacity Usage</div></div>
    `;

    const statuses = [
      { key: 'Pending', color: 'var(--citrine)' },
      { key: 'Confirmed', color: 'var(--lime)' },
      { key: 'Attended', color: 'var(--sky)' },
      { key: 'Cancelled', color: 'var(--coral)' }
    ];
    document.getElementById('statusBreakdown').innerHTML = statuses.map(s => {
      const count = state.participants.filter(p => p.regStatus === s.key).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return `
        <div class="breakdown-row">
          <span class="bd-label">${s.key}</span>
          <div class="bd-track"><div class="bd-fill" style="width:${pct}%;background:${s.color}"></div></div>
          <span class="bd-count">${count}</span>
        </div>`;
    }).join('');

    document.getElementById('reportCapacity').innerHTML = state.events.length
      ? state.events.map(e => capacityRowHtml(e)).join('')
      : '<p class="empty-inline">No events to report on yet.</p>';
  }

  /* ============================================================
     MODALS, TOASTS, FORM HELPERS
     ============================================================ */
  function openModal(id) { document.getElementById(id).classList.add('is-open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('is-open'); }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.closest('.form-row').classList.add('has-error');
    const errEl = document.querySelector(`[data-error-for="${fieldId}"]`);
    if (errEl) errEl.textContent = message;
  }
  function clearFormErrors(form) {
    form.querySelectorAll('.form-row').forEach(r => r.classList.remove('has-error'));
    form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  }

  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast-error' : '');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all .2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  /* ============================================================
     EVENT WIRING
     ============================================================ */
  function wireNav() {
    document.getElementById('mainNav').addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (btn) switchView(btn.dataset.view);
    });
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.goto));
    });
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('is-open');
    });
  }

  function wireModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop.id);
      });
    });
  }

  function wireEventControls() {
    document.getElementById('addEventBtn').addEventListener('click', () => openEventModal(null));
    document.getElementById('quickAddEvent').addEventListener('click', () => { switchView('events'); openEventModal(null); });
    document.getElementById('eventForm').addEventListener('submit', handleEventFormSubmit);

    document.getElementById('eventSearch').addEventListener('input', renderEvents);
    document.getElementById('eventCategoryFilter').addEventListener('change', renderEvents);
    document.getElementById('eventStatusFilter').addEventListener('change', renderEvents);
    document.getElementById('eventSort').addEventListener('change', renderEvents);

    document.getElementById('eventsGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'view-event') viewEventDetails(id);
      else if (btn.dataset.action === 'edit-event') openEventModal(id);
      else if (btn.dataset.action === 'delete-event') {
        state.deleteTarget = { type: 'event', id };
        document.getElementById('confirmMessage').textContent = 'Delete this event? All associated participant records will also be removed. This cannot be undone.';
        openModal('confirmModalBackdrop');
      }
    });
  }

  function wireParticipantControls() {
    document.getElementById('addParticipantBtn').addEventListener('click', () => openParticipantModal(null));
    document.getElementById('participantForm').addEventListener('submit', handleParticipantFormSubmit);

    document.getElementById('participantSearch').addEventListener('input', renderParticipants);
    document.getElementById('participantEventFilter').addEventListener('change', renderParticipants);
    document.getElementById('participantStatusFilter').addEventListener('change', renderParticipants);

    document.getElementById('participantsTableBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'edit-participant') openParticipantModal(id);
      else if (btn.dataset.action === 'delete-participant') {
        state.deleteTarget = { type: 'participant', id };
        document.getElementById('confirmMessage').textContent = 'Delete this participant record? This cannot be undone.';
        openModal('confirmModalBackdrop');
      }
    });

    document.getElementById('participantsTableBody').addEventListener('change', (e) => {
      const sel = e.target.closest('[data-action]');
      if (!sel) return;
      const id = sel.dataset.id;
      if (sel.dataset.action === 'change-reg-status') changeParticipantField(id, 'regStatus', sel.value);
      else if (sel.dataset.action === 'change-pay-status') changeParticipantField(id, 'payStatus', sel.value);
    });
  }

  function wireConfirmDelete() {
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
      if (!state.deleteTarget) return;
      if (state.deleteTarget.type === 'event') deleteEvent(state.deleteTarget.id);
      else deleteParticipant(state.deleteTarget.id);
      state.deleteTarget = null;
      closeModal('confirmModalBackdrop');
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    seedIfEmpty();
    loadData();
    populateEventFilterOptions();
    populateParticipantEventOptions();
    populateParticipantEventFilter();
    populateParticipantStatusFilter();
    wireNav();
    wireModals();
    wireEventControls();
    wireParticipantControls();
    wireConfirmDelete();
    switchView('dashboard');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
