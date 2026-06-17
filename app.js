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

// Cargar datos dinámicos de Meetup
async function loadMeetupData() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) return;
        const data = await res.json();

        // Actualizar stats del hero
        const stats = document.querySelectorAll('.hero-stats .stat span');
        if (stats[0]) stats[0].textContent = data.members;
        if (stats[1]) stats[1].textContent = data.totalEvents + '+';
        if (stats[2]) stats[2].textContent = data.rating + '★';

        // Actualizar próximos eventos
        const grid = document.querySelector('.events-grid');
        if (data.upcomingEvents && data.upcomingEvents.length) {
            grid.innerHTML = data.upcomingEvents.map(ev => `
                <article class="event-card fade-in visible">
                    <div class="event-date">${ev.date}${ev.time ? ' · ' + ev.time : ''}</div>
                    <h3>${ev.title}</h3>
                    <span class="event-tag">${ev.type}</span>
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
