/**
 * FlyNow Airlines - Main App JS
 * Handles: Auth (user + admin), Home (search, tourist tips), Booking (passenger form, payment, cancel), Check-in (seat map, boarding pass, PDF download)
 */

const API_URL = 'http://localhost:5000/api';

// Tourist destination data (static)
const TOURIST_DATA = {
    'london':    { emoji:'🗼', weather:'15°C / Cloudy', currency:'GBP (£)', places:['Big Ben','Tower of London','Buckingham Palace','British Museum'] },
    'paris':     { emoji:'🥐', weather:'18°C / Sunny', currency:'EUR (€)', places:['Eiffel Tower','Louvre Museum','Notre-Dame','Versailles'] },
    'dubai':     { emoji:'🏙️', weather:'35°C / Hot & Sunny', currency:'AED (د.إ)', places:['Burj Khalifa','Palm Jumeirah','Dubai Mall','Desert Safari'] },
    'tokyo':     { emoji:'⛩️', weather:'22°C / Mild', currency:'JPY (¥)', places:['Shibuya Crossing','Senso-ji','Harajuku','Mount Fuji'] },
    'singapore': { emoji:'🌴', weather:'30°C / Humid', currency:'SGD (S$)', places:['Marina Bay Sands','Gardens by the Bay','Sentosa','Chinatown'] },
    'sydney':    { emoji:'🦘', weather:'25°C / Sunny', currency:'AUD (A$)', places:['Opera House','Harbour Bridge','Bondi Beach','Blue Mountains'] },
    'new york':  { emoji:'🗽', weather:'20°C / Partly Cloudy', currency:'USD ($)', places:['Statue of Liberty','Central Park','Times Square','Brooklyn Bridge'] },
    'mumbai':    { emoji:'🎬', weather:'32°C / Humid', currency:'INR (₹)', places:['Gateway of India','Marine Drive','Elephanta Caves','Bollywood Tour'] },
    'rome':      { emoji:'🍕', weather:'22°C / Sunny', currency:'EUR (€)', places:['Colosseum','Vatican City','Trevi Fountain','Sistine Chapel'] },
    'bangkok':   { emoji:'🛺', weather:'34°C / Hot', currency:'THB (฿)', places:['Grand Palace','Wat Pho','Floating Markets','Khao San Road'] },
};

// ─── Page Transitions ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('page-transition');
    if (overlay) {
        requestAnimationFrame(() => {
            overlay.classList.add('transition-exit');
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.remove('transition-exit', 'transition-active');
            }, 1000);
        });
    }
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && link.getAttribute('target') !== '_blank') {
            link.addEventListener('click', (e) => {
                const targetUrl = link.href;
                if (targetUrl.includes('#') || link.classList.contains('logout')) return;
                e.preventDefault();
                if (overlay) {
                    overlay.style.display = 'flex';
                    requestAnimationFrame(() => overlay.classList.add('transition-active'));
                    setTimeout(() => window.location.href = targetUrl, 800);
                } else {
                    window.location.href = targetUrl;
                }
            });
        }
    });
    initApp();
});

// ─── Core Router ──────────────────────────────────────────────────────────────
const initApp = () => {
    handleAuthUI();
    const path = window.location.pathname;
    if (path.includes('login.html'))            setupAuthPage();
    else if (path.includes('admin-dashboard'))  setupAdminPage();
    else if (path.includes('index.html') || path === '/' || path === '') setupHomePage();
    else if (path.includes('booking.html'))     setupBookingPage();
    else if (path.includes('checkin.html'))     setupCheckinPage();
    else if (path.includes('contact.html'))     setupContactPage();
    else if (path.includes('cancellation.html')) setupCancellationPage();
};

// ─── Auth UI Helper ───────────────────────────────────────────────────────────
const handleAuthUI = () => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    const authNav = document.getElementById('auth-nav');
    if (user && authNav) {
        const path = window.location.pathname;
        if (!path.includes('booking.html') && !path.includes('checkin.html') && !path.includes('cancellation.html')) {
            authNav.innerHTML = `<a href="#" id="logout-btn" class="nav-btn logout">Logout (${user.name})</a>`;
        }
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('airline_user');
            window.location.href = 'index.html';
        });
    }
};

const authHeader = () => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    return user
        ? { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
};

// ─── Login Type Switch (User / Admin) ─────────────────────────────────────────
window.switchLoginType = (type) => {
    const actionTabs   = document.getElementById('action-tabs');
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const adminForm    = document.getElementById('admin-login-form');
    const userTab      = document.getElementById('type-user');
    const adminTab     = document.getElementById('type-admin');
    const authMsg      = document.getElementById('auth-message');
    authMsg.innerHTML  = '';

    if (type === 'user') {
        userTab.classList.add('active'); adminTab.classList.remove('active');
        actionTabs.style.display = 'flex';
        loginForm.classList.add('active'); registerForm.classList.remove('active');
        adminForm.classList.remove('active');
    } else {
        adminTab.classList.add('active'); userTab.classList.remove('active');
        actionTabs.style.display = 'none';
        loginForm.classList.remove('active'); registerForm.classList.remove('active');
        adminForm.classList.add('active');
    }
};

// ─── Auth Page Setup ──────────────────────────────────────────────────────────
const setupAuthPage = () => {
    const loginTab     = document.getElementById('tab-login');
    const registerTab  = document.getElementById('tab-register');
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const adminForm    = document.getElementById('admin-login-form');
    const authMsg      = document.getElementById('auth-message');

    // Redirect if already logged in
    const existing = JSON.parse(localStorage.getItem('airline_user'));
    if (existing) {
        window.location.href = existing.role === 'admin' ? 'admin-dashboard.html' : 'index.html';
        return;
    }

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active'); registerTab.classList.remove('active');
        loginForm.classList.add('active'); registerForm.classList.remove('active');
        authMsg.innerHTML = '';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active'); loginTab.classList.remove('active');
        registerForm.classList.add('active'); loginForm.classList.remove('active');
        authMsg.innerHTML = '';
    });

    // User Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        authMsg.innerHTML = '<span class="loading-text">Logging in...</span>';
        try {
            const res  = await fetch(`${API_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('airline_user', JSON.stringify(data));
                window.location.href = data.role === 'admin' ? 'admin-dashboard.html' : 'index.html';
            } else {
                authMsg.innerHTML = `<span class="text-danger">❌ ${data.message}</span>`;
            }
        } catch { authMsg.innerHTML = '<span class="text-danger">Connection error. Is the server running?</span>'; }
    });

    // User Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name     = document.getElementById('register-name').value;
        const email    = document.getElementById('register-email').value;
        const phone    = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        authMsg.innerHTML = '<span class="loading-text">Creating account...</span>';
        try {
            const res  = await fetch(`${API_URL}/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('airline_user', JSON.stringify(data));
                window.location.href = 'index.html';
            } else {
                authMsg.innerHTML = `<span class="text-danger">❌ ${data.message}</span>`;
            }
        } catch { authMsg.innerHTML = '<span class="text-danger">Connection error.</span>'; }
    });

    // Admin Login
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('admin-login-email').value;
        const password = document.getElementById('admin-login-password').value;
        authMsg.innerHTML = '<span class="loading-text">Authenticating admin...</span>';
        try {
            const res  = await fetch(`${API_URL}/auth/admin-login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('airline_user', JSON.stringify(data));
                window.location.href = 'admin-dashboard.html';
            } else {
                authMsg.innerHTML = `<span class="text-danger">❌ ${data.message}</span>`;
            }
        } catch { authMsg.innerHTML = '<span class="text-danger">Connection error.</span>'; }
    });
};

// ─── Home Page (Flight Search + Tourist Section) ──────────────────────────────
const setupHomePage = () => {
    const searchForm = document.getElementById('search-form');
    fetchFlights('');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const source      = document.getElementById('source').value.trim();
        const destination = document.getElementById('destination').value.trim();
        const date        = document.getElementById('date').value;
        const query       = new URLSearchParams();
        if (source)      query.append('source', source);
        if (destination) query.append('destination', destination);
        if (date)        query.append('date', date);
        fetchFlights(query.toString());
        if (destination) showTouristTips(destination);
        else hideTouristTips();
    });
};

// Fill search form from popular cards
window.fillSearch = (from, to) => {
    const src  = document.getElementById('source');
    const dest = document.getElementById('destination');
    if (src)  src.value  = from;
    if (dest) dest.value = to;
    document.getElementById('search-form').dispatchEvent(new Event('submit'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Show tourist tips for the searched destination
const showTouristTips = (destination) => {
    const key  = destination.toLowerCase().trim();
    const data = TOURIST_DATA[key];
    const sec  = document.getElementById('tourist-section');
    const cards = document.getElementById('tourist-cards');
    const heading = document.getElementById('tourist-dest-name');
    if (!sec) return;

    heading.textContent = destination;
    sec.classList.remove('hidden');

    if (data) {
        cards.innerHTML = `
            <div class="tourist-card glassmorphism">
                <div class="t-icon">🌤️</div>
                <div><strong>Weather</strong><p>${data.weather}</p></div>
            </div>
            <div class="tourist-card glassmorphism">
                <div class="t-icon">💵</div>
                <div><strong>Currency</strong><p>${data.currency}</p></div>
            </div>
            ${data.places.map(p => `
            <div class="tourist-card glassmorphism">
                <div class="t-icon">${data.emoji}</div>
                <div><strong>Must Visit</strong><p>${p}</p></div>
            </div>`).join('')}
        `;
    } else {
        cards.innerHTML = `<div class="tourist-card glassmorphism"><div class="t-icon">🗺️</div><div><strong>${destination}</strong><p>Explore local culture, cuisine & landmarks!</p></div></div>`;
    }
};

const hideTouristTips = () => {
    const sec = document.getElementById('tourist-section');
    if (sec) sec.classList.add('hidden');
};

const fetchFlights = async (queryString) => {
    const resultsContainer = document.getElementById('flight-results');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    try {
        const res     = await fetch(`${API_URL}/flights?${queryString}`);
        const flights = await res.json();
        if (!flights.length) {
            resultsContainer.innerHTML = '<p>No flights found for this route.</p>';
            return;
        }
        resultsContainer.innerHTML = '';
        flights.forEach(f => {
            const card = document.createElement('div');
            card.className = `flight-card glassmorphism ${f.isConnecting ? 'connecting-flight' : ''}`;
            
            let routeHTML = `<span>${f.source}</span><span>✈️</span><span>${f.destination}</span>`;
            if (f.isConnecting) {
                routeHTML = `<span>${f.source}</span><span>✈️</span><span class="hub-tag">${f.hub}</span><span>✈️</span><span>${f.destination}</span>`;
            }

            card.innerHTML = `
                <div class="flight-airline">
                    <img src="https://via.placeholder.com/30?text=${f.airlineName.substring(0,1)}" alt="logo">
                    ${f.airlineName} <small>(${f.flightId})</small>
                </div>
                <div class="flight-route">
                    ${routeHTML}
                </div>
                <div class="flight-time-grid">
                    <div class="time-block">
                        <span class="label">Departure</span>
                        <span class="value">${new Date(f.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span class="date">${new Date(f.departureTime).toLocaleDateString()}</span>
                    </div>
                    <div class="duration-block">
                        <div class="line"></div>
                        <span class="duration">${f.isConnecting ? 'Multi-city' : 'Direct'}</span>
                    </div>
                    <div class="time-block text-right">
                        <span class="label">Arrival</span>
                        <span class="value">${new Date(f.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span class="date">${new Date(f.arrivalTime).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flight-footer">
                    <div class="flight-price">₹${f.adjustedPrice}</div>
                    <button class="btn-primary book-btn-trigger">Book Now</button>
                </div>
            `;
            resultsContainer.appendChild(card);
            
            // Attach event listener instead of inline onclick for safety
            const bookBtn = card.querySelector('.book-btn-trigger');
            if (bookBtn) {
                bookBtn.onclick = () => {
                    window.goToPassengerForm(f._id, f.adjustedPrice, f.destination, f.airlineName, f.source, f.flightId);
                };
            }
        });
    } catch { resultsContainer.innerHTML = '<p>Error loading flights.</p>'; }
};

// Navigate to booking page with flight data stored
window.goToPassengerForm = (flightId, price, dest, airline, source, flightCode) => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    if (!user) { alert('Please login to book a flight'); window.location.href = 'login.html'; return; }
    localStorage.setItem('pending_flight', JSON.stringify({ flightId, price, dest, airline, source, flightCode }));
    window.location.href = 'booking.html?action=new';
};

// ─── Booking Page ─────────────────────────────────────────────────────────────
const setupBookingPage = async () => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    if (!user) { window.location.href = 'login.html'; return; }

    const urlParams = new URLSearchParams(window.location.search);

    // New booking flow: show passenger form first
    if (urlParams.get('action') === 'new') {
        const pending = JSON.parse(localStorage.getItem('pending_flight'));
        if (pending) showPassengerModal(pending);
    }

    // Show destination popup after redirect
    if (urlParams.get('new_booking') === 'true') {
        const dest = localStorage.getItem('recent_booking_dest');
        showDestinationPopup(dest);
    }

    fetchBookings();
    setupPaymentMethodUI();
    setupPassengerModal();
};

// Show destination popup with tourist info
const showDestinationPopup = (dest) => {
    const modal   = document.getElementById('destination-popup');
    const cityEl  = document.getElementById('dest-city');
    const infoEl  = document.getElementById('dest-info-container');
    if (!modal) return;
    cityEl.innerText = dest || 'your destination';
    const key  = (dest || '').toLowerCase().trim();
    const data = TOURIST_DATA[key];
    infoEl.innerHTML = data ? `
        <div class="info-card"><span>🌤️ Weather:</span> ${data.weather}</div>
        <div class="info-card"><span>💵 Currency:</span> ${data.currency}</div>
        <div class="info-card"><span>${data.emoji} Top Spots:</span> ${data.places.slice(0,2).join(', ')}</div>
    ` : `<div class="info-card"><span>🗺️ Explore</span> ${dest} – discover local culture & attractions!</div>`;
    modal.classList.remove('hidden');
    document.getElementById('close-modal-btn').onclick = () => {
        modal.classList.add('hidden');
        localStorage.removeItem('recent_booking_dest');
        localStorage.removeItem('pending_flight');
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchBookings();
    };
};

// Show passenger details form modal (before payment)
const showPassengerModal = (pending) => {
    const modal = document.getElementById('passenger-modal');
    if (!modal) return;
    document.getElementById('pass-booking-ref').innerText = `${pending.airline} | ${pending.source} → ${pending.dest}`;
    document.getElementById('pass-amount').innerText = pending.price;

    const numInput = document.getElementById('num-passengers');
    const container = document.getElementById('passenger-forms-container');

    const updateForms = () => {
        const count = parseInt(numInput.value) || 1;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            container.innerHTML += `
                <div class="passenger-form-block mt-3 p-3 glassmorphism">
                    <h4>Passenger ${i + 1}</h4>
                    <div class="form-row">
                        <div class="input-group">
                            <label>Full Name</label>
                            <input id="pax-name-${i}" type="text" placeholder="As on passport" required>
                        </div>
                        <div class="input-group">
                            <label>Age</label>
                            <input id="pax-age-${i}" type="number" placeholder="e.g. 28" min="1" max="120" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="input-group">
                            <label>Date of Birth</label>
                            <input id="pax-dob-${i}" type="date" required>
                        </div>
                        <div class="input-group">
                            <label>Passport Number</label>
                            <input id="pax-passport-${i}" type="text" placeholder="e.g. A1234567" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="input-group">
                            <label>Gender</label>
                            <select id="pax-gender-${i}">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <p class="muted small text-center mt-2">Enter name exactly as in passport or ID proof</p>
                </div>
            `;
        }
    };

    numInput.onchange = updateForms;
    updateForms();
    modal.classList.remove('hidden');
};

const setupPassengerModal = () => {
    const confirmBtn = document.getElementById('confirm-passengers-btn');
    const cancelBtn  = document.getElementById('cancel-passenger-btn');
    if (!confirmBtn) return;

    confirmBtn.onclick = async () => {
        const pending  = JSON.parse(localStorage.getItem('pending_flight'));
        if (!pending) return;

        const numPassengers = parseInt(document.getElementById('num-passengers').value) || 1;
        const flightClass = document.getElementById('flight-class').value;
        const passengerDetails = [];

        for (let i = 0; i < numPassengers; i++) {
            const name = document.getElementById(`pax-name-${i}`)?.value?.trim();
            const age = document.getElementById(`pax-age-${i}`)?.value;
            const dob = document.getElementById(`pax-dob-${i}`)?.value;
            const gender = document.getElementById(`pax-gender-${i}`)?.value;
            const passportNumber = document.getElementById(`pax-passport-${i}`)?.value?.trim();

            if (!name || !age || !dob || !passportNumber) {
                alert(`Please fill in all details (including Passport) for Passenger ${i + 1}.`);
                return;
            }
            passengerDetails.push({ name, age: parseInt(age), dob, gender, passportNumber });
        }

        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Creating reservation...';
        try {
            const res  = await fetch(`${API_URL}/bookings`, {
                method: 'POST', headers: authHeader(),
                body: JSON.stringify({
                    flightId: pending.flightId,
                    passengerDetails,
                    totalPrice: pending.price * numPassengers,
                    numPassengers,
                    class: flightClass
                })
            });
            const data = await res.json();
            if (res.ok) {
                document.getElementById('passenger-modal').classList.add('hidden');
                localStorage.setItem('recent_booking_dest', pending.dest);
                window.location.href = 'booking.html?new_booking=true';
            } else { 
                alert(data.message); 
                confirmBtn.disabled = false; 
                confirmBtn.innerText = 'Book Ticket'; 
            }
        } catch { 
            alert('Booking failed. Try again.'); 
            confirmBtn.disabled = false; 
            confirmBtn.innerText = 'Book Ticket'; 
        }
    };

    cancelBtn.onclick = () => {
        document.getElementById('passenger-modal').classList.add('hidden');
        localStorage.removeItem('pending_flight');
    };
};

// Dynamic payment field rendering based on selected method
const setupPaymentMethodUI = () => {
    const radios    = document.querySelectorAll('input[name="pay-method"]');
    const fieldsDiv = document.getElementById('pay-fields');
    if (!radios.length || !fieldsDiv) return;

    const renderFields = (method) => {
        const templates = {
            netbanking: `<div class="input-group"><label>Bank Name</label><input type="text" placeholder="e.g. HDFC Bank"></div>
                         <div class="input-group"><label>Account No.</label><input type="text" placeholder="XXXXXXXXXXXX"></div>`,
            creditcard: `<div class="input-group"><label>Card Number</label><input type="text" placeholder="XXXX XXXX XXXX XXXX" maxlength="19"></div>
                         <div class="form-row">
                           <div class="input-group"><label>Expiry</label><input type="text" placeholder="MM/YY" maxlength="5"></div>
                           <div class="input-group"><label>CVV</label><input type="password" placeholder="***" maxlength="3"></div>
                         </div>`,
            debitcard: `<div class="input-group"><label>Card Number</label><input type="text" placeholder="XXXX XXXX XXXX XXXX" maxlength="19"></div>
                        <div class="form-row">
                          <div class="input-group"><label>Expiry</label><input type="text" placeholder="MM/YY" maxlength="5"></div>
                          <div class="input-group"><label>CVV</label><input type="password" placeholder="***" maxlength="3"></div>
                        </div>`,
            upi: `<div class="input-group"><label>UPI ID</label><input type="text" placeholder="yourname@upi"></div>`
        };
        fieldsDiv.innerHTML = templates[method] || '';
    };

    radios.forEach(r => r.addEventListener('change', () => renderFields(r.value)));
    renderFields('netbanking'); // default
};

// Payment simulation
window.openPaymentModal = (id, amount, ref) => {
    document.getElementById('pay-booking-id').innerText = ref;
    document.getElementById('pay-amount').innerText  = amount;
    const btn = document.getElementById('simulate-payment-btn');
    btn.dataset.bid = id;
    btn.dataset.amt = amount;
    document.getElementById('payment-modal').classList.remove('hidden');
    setupPaymentMethodUI();
};

document.addEventListener('DOMContentLoaded', () => {
    const payBtn = document.getElementById('simulate-payment-btn');
    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            const bookingId = payBtn.dataset.bid;
            const amount    = payBtn.dataset.amt;
            const method    = document.querySelector('input[name="pay-method"]:checked')?.value || 'netbanking';
            payBtn.disabled = true; payBtn.innerText = 'Processing...';
            try {
                const res  = await fetch(`${API_URL}/payment`, {
                    method: 'POST', headers: authHeader(),
                    body: JSON.stringify({ bookingId, amount, method })
                });
                const data = await res.json();
                document.getElementById('payment-modal').classList.add('hidden');
                payBtn.disabled = false; payBtn.innerText = '🔒 Pay Securely';
                if (res.ok) {
                    showPaymentSuccessToast(data.message || 'Payment successful!');
                    fetchBookings();
                } else { alert(data.message); }
            } catch { alert('Payment error'); payBtn.disabled = false; payBtn.innerText = '🔒 Pay Securely'; }
        });
    }
    const cancelPayBtn = document.getElementById('cancel-payment-btn');
    if (cancelPayBtn) cancelPayBtn.onclick = () => document.getElementById('payment-modal').classList.add('hidden');
});

const showPaymentSuccessToast = (msg) => {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `✅ ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 3500);
};

window.goToCancellationPage = (id) => {
    window.location.href = `cancellation.html?id=${id}`;
};

// ─── Cancellation Page ────────────────────────────────────────────────────────
const setupCancellationPage = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');
    if (!bookingId) { window.location.href = 'booking.html'; return; }

    const user = JSON.parse(localStorage.getItem('airline_user'));
    if (!user) { window.location.href = 'login.html'; return; }

    const loading = document.getElementById('cancel-loading');
    const content = document.getElementById('cancel-content');
    const confirmBtn = document.getElementById('confirm-cancel-page-btn');

    try {
        const res = await fetch(`${API_URL}/bookings`, { headers: authHeader() });
        const bookings = await res.json();
        const b = bookings.find(x => x._id === bookingId);

        if (!b) { alert('Booking not found'); window.location.href = 'booking.html'; return; }

        document.getElementById('c-flight').innerText = `${b.flightId.airlineName} (${b.flightId.flightId})`;
        document.getElementById('c-route').innerText  = `${b.flightId.source} → ${b.flightId.destination}`;
        document.getElementById('c-dep').innerText    = `Departure: ${new Date(b.flightId.departureTime).toLocaleString()}`;

        // Calculate fees based on rules (similar to backend for instant feedback)
        const now = new Date();
        const dep = new Date(b.flightId.departureTime);
        const diffHours = (dep - now) / (1000 * 60 * 60);

        let fee = 0;
        let allowed = true;
        let error = "";

        if (b.status === 'Cancelled') { allowed = false; error = "This booking is already cancelled."; }
        else if (diffHours < 0) { allowed = false; error = "Flight has already departed."; }
        else if (diffHours > 48) fee = 200;
        else if (diffHours >= 24) fee = 500;
        else if (diffHours >= 2) fee = 1000;
        else { allowed = false; error = "Cancellation not allowed less than 2 hours before departure."; }

        document.getElementById('r-price').innerText   = `₹${b.totalPrice}`;
        document.getElementById('r-charges').innerText = `₹${fee}`;
        document.getElementById('r-total').innerText   = `₹${Math.max(0, b.totalPrice - fee)}`;

        if (allowed) {
            confirmBtn.onclick = () => performCancellation(bookingId);
        } else {
            confirmBtn.disabled = true;
            document.getElementById('eligibility-error').classList.remove('hidden');
            document.getElementById('error-msg').innerText = error;
        }

        loading.classList.add('hidden');
        content.classList.remove('hidden');

        // Toggle Refund Procedure Details
        const refundProcBtn = document.getElementById('refund-proc-btn');
        const refundDetailsTab = document.getElementById('refund-details-tab');
        if (refundProcBtn && refundDetailsTab) {
            refundProcBtn.addEventListener('click', () => {
                const isHidden = refundDetailsTab.classList.toggle('hidden');
                refundProcBtn.innerText = isHidden ? '📋 View Refund Procedure & Eligibility' : '✖ Hide Procedure Details';
            });
        }

    } catch { alert('Error loading cancellation details'); }
};

const performCancellation = async (id) => {
    const btn = document.getElementById('confirm-cancel-page-btn');
    btn.disabled = true; btn.innerText = 'Cancelling...';
    try {
        const res  = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE', headers: authHeader() });
        const data = await res.json();
        if (res.ok) {
            const refundMsg = `₹${data.refundAmount} credited to your account. Refund initiated for ${data.bookingId || 'this booking'}. Information sent to your registered mobile number.`;
            showPaymentSuccessToast(refundMsg);
            setTimeout(() => window.location.href = 'booking.html', 3000);
        } else { alert(data.message); btn.disabled = false; btn.innerText = 'Confirm Cancellation'; }
    } catch { alert('Cancellation error'); btn.disabled = false; btn.innerText = 'Confirm Cancellation'; }
};

// Fetch and render My Bookings
const fetchBookings = async () => {
    const container = document.getElementById('bookings-container');
    const user      = JSON.parse(localStorage.getItem('airline_user'));
    if (!user) { container.innerHTML = '<p>Please login first.</p>'; return; }
    try {
        const res      = await fetch(`${API_URL}/bookings`, { headers: authHeader() });
        const bookings = await res.json();
        if (!bookings.length) { container.innerHTML = '<p class="placeholder-text">You have no bookings yet. <a href="index.html">Search flights</a></p>'; return; }

        const statuses = ['Booked','Paid','Checked-In','Boarding Pass Generated','Ready to Fly'];
        container.innerHTML = '';
        bookings.forEach(b => {
            const card      = document.createElement('div');
            card.className  = 'booking-card glassmorphism';
            const currIdx   = b.status === 'Cancelled' ? -1 : statuses.indexOf(b.status);
            const progressHTML = `<div class="status-progress">${statuses.map((s,i) => `<span class="${i<=currIdx?'step-done':''}">${i===currIdx&&i>0?'✈️ ':''}${s}</span>`).join('')}</div>`;

            let actionBtn = '';
            if (b.status === 'Booked') {
                actionBtn = `<button class="btn-success pay-btn-trigger">💳 Pay Now</button>
                             <button class="btn-danger ml-1 cancel-btn-trigger">❌ Cancel</button>`;
            } else if (b.status === 'Paid') {
                actionBtn = `<a href="checkin.html" class="btn-primary" style="text-decoration:none;">🛫 Go Check-In</a>
                             <button class="btn-danger ml-1 cancel-btn-trigger">❌ Cancel</button>`;
            } else if (b.status === 'Cancelled') {
                actionBtn = `<span class="badge-cancelled">Refund Processed</span>`;
            } else {
                actionBtn = `<a href="checkin.html" class="btn-secondary" style="text-decoration:none;color:var(--success);">🎫 View Boarding Pass</a>
                             <button class="btn-secondary ml-1 download-btn-trigger">📥 Download Ticket</button>`;
            }

            card.innerHTML = `
                <div style="width:100%;">
                    <div class="booking-header-row">
                        <div class="booking-info">
                            <h3>${b.flightId?b.flightId.airlineName:'Flight'} <small>(${b.bookingId})</small></h3>
                            <p>${b.flightId?b.flightId.source+' → '+b.flightId.destination:'N/A'}</p>
                            <p>Status: <strong>${b.status}</strong></p>
                            <p>Total: <strong>₹${b.totalPrice}</strong></p>
                        </div>
                        <div class="booking-status-col">
                            <span class="status-badge status-${b.status.replace(/\s/g,'-').toLowerCase()}">${b.status}</span>
                            <div style="margin-top:0.75rem;">${actionBtn}</div>
                        </div>
                    </div>
                    ${b.status!=='Cancelled'?progressHTML:''}
                </div>`;
            container.appendChild(card);

            // Attach listeners
            const pBtn = card.querySelector('.pay-btn-trigger');
            if (pBtn) pBtn.onclick = () => window.openPaymentModal(b._id, b.totalPrice, b.bookingId);
            
            const cBtn = card.querySelector('.cancel-btn-trigger');
            if (cBtn) cBtn.onclick = () => window.goToCancellationPage(b._id);

            const dBtn = card.querySelector('.download-btn-trigger');
            if (dBtn) dBtn.onclick = () => window.downloadTicketFromBooking(b._id, b.bookingId);
        });
    } catch { container.innerHTML = '<p>Error loading bookings.</p>'; }
};

// Payment simulation
window.openPaymentModal = (id, amount, ref) => {
    document.getElementById('pay-booking-id').innerText = ref;
    document.getElementById('pay-amount').innerText  = amount;
    const btn = document.getElementById('simulate-payment-btn');
    btn.dataset.bid = id;
    btn.dataset.amt = amount;
    document.getElementById('payment-modal').classList.remove('hidden');
    setupPaymentMethodUI();
};

document.addEventListener('DOMContentLoaded', () => {
    const payBtn = document.getElementById('simulate-payment-btn');
    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            const bookingId = payBtn.dataset.bid;
            const amount    = payBtn.dataset.amt;
            const method    = document.querySelector('input[name="pay-method"]:checked')?.value || 'netbanking';
            payBtn.disabled = true; payBtn.innerText = 'Processing...';
            try {
                const res  = await fetch(`${API_URL}/payment`, {
                    method: 'POST', headers: authHeader(),
                    body: JSON.stringify({ bookingId, amount, method })
                });
                const data = await res.json();
                document.getElementById('payment-modal').classList.add('hidden');
                payBtn.disabled = false; payBtn.innerText = '🔒 Pay Securely';
                if (res.ok) {
                    showPaymentSuccessToast(data.message || 'Payment successful!');
                    fetchBookings();
                } else { alert(data.message); }
            } catch { alert('Payment error'); payBtn.disabled = false; payBtn.innerText = '🔒 Pay Securely'; }
        });
    }
    const cancelPayBtn = document.getElementById('cancel-payment-btn');
    if (cancelPayBtn) cancelPayBtn.onclick = () => document.getElementById('payment-modal').classList.add('hidden');
});

window.downloadTicketFromBooking = (id, ref) => alert(`Ticket ${ref} download — go to Check-In page to download the PDF.`);

// ─── Check-In Page ────────────────────────────────────────────────────────────
let _checkinBookingRef = null; // stores current booking _id during check-in flow

const setupCheckinPage = async () => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    if (!user) { window.location.href = 'login.html'; return; }

    const listContainer = document.getElementById('paid-bookings-list');
    try {
        const res      = await fetch(`${API_URL}/bookings`, { headers: authHeader() });
        const bookings = await res.json();
        const eligible = bookings.filter(b => ['Paid','Checked-In','Boarding Pass Generated','Ready to Fly'].includes(b.status));

        if (!eligible.length) {
            listContainer.innerHTML = '<p class="placeholder-text">No bookings eligible for check-in. <a href="booking.html">View Bookings</a></p>';
            return;
        }
        listContainer.innerHTML = '';
        eligible.forEach(b => {
            const dep    = new Date(b.flightId.departureTime);
            const now    = new Date();
            const diffHours = (dep - now) / (1000*60*60);
            const canCheckin = diffHours <= 2 && diffHours >= 0;
            const boardingReady = ['Boarding Pass Generated','Ready to Fly'].includes(b.status);

            const card = document.createElement('div');
            card.className = 'glassmorphism checkin-booking-card';
            card.innerHTML = `
                <h4>${b.bookingId} — ${b.flightId.source} → ${b.flightId.destination}</h4>
                <p class="muted">Departure: ${dep.toLocaleString()}</p>
                <p>Status: <span class="status-badge status-${b.status.replace(/\s/g,'-').toLowerCase()}">${b.status}</span></p>
                ${boardingReady
                    ? `<button class="btn-primary mt-2 bp-btn-trigger">🎫 View Boarding Pass</button>`
                    : canCheckin
                        ? `<button class="btn-success mt-2 checkin-btn-trigger">🛫 Check-In Now</button>`
                        : `<div class="checkin-unavailable">⏳ Check-in opens <strong>2 hours</strong> before departure</div>`
                }
            `;
            listContainer.appendChild(card);

            const bpBtn = card.querySelector('.bp-btn-trigger');
            if (bpBtn) bpBtn.onclick = () => window.loadBoardingPass(b._id);

            const ciBtn = card.querySelector('.checkin-btn-trigger');
            if (ciBtn) ciBtn.onclick = () => window.showSeatMap(b._id, b.bookingId, b.flightId._id, b.passengerDetails.length);
        });
    } catch { listContainer.innerHTML = '<p>Error loading bookings.</p>'; }
};

// Show seat map for a flight
window.showSeatMap = async (id, readableId, flightId, passengerCount) => {
    _checkinBookingRef = id;
    document.getElementById('checkin-form-container').classList.add('hidden');
    const seatContainer = document.getElementById('seat-selection-container');
    seatContainer.classList.remove('hidden');
    document.getElementById('seat-selection-info').innerText = `Select ${passengerCount} seat(s) and provide ID verification.`;
    
    const bIdField = document.getElementById('checkin-booking-id');
    if (bIdField) bIdField.value = readableId;

    const seatMap  = document.getElementById('seat-map');
    seatMap.innerHTML = '<p>Loading seat map...</p>';
    try {
        const res  = await fetch(`${API_URL}/checkin/seats/${flightId}`, { headers: authHeader() });
        const data = await res.json();
        renderSeatMap(data.allSeats, passengerCount);
    } catch { seatMap.innerHTML = '<p>Error loading seats.</p>'; }
};

let _selectedSeats = [];
const renderSeatMap = (seats, maxSelect) => {
    const seatMap = document.getElementById('seat-map');
    _selectedSeats = [];
    // Group by row number
    seatMap.innerHTML = '';
    const rows = {};
    seats.forEach(s => {
        const col = s.seatId.replace(/[A-Z]/g,'');
        if (!rows[col]) rows[col] = [];
        rows[col].push(s);
    });
    // Header row
    const header = document.createElement('div');
    header.className = 'seat-row seat-header';
    header.innerHTML = '<span class="row-label"></span><span>A</span><span>B</span><span>C</span><span class="aisle"></span><span>D</span><span>E</span><span>F</span>';
    seatMap.appendChild(header);

    Object.keys(rows).forEach(rowNum => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        rowDiv.innerHTML = `<span class="row-label">${rowNum}</span>`;
        const sorted = rows[rowNum].sort((a,b) => a.seatId.localeCompare(b.seatId));
        sorted.forEach((s, i) => {
            if (i === 3) { const aisle = document.createElement('span'); aisle.className='aisle'; rowDiv.appendChild(aisle); }
            const btn = document.createElement('button');
            btn.className = `seat ${s.available ? 'available' : 'booked'}`;
            btn.textContent = s.seatId;
            btn.disabled = !s.available;
            btn.onclick = () => {
                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected'); btn.classList.add('available');
                    _selectedSeats = _selectedSeats.filter(x => x !== s.seatId);
                } else if (_selectedSeats.length < maxSelect) {
                    btn.classList.add('selected'); btn.classList.remove('available');
                    _selectedSeats.push(s.seatId);
                }
                document.getElementById('selected-seat-display').innerText = _selectedSeats.join(', ') || 'None';
                document.getElementById('confirm-seat-btn').disabled = _selectedSeats.length !== maxSelect;
            };
            rowDiv.appendChild(btn);
        });
        seatMap.appendChild(rowDiv);
    });

    document.getElementById('confirm-seat-btn').onclick = () => confirmCheckin(_checkinBookingRef, _selectedSeats);
    document.getElementById('cancel-seat-btn').onclick  = () => {
        document.getElementById('seat-selection-container').classList.add('hidden');
        document.getElementById('checkin-form-container').classList.remove('hidden');
    };
};

const confirmCheckin = async (bookingId, seats) => {
    const idType = document.getElementById('checkin-id-type').value;
    const idNumber = document.getElementById('checkin-id-number').value.trim();

    if (!idNumber) {
        alert('Please enter your ID Number.');
        return;
    }

    const btn = document.getElementById('confirm-seat-btn');
    btn.disabled = true; btn.innerText = 'Confirming...';
    try {
        const res  = await fetch(`${API_URL}/checkin`, {
            method: 'POST', headers: authHeader(),
            body: JSON.stringify({ bookingId, seatSelections: seats, idType, idNumber })
        });
        const data = await res.json();
        if (res.ok) {
            showPaymentSuccessToast('Check-in Successful! Boarding pass generated.');
            loadBoardingPass(bookingId);
        } else { alert(data.message); btn.disabled = false; btn.innerText = 'Confirm Seat & Check-In'; }
    } catch { alert('Check-in error'); btn.disabled = false; btn.innerText = 'Confirm Seat & Check-In'; }
};

window.loadBoardingPass = async (id) => {
    document.getElementById('checkin-form-container').classList.add('hidden');
    document.getElementById('seat-selection-container').classList.add('hidden');
    document.getElementById('boarding-pass-container').classList.remove('hidden');
    try {
        const res  = await fetch(`${API_URL}/checkin/${id}/boarding-pass`, { headers: authHeader() });
        const data = await res.json();
        const f    = data.flight;
        document.getElementById('bp-from-code').innerText    = f.source.substring(0,3).toUpperCase();
        document.getElementById('bp-from-name').innerText    = f.source;
        document.getElementById('bp-to-code').innerText      = f.destination.substring(0,3).toUpperCase();
        document.getElementById('bp-to-name').innerText      = f.destination;
        document.getElementById('bp-passengers').innerText   = data.passengers.map(p=>p.name).join(', ');
        document.getElementById('bp-flight').innerText       = `${f.airlineName} (${f.flightId||''})`;
        document.getElementById('bp-ref').innerText          = data.bookingId;
        document.getElementById('bp-seat').innerText         = data.passengers.map(p=>p.seatNumber||'TBD').join(', ');
        document.getElementById('bp-departure').innerText    = new Date(f.departureTime).toLocaleString();
        document.getElementById('bp-status-badge').innerText = data.status;
        document.getElementById('bp-qrcode').src            = data.qrCode;
        // Store for PDF download
        window._currentBoardingData = data;
    } catch { alert('Error loading boarding pass'); }
};

// ─── PDF Download (Boarding Pass) ────────────────────────────────────────────
window.downloadBoardingPass = () => {
    const el = document.getElementById('boarding-pass-card');
    if (!el) return;
    // Use browser print as PDF fallback (works without external lib)
    const printWin = window.open('', '_blank');
    printWin.document.write(`<html><head><title>Boarding Pass</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body{font-family:'Outfit',sans-serif;padding:2rem;background:#0a0f1e;color:#fff;}
            .bp-header{display:flex;justify-content:space-between;border-bottom:2px solid #6c63ff;padding-bottom:1rem;margin-bottom:1rem;}
            .bp-route{display:flex;justify-content:space-between;align-items:center;font-size:2rem;margin:1.5rem 0;}
            .bp-details-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem;}
            .bp-detail{background:rgba(255,255,255,0.08);padding:0.75rem;border-radius:8px;}
            .bp-label{font-size:0.75rem;color:#aaa;display:block;}
            .bp-value{font-size:1rem;font-weight:600;}
            .qr-section{text-align:center;margin-top:1.5rem;}
            img{width:180px;}
        </style></head><body>
        ${el.outerHTML}
    </body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
};

// ─── PDF Download (Ticket) ───────────────────────────────────────────────────
window.downloadTicket = () => {
    const data = window._currentBoardingData;
    if (!data) return;
    const f   = data.flight;
    const printWin = window.open('', '_blank');
    printWin.document.write(`<html><head><title>Flight Ticket</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
        <style>body{font-family:'Outfit',sans-serif;padding:2rem;background:#fff;color:#222;}h1{color:#6c63ff;}table{width:100%;border-collapse:collapse;margin-top:1rem;}th,td{border:1px solid #ddd;padding:0.75rem;}th{background:#6c63ff;color:#fff;}</style>
        </head><body>
        <h1>✈️ FlyNow Airlines — Flight Ticket</h1>
        <table>
            <tr><th>Booking Ref</th><td>${data.bookingId}</td></tr>
            <tr><th>Flight</th><td>${f.airlineName} (${f.flightId||''})</td></tr>
            <tr><th>From</th><td>${f.source}</td></tr>
            <tr><th>To</th><td>${f.destination}</td></tr>
            <tr><th>Departure</th><td>${new Date(f.departureTime).toLocaleString()}</td></tr>
            <tr><th>Arrival</th><td>${new Date(f.arrivalTime).toLocaleString()}</td></tr>
            <tr><th>Passengers</th><td>${data.passengers.map(p=>`${p.name} (Seat ${p.seatNumber||'TBD'})`).join('<br>')}</td></tr>
            <tr><th>Status</th><td><strong>${data.status}</strong></td></tr>
        </table>
        <p style="margin-top:2rem;color:#888;">Issued by FlyNow Airlines — Have a comfortable journey!</p>
    </body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
};

// ─── Contact Page ─────────────────────────────────────────────────────────────
const setupContactPage = () => {
    const form     = document.getElementById('contact-form');
    const alertBox = document.getElementById('contact-alert');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res  = await fetch(`${API_URL}/contact`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:    document.getElementById('contact-name').value,
                    email:   document.getElementById('contact-email').value,
                    message: document.getElementById('contact-message').value
                })
            });
            const data = await res.json();
            if (res.ok) { alertBox.innerHTML = `<span class="text-success">✅ ${data.message}</span>`; form.reset(); }
            else         { alertBox.innerHTML = `<span class="text-danger">❌ Error sending message</span>`; }
        } catch { alertBox.innerHTML = `<span class="text-danger">❌ Connection error</span>`; }
    });
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
const setupAdminPage = () => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    if (!user || user.role !== 'admin') { alert('Admin access required.'); window.location.href = 'login.html'; return; }
    document.getElementById('admin-user-display').innerText = `👋 ${user.name}`;
    document.getElementById('admin-logout').onclick = () => { localStorage.removeItem('airline_user'); window.location.href = 'login.html'; };

    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
            document.getElementById(`section-${section}`).classList.remove('hidden');
            const titles = { dashboard:'Dashboard Overview', flights:'Manage Flights', bookings:'All Bookings', users:'Manage Users' };
            document.getElementById('admin-section-title').innerText = titles[section] || section;
            if (section === 'dashboard') loadAdminStats();
            if (section === 'flights')   loadAdminFlights();
            if (section === 'bookings')  loadAdminBookings();
            if (section === 'users')     loadAdminUsers();
        });
    });

    loadAdminStats();

    // Add flight button
    document.getElementById('add-flight-btn').onclick = () => {
        document.getElementById('flight-form-container').classList.remove('hidden');
        document.getElementById('flight-form-title').innerText = 'Add New Flight';
        document.getElementById('flight-form').reset();
        document.getElementById('f-editing-id').value = '';
    };
    document.getElementById('cancel-flight-form').onclick = () => document.getElementById('flight-form-container').classList.add('hidden');
    document.getElementById('flight-form').addEventListener('submit', saveAdminFlight);
};

const adminFetch = (path, opts={}) => fetch(`${API_URL}/admin${path}`, { ...opts, headers: { ...authHeader(), ...(opts.headers||{}) } });

const loadAdminStats = async () => {
    try {
        const res  = await adminFetch('/stats');
        const data = await res.json();
        document.getElementById('stat-flights').innerText  = data.totalFlights;
        document.getElementById('stat-bookings').innerText = data.totalBookings;
        document.getElementById('stat-users').innerText    = data.totalUsers;
        document.getElementById('stat-revenue').innerText  = `₹${data.totalRevenue.toFixed(2)}`;
        // Recent bookings mini-table
        const recentRes  = await adminFetch('/bookings');
        const recentData = await recentRes.json();
        const recent5    = recentData.slice(0,5);
        document.getElementById('recent-bookings-table').innerHTML = `
        <table class="admin-table"><thead><tr><th>Booking ID</th><th>Passenger</th><th>Flight</th><th>Status</th></tr></thead>
        <tbody>${recent5.map(b=>`<tr>
            <td>${b.bookingId}</td>
            <td>${b.userId?.name||'N/A'}</td>
            <td>${b.flightId?b.flightId.source+' → '+b.flightId.destination:'N/A'}</td>
            <td><span class="status-badge status-${(b.status||'').replace(/\s/g,'-').toLowerCase()}">${b.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    } catch { console.error('Stats load error'); }
};

const loadAdminFlights = async () => {
    const container = document.getElementById('flights-table-container');
    container.innerHTML = '<div class="loader"></div>';
    try {
        const res     = await adminFetch('/flights');
        const flights = await res.json();
        container.innerHTML = `
        <table class="admin-table"><thead><tr><th>Flight ID</th><th>Airline</th><th>Route</th><th>Departure</th><th>Price</th><th>Seats</th><th>Actions</th></tr></thead>
        <tbody>${flights.map(f=>`<tr>
            <td>${f.flightId}</td><td>${f.airlineName}</td>
            <td>${f.source} → ${f.destination}</td>
            <td>${new Date(f.departureTime).toLocaleString()}</td>
            <td>₹${f.basePrice}</td><td>${f.seatsAvailable}</td>
            <td>
                <button class="btn-sm btn-success edit-flight-trigger" data-id="${f._id}">Edit</button>
                <button class="btn-sm btn-danger ml-1 delete-flight-trigger" data-id="${f._id}">Delete</button>
            </td>
        </tr>`).join('')}</tbody></table>`;

        // Attach listeners
        container.querySelectorAll('.edit-flight-trigger').forEach(btn => {
            btn.onclick = () => window.editAdminFlight(btn.dataset.id);
        });
        container.querySelectorAll('.delete-flight-trigger').forEach(btn => {
            btn.onclick = () => window.deleteAdminFlight(btn.dataset.id);
        });
    } catch { container.innerHTML = '<p>Error loading flights.</p>'; }
};

window.editAdminFlight = async (id) => {
    const res  = await adminFetch('/flights');
    const data = await res.json();
    const f    = data.find(x => x._id === id);
    if (!f) return;
    const toLocal = (dt) => new Date(dt).toISOString().slice(0,16);
    document.getElementById('f-editing-id').value   = f._id;
    document.getElementById('f-flightId').value     = f.flightId;
    document.getElementById('f-airlineName').value  = f.airlineName;
    document.getElementById('f-source').value       = f.source;
    document.getElementById('f-destination').value  = f.destination;
    document.getElementById('f-departureTime').value = toLocal(f.departureTime);
    document.getElementById('f-arrivalTime').value  = toLocal(f.arrivalTime);
    document.getElementById('f-basePrice').value    = f.basePrice;
    document.getElementById('f-seatsAvailable').value = f.seatsAvailable;
    document.getElementById('flight-form-title').innerText = 'Edit Flight';
    document.getElementById('flight-form-container').classList.remove('hidden');
};

window.deleteAdminFlight = async (id) => {
    if (!confirm('Delete this flight?')) return;
    const res = await adminFetch(`/flights/${id}`, { method: 'DELETE' });
    const d   = await res.json();
    alert(d.message);
    loadAdminFlights();
};

const saveAdminFlight = async (e) => {
    e.preventDefault();
    const editId = document.getElementById('f-editing-id').value;
    const body   = {
        flightId:       document.getElementById('f-flightId').value,
        airlineName:    document.getElementById('f-airlineName').value,
        source:         document.getElementById('f-source').value,
        destination:    document.getElementById('f-destination').value,
        departureTime:  document.getElementById('f-departureTime').value,
        arrivalTime:    document.getElementById('f-arrivalTime').value,
        basePrice:      parseFloat(document.getElementById('f-basePrice').value),
        seatsAvailable: parseInt(document.getElementById('f-seatsAvailable').value) || 60
    };
    const method = editId ? 'PUT' : 'POST';
    const path   = editId ? `/flights/${editId}` : '/flights';
    try {
        const res  = await adminFetch(path, { method, body: JSON.stringify(body) });
        const data = await res.json();
        if (res.ok) {
            alert(editId ? 'Flight updated!' : 'Flight added!');
            document.getElementById('flight-form-container').classList.add('hidden');
            document.getElementById('flight-form').reset();
            loadAdminFlights();
        } else { alert(data.message); }
    } catch { alert('Save error'); }
};

const loadAdminBookings = async () => {
    const container = document.getElementById('bookings-table-container');
    container.innerHTML = '<div class="loader"></div>';
    try {
        const res      = await adminFetch('/bookings');
        const bookings = await res.json();
        container.innerHTML = `
        <table class="admin-table"><thead><tr><th>Booking ID</th><th>User</th><th>Flight</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${bookings.map(b=>`<tr>
            <td>${b.bookingId}</td>
            <td>${b.userId?.name||'N/A'}<br><small>${b.userId?.email||''}</small></td>
            <td>${b.flightId?b.flightId.source+' → '+b.flightId.destination:'N/A'}</td>
            <td>₹${b.totalPrice}</td>
            <td><span class="status-badge status-${(b.status||'').replace(/\s/g,'-').toLowerCase()}">${b.status}</span></td>
            <td>${new Date(b.createdAt).toLocaleDateString()}</td>
        </tr>`).join('')}</tbody></table>`;
    } catch { container.innerHTML = '<p>Error loading bookings.</p>'; }
};

const loadAdminUsers = async () => {
    const container = document.getElementById('users-table-container');
    container.innerHTML = '<div class="loader"></div>';
    try {
        const res   = await adminFetch('/users');
        const users = await res.json();
        container.innerHTML = `
        <table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
        <tbody>${users.map(u=>`<tr>
            <td>${u.name}</td><td>${u.email}</td>
            <td>${u.phone||'—'}</td>
            <td><span class="role-badge ${u.role}">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>${u.role!=='admin'?`<button class="btn-sm btn-danger" onclick="deleteAdminUser('${u._id}')">Delete</button>`:'<em>Admin</em>'}</td>
        </tr>`).join('')}</tbody></table>`;
    } catch { container.innerHTML = '<p>Error loading users.</p>'; }
};

window.deleteAdminUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    const res = await adminFetch(`/users/${id}`, { method: 'DELETE' });
    const d   = await res.json();
    alert(d.message);
    loadAdminUsers();
};

const setupCommonUI = () => {
    const user = JSON.parse(localStorage.getItem('airline_user'));
    const authNav = document.getElementById('auth-nav');
    if (user && authNav) {
        authNav.innerHTML = `<button class="nav-btn logout" onclick="logout()">Logout (${user.name})</button>`;
    }
};

window.logout = () => {
    localStorage.removeItem('airline_user');
    window.location.href = 'login.html';
};

// ─── Initialization Logic ──────────────────────────────────────────────────
const init = () => {
    setupCommonUI();
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    if (page === 'index.html' || page === '') {
        setupHomePage();
    } else if (page === 'login.html') {
        setupLoginPage();
    } else if (page === 'booking.html') {
        setupBookingPage();
    } else if (page === 'checkin.html') {
        setupCheckinPage();
    } else if (page === 'admin-dashboard.html') {
        setupAdminPage();
    } else if (page === 'contact.html') {
        setupContactPage();
    }
};

document.addEventListener('DOMContentLoaded', init);

