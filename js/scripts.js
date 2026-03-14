// ─────────────────────────────────────────
//  dianx.nailss — scripts.js
//  Booking + Contact powered by Formspree
// ─────────────────────────────────────────

const FORMSPREE_URL = 'https://formspree.io/f/mqeylyzl';

// ── CURSOR ──────────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');

document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    setTimeout(() => {
        ring.style.left = e.clientX + 'px';
        ring.style.top  = e.clientY + 'px';
    }, 90);
});

document.querySelectorAll('a,button,.cal-day,.slot').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(2)';
        ring.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.opacity = '.5';
    });
});

// ── NAVBAR ──────────────────────────────
window.addEventListener('scroll', () =>
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50)
);

function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
function closeMenu()  { document.getElementById('navLinks').classList.remove('open'); }

// ── REVEAL ON SCROLL ────────────────────
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

// ── CALENDAR ────────────────────────────
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let viewDate     = new Date();
let selectedDate = null;
let selectedSlot = null;
const bookedData = {};

// Demo: random booked slots
const now = new Date();
for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + Math.floor(Math.random() * 25) + 1);
    if (d.getDay() === 0) continue;
    const key  = d.toISOString().split('T')[0];
    const allT = ['10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'];
    bookedData[key] = bookedData[key] || [];
    const t = allT[Math.floor(Math.random() * allT.length)];
    if (!bookedData[key].includes(t)) bookedData[key].push(t);
}

function buildCalendar() {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    document.getElementById('calMonth').textContent = MONTHS[m] + ' ' + y;

    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';

    DAYS.forEach(d => {
        const el = document.createElement('div');
        el.className = 'cal-day-name';
        el.textContent = d;
        grid.appendChild(el);
    });

    const firstDay = new Date(y, m, 1).getDay();
    const total    = new Date(y, m + 1, 0).getDate();
    const today    = new Date(); today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'cal-day empty';
        grid.appendChild(el);
    }

    for (let d = 1; d <= total; d++) {
        const el       = document.createElement('div');
        const thisDate = new Date(y, m, d); thisDate.setHours(0, 0, 0, 0);
        const dateStr  = thisDate.toISOString().split('T')[0];
        el.className   = 'cal-day';
        el.textContent = d;

        const isSun  = thisDate.getDay() === 0;
        const isPast = thisDate < today;

        if (isSun || isPast) {
            el.classList.add('booked');
        } else {
            el.classList.add('available');
            if (thisDate.getTime() === today.getTime()) el.classList.add('today');
            if (selectedDate === dateStr) el.classList.add('selected');
            el.addEventListener('click', () => onDateSelect(dateStr, el));
        }
        grid.appendChild(el);
    }
}

function onDateSelect(dateStr, el) {
    selectedDate = dateStr;
    selectedSlot = null;
    document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    buildSlots(dateStr);
    document.getElementById('slotsWrap').style.display = 'block';
    document.getElementById('formWrap').style.display  = 'none';
    setTimeout(() => document.getElementById('slotsWrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

function buildSlots(dateStr) {
    const times  = ['10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'];
    const booked = bookedData[dateStr] || [];
    const grid   = document.getElementById('slotsGrid');
    grid.innerHTML = '';

    times.forEach(t => {
        const el = document.createElement('div');
        el.className   = 'slot';
        el.textContent = t;
        if (booked.includes(t)) {
            el.classList.add('booked');
        } else {
            el.addEventListener('click', () => onSlotSelect(t, el));
        }
        grid.appendChild(el);
    });
}

function onSlotSelect(time, el) {
    selectedSlot = time;
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    const fw = document.getElementById('formWrap');
    fw.style.display = 'block';
    document.getElementById('apptFormInner').style.display = 'block';
    document.getElementById('successMsg').classList.remove('visible');
    updateSummary();
    setTimeout(() => fw.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

function updateSummary() {
    const s = document.getElementById('apptSummary');
    if (selectedDate && selectedSlot) {
        const d     = new Date(selectedDate + 'T12:00:00');
        const label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        s.style.display = 'block';
        s.innerHTML = `<span style="color:var(--gold);font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.25em">YOUR SELECTION</span><br/><br/>&#128197; <strong style="color:var(--cream)">${label}</strong>&nbsp;&nbsp;&#128336; <strong style="color:var(--cream)">${selectedSlot}</strong>`;
    } else {
        s.style.display = 'none';
    }
}

document.getElementById('prevMonth').addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1); buildCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1); buildCalendar();
});

buildCalendar();

// ── APPOINTMENT SUBMIT → FORMSPREE ──────
function submitAppointment() {
    const name    = document.getElementById('clientName').value.trim();
    const phone   = document.getElementById('clientPhone').value.trim();
    const email   = document.getElementById('clientEmail').value.trim();
    const service = document.getElementById('clientService').value;
    const notes   = document.getElementById('clientNotes').value.trim();

    if (!name)                          { showToast('Please enter your name'); return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
    if (!service)                       { showToast('Please select a service'); return; }
    if (!selectedDate || !selectedSlot) { showToast('Please select a date and time'); return; }

    const btn = document.getElementById('submitBtn');
    btn.disabled    = true;
    btn.textContent = '... Sending';

    const d         = new Date(selectedDate + 'T12:00:00');
    const dateLabel = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            _subject: `Nueva cita — ${name} — ${dateLabel} ${selectedSlot}`,
            name:     name,
            phone:    phone || '—',
            email:    email,
            service:  service,
            date:     dateLabel,
            time:     selectedSlot,
            notes:    notes || '—'
        })
    })
    .then(res => {
        if (res.ok) {
            // Mark slot as booked locally
            bookedData[selectedDate] = bookedData[selectedDate] || [];
            if (!bookedData[selectedDate].includes(selectedSlot)) bookedData[selectedDate].push(selectedSlot);
            buildCalendar();
            document.getElementById('apptFormInner').style.display = 'none';
            document.getElementById('successMsg').classList.add('visible');
            showToast('Appointment sent! ✦');
        } else {
            return res.json().then(data => { throw new Error(data.error || 'Error'); });
        }
    })
    .catch(err => {
        console.error(err);
        showToast('Error sending — please try again');
    })
    .finally(() => {
        btn.disabled    = false;
        btn.textContent = '✦ Confirm Appointment';
    });
}

// ── CONTACT SUBMIT → FORMSPREE ──────────
function sendContact() {
    const name  = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg   = document.getElementById('contactMsg').value.trim();

    if (!name || !email || !msg) { showToast('Please fill all fields'); return; }

    fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            _subject: `Mensaje de contacto — ${name}`,
            name:     name,
            email:    email,
            message:  msg
        })
    })
    .then(res => {
        if (res.ok) {
            showToast('Message sent! Diana will reply soon ✦');
            document.getElementById('contactName').value = '';
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactMsg').value   = '';
        } else {
            showToast('Error sending — please try again');
        }
    })
    .catch(() => showToast('Error sending — please try again'));
}

// ── TOAST ────────────────────────────────
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}
