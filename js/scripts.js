/// JS for appointment booking and UI interactions

// Custom cursor
const cursor = document.getElementById('cursor'), ring = document.getElementById('cursorRing');
// Move cursor and ring with mouse

document.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; setTimeout(() => { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px' }, 90) });
// Enlarge cursor and ring on interactive elements

document.querySelectorAll('a,button,.cal-day,.slot').forEach(el => { el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2)'; ring.style.opacity = '1' }); el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '.5' }) });

// Navbar scroll effect
window.addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50));
// Mobile menu toggle

function toggleMenu() { document.getElementById('navLinks').classList.toggle('open') }
// Close menu when clicking a link (for better UX)
function closeMenu() { document.getElementById('navLinks').classList.remove('open') }
// Reveal elements on scroll
const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }) }, { threshold: .08 });
// Observe all elements with 'reveal' class
document.querySelectorAll('.reveal').forEach(r => obs.observe(r));
// Calendar and booking logic
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//  Days of week starting with Sunday for easier calendar grid calculation
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// View state
let viewDate = new Date(), selectedDate = null, selectedSlot = null;

// Simulated booked slots data (randomly generated for demo purposes) - in real app, this would come from a server
const bookedData = {};
const now = new Date();
// Generate random booked slots for the next month
for (let i = 0; i < 10; i++) { const d = new Date(now); d.setDate(d.getDate() + Math.floor(Math.random() * 25) + 1); if (d.getDay() === 0) continue; const key = d.toISOString().split('T')[0]; const allT = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00']; bookedData[key] = bookedData[key] || []; const t = allT[Math.floor(Math.random() * allT.length)]; if (!bookedData[key].includes(t)) bookedData[key].push(t) }
// Build calendar grid for the current view month
function buildCalendar() { const y = viewDate.getFullYear(), m = viewDate.getMonth(); document.getElementById('calMonth').textContent = MONTHS[m] + ' ' + y; const grid = document.getElementById('calGrid'); grid.innerHTML = ''; DAYS.forEach(d => { const el = document.createElement('div'); el.className = 'cal-day-name'; el.textContent = d; grid.appendChild(el) }); const firstDay = new Date(y, m, 1).getDay(); const total = new Date(y, m + 1, 0).getDate(); const today = new Date(); today.setHours(0, 0, 0, 0); for (let i = 0; i < firstDay; i++) { const el = document.createElement('div'); el.className = 'cal-day empty'; grid.appendChild(el) } for (let d = 1; d <= total; d++) { const el = document.createElement('div'); const thisDate = new Date(y, m, d); thisDate.setHours(0, 0, 0, 0); const dateStr = thisDate.toISOString().split('T')[0]; el.className = 'cal-day'; el.textContent = d; const isSun = thisDate.getDay() === 0; const isPast = thisDate < today; if (isSun || isPast) { el.classList.add('booked') } else { el.classList.add('available'); if (thisDate.getTime() === today.getTime()) el.classList.add('today'); if (selectedDate === dateStr) el.classList.add('selected'); el.addEventListener('click', () => onDateSelect(dateStr, el)) } grid.appendChild(el) } }

// Handle date selection
function onDateSelect(dateStr, el) { selectedDate = dateStr; selectedSlot = null; document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected')); el.classList.add('selected'); buildSlots(dateStr); document.getElementById('slotsWrap').style.display = 'block'; document.getElementById('formWrap').style.display = 'none'; setTimeout(() => document.getElementById('slotsWrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100) }
// Build time slots for the selected date
function buildSlots(dateStr) { const times = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00']; const booked = bookedData[dateStr] || []; const grid = document.getElementById('slotsGrid'); grid.innerHTML = ''; times.forEach(t => { const el = document.createElement('div'); el.className = 'slot'; el.textContent = t; if (booked.includes(t)) { el.classList.add('booked') } else { el.addEventListener('click', () => onSlotSelect(t, el)) } grid.appendChild(el) }) }

// Handle time slot selection
function onSlotSelect(time, el) { selectedSlot = time; document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected')); el.classList.add('selected'); const fw = document.getElementById('formWrap'); fw.style.display = 'block'; document.getElementById('apptFormInner').style.display = 'block'; document.getElementById('successMsg').classList.remove('visible'); updateSummary(); setTimeout(() => fw.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100) }
function updateSummary() { const s = document.getElementById('apptSummary'); if (selectedDate && selectedSlot) { const d = new Date(selectedDate + 'T12:00:00'); const label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); s.style.display = 'block'; s.innerHTML = '<span style="color:var(--gold);font-family:\'Cinzel\',serif;font-size:.65rem;letter-spacing:.25em">YOUR SELECTION</span><br/><br/>&#128197; <strong style="color:var(--cream)">' + label + '</strong>&nbsp;&nbsp;&#128336; <strong style="color:var(--cream)">' + selectedSlot + '</strong>' } else { s.style.display = 'none' } }
// Navigation buttons for calendar
document.getElementById('prevMonth').addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); buildCalendar() });
document.getElementById('nextMonth').addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); buildCalendar() });
buildCalendar();
// Handle appointment form submission
// Handle appointment form submission
function submitAppointment() {

    // Get form values
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const service = document.getElementById('clientService').value;
    const notes = document.getElementById('clientNotes').value.trim();

    // Validation
    if (!name) {
        showToast('Please enter your name');
        return;
    }

    if (!email || !email.includes('@')) {
        showToast('Please enter a valid email');
        return;
    }

    if (!service) {
        showToast('Please select a service');
        return;
    }

    if (!selectedDate || !selectedSlot) {
        showToast('Please select a date and time');
        return;
    }

    // Disable button while sending
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = '...Sending';

    // Format the selected date
    const d = new Date(selectedDate + 'T12:00:00');

    const dateLabel = d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Data sent to EmailJS
    const templateParams = {

        name: name,
        phone: phone,
        email: email,
        service: service,
        notes: notes,
        date: dateLabel,
        time: selectedSlot

    };


    // Send booking email to Diana
    emailjs.send(
        "service_jj9r8tm",
        "template_9jienry",
        templateParams
    )

    .then(function () {

        // Send confirmation email to client
        sendConfirmationEmail(templateParams);

        // Show success UI
        onBookingSuccess(dateLabel);

    })

    .catch(function (error) {

        console.error("Email error:", error);

        showToast("Error sending booking");

        btn.disabled = false;
        btn.textContent = "✦ Confirm Appointment";

    });

}
function onBookingSuccess(dateLabel) { bookedData[selectedDate] = bookedData[selectedDate] || []; if (!bookedData[selectedDate].includes(selectedSlot)) bookedData[selectedDate].push(selectedSlot); buildCalendar(); document.getElementById('apptFormInner').style.display = 'none'; document.getElementById('successMsg').classList.add('visible'); showToast('Appointment sent! \u2726'); document.getElementById('submitBtn').disabled = false; document.getElementById('submitBtn').textContent = '\u2726 Confirm Appointment' }
function sendContact() {

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();

    if (!name || !email || !msg) {

        showToast('Please fill all fields');
        return;

    }

    const data = {

        name: name,
        email: email,
        message: msg

    };


    emailjs.send(
        "service_jj9r8tm",
        "template_contact",
        data
    )

    .then(function () {

        showToast('Message sent! Diana will reply soon ✦');

        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMsg').value = '';

    })

    .catch(function () {

        showToast("Error sending message");

    });

}
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3500) }


// Send confirmation email to the client
function sendConfirmationEmail(data) {

    emailjs.send(
        "service_jj9r8tm",
        "template_confirm",
        data
    )

    .then(function () {

        console.log("Confirmation email sent");

    })

    .catch(function (error) {

        console.log("Confirmation email failed", error);

    });

}
