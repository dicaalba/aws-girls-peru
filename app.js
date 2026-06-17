// Menú móvil
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Modo oscuro
const darkToggle = document.querySelector('.dark-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

darkToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    darkToggle.textContent = isDark ? '🌙' : '☀️';
});

if (savedTheme === 'dark') darkToggle.textContent = '☀️';

// Animaciones al scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Contador animado
function animateCounter(el, target, suffix = '') {
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = Math.round(eased * target);
        el.textContent = value.toLocaleString('en') + suffix;
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

function startCounters(members, totalEvents) {
    const stats = document.querySelectorAll('.hero-stats .stat span');
    if (stats[0]) animateCounter(stats[0], members);
    if (stats[1]) animateCounter(stats[1], totalEvents, '+');
}

// Cargar datos dinámicos de Meetup
async function loadMeetupData() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) return;
        const data = await res.json();

        // Actualizar stats del hero con animación
        const members = parseInt(data.members.replace(/,/g, ''), 10);
        const totalEvents = parseInt(data.totalEvents, 10);

        const heroSection = document.querySelector('.hero');
        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters(members, totalEvents);
                counterObserver.disconnect();
            }
        }, { threshold: 0.4 });
        counterObserver.observe(heroSection);

        // Actualizar próximos eventos
        const grid = document.querySelector('.events-grid');
        if (data.upcomingEvents && data.upcomingEvents.length) {
            grid.innerHTML = data.upcomingEvents.map(ev => `
                <article class="event-card fade-in visible">
                    <div class="event-date">${ev.date}${ev.time ? ' · ' + ev.time : ''}</div>
                    <h3>${ev.title}</h3>
                    ${ev.venue ? `<div class="event-venue">📍 ${ev.venue}</div>` : ''}
                    <div class="event-card-footer">
                        <span class="event-tag">${ev.type}</span>
                        ${ev.url ? `<a href="${ev.url}" target="_blank" rel="noopener" class="btn-event">Registrarme →</a>` : ''}
                    </div>
                </article>
            `).join('');
        }
    } catch (e) {
        // Si no hay data.json, se muestran los datos estáticos del HTML
    }
}

loadMeetupData();

// PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// Botón volver arriba
const backBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 500);
});
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');

document.querySelectorAll('.gallery-item img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
    });
});

lightbox.addEventListener('click', () => lightbox.classList.remove('active'));
