// ============================================================
// PARTÍCULAS FLOTANTES (pétalos y puntos dorados)
// ============================================================
const particlesContainer = document.getElementById('particles');
const particleTypes = ['petal-dot', 'petal-dot', 'petal-dot', 'heart-dot'];

for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    particle.className = `particle ${type}`;
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 12 + 's';
    particle.style.animationDuration = (Math.random() * 6 + 9) + 's';
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    particlesContainer.appendChild(particle);
}

// ============================================================
// LLUVIA DE PÉTALOS DE GIRASOL
// ============================================================
const petalSVG = (color, rotation) => `
<svg viewBox="0 0 20 32" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="10" cy="16" rx="7" ry="14" fill="${color}" opacity="0.85"
    transform="rotate(${rotation} 10 16)"/>
</svg>`;

const petalColors = ['#FFD700', '#FFC200', '#FFA500', '#FFD700', '#FFEC6E'];

function spawnFallingPetal() {
    const wrapper = document.createElement('div');
    wrapper.className = 'falling-petal';

    const size = Math.random() * 14 + 10; // 10–24px
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];
    const rotation = Math.random() * 60 - 30;

    wrapper.style.cssText = `
        left: ${Math.random() * 105}%;
        top: -40px;
        width: ${size}px;
        height: ${size * 1.6}px;
        position: fixed;
        pointer-events: none;
        z-index: 2;
    `;
    wrapper.innerHTML = petalSVG(color, rotation);

    document.body.appendChild(wrapper);

    const duration = Math.random() * 5000 + 6000; // 6–11s
    const swayX   = (Math.random() - 0.5) * 120;
    const endRot  = Math.random() * 720 - 360;
    const startOp = Math.random() * 0.4 + 0.4;

    const anim = wrapper.animate([
        { transform: `translateY(0)   translateX(0px)    rotate(0deg)`,     opacity: startOp },
        { transform: `translateY(25vh) translateX(${swayX * 0.3}px) rotate(${endRot * 0.25}deg)`, opacity: startOp, offset: 0.25 },
        { transform: `translateY(55vh) translateX(${swayX * 0.7}px) rotate(${endRot * 0.6}deg)`,  opacity: startOp * 0.8, offset: 0.6 },
        { transform: `translateY(110vh) translateX(${swayX}px)      rotate(${endRot}deg)`,         opacity: 0 }
    ], {
        duration,
        easing: 'linear',
        fill: 'forwards'
    });

    anim.onfinish = () => wrapper.remove();
}

// Lanza pétalos continuamente, acelerando al principio
let petalInterval = 600;
const petalTimer = setInterval(spawnFallingPetal, petalInterval);

// Primer lote inmediato para que no se vea vacío
for (let i = 0; i < 8; i++) {
    setTimeout(spawnFallingPetal, i * 200);
}

// ============================================================
// GIRASOL QUE SIGUE EL CURSOR (con trail)
// ============================================================
const cursorSunflower = document.getElementById('cursorSunflower');

// Crear puntos de trail
const trailCount = 5;
const trailDots = [];
for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    const size = 6 - i;
    dot.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        opacity: 0;
        position: fixed;
        pointer-events: none;
        z-index: 9996;
        border-radius: 50%;
        background: radial-gradient(circle, #FFD700 0%, transparent 70%);
    `;
    document.body.appendChild(dot);
    trailDots.push({ el: dot, x: 0, y: 0 });
}

let mouseX = 0, mouseY = 0;
let sunflowerX = 0, sunflowerY = 0;
let cursorActive = false;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!cursorActive) {
        cursorActive = true;
        cursorSunflower.classList.add('active');
        trailDots.forEach(d => d.el.style.opacity = '0.5');
    }
});

function animateCursor() {
    const speed = 0.14;
    sunflowerX += (mouseX - sunflowerX) * speed;
    sunflowerY += (mouseY - sunflowerY) * speed;

    cursorSunflower.style.left = sunflowerX - 19 + 'px';
    cursorSunflower.style.top  = sunflowerY - 19 + 'px';

    // Trail: each dot chases the previous
    let prevX = sunflowerX, prevY = sunflowerY;
    trailDots.forEach((dot, i) => {
        const lag = 0.10 - i * 0.012;
        dot.x += (prevX - dot.x) * Math.max(lag, 0.04);
        dot.y += (prevY - dot.y) * Math.max(lag, 0.04);
        dot.el.style.left = dot.x - 3 + 'px';
        dot.el.style.top  = dot.y - 3 + 'px';
        prevX = dot.x;
        prevY = dot.y;
    });

    requestAnimationFrame(animateCursor);
}
animateCursor();

// ============================================================
// EFECTO CLICK: GIRASOL BLOOM EN EL PUNTO DE CLICK
// ============================================================
const bloomSVG = `
<circle cx="50" cy="50" r="12" fill="#8B4513"/>
<ellipse cx="50" cy="30" rx="6" ry="13" fill="#FFD700"/>
<ellipse cx="50" cy="70" rx="6" ry="13" fill="#FFD700"/>
<ellipse cx="30" cy="50" rx="13" ry="6" fill="#FFD700"/>
<ellipse cx="70" cy="50" rx="13" ry="6" fill="#FFD700"/>
<ellipse cx="36" cy="36" rx="8" ry="11" fill="#FFD700" transform="rotate(45 36 36)"/>
<ellipse cx="64" cy="36" rx="8" ry="11" fill="#FFD700" transform="rotate(-45 64 36)"/>
<ellipse cx="36" cy="64" rx="8" ry="11" fill="#FFD700" transform="rotate(-45 36 64)"/>
<ellipse cx="64" cy="64" rx="8" ry="11" fill="#FFD700" transform="rotate(45 64 64)"/>
<circle cx="50" cy="50" r="7" fill="#5C2C0A" opacity="0.5"/>
`;

document.addEventListener('click', (e) => {
    // No blooms en el botón de audio
    if (e.target.closest('.audio-toggle')) return;

    const bloom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    bloom.setAttribute('viewBox', '0 0 100 100');
    bloom.classList.add('click-bloom');
    const size = Math.random() * 40 + 40; // 40–80px
    bloom.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - size / 2}px;
        top:  ${e.clientY - size / 2}px;
        filter: drop-shadow(0 0 6px rgba(255,215,0,0.6));
    `;
    bloom.innerHTML = bloomSVG;
    document.body.appendChild(bloom);

    bloom.animate([
        { transform: 'scale(0) rotate(-30deg)', opacity: 1 },
        { transform: 'scale(1.15) rotate(10deg)', opacity: 1, offset: 0.6 },
        { transform: 'scale(1.3) rotate(15deg)', opacity: 0 }
    ], { duration: 700, easing: 'ease-out', fill: 'forwards' }).onfinish = () => bloom.remove();
});

// ============================================================
// CONFETTI DE PÉTALOS (al llegar a la sección final)
// ============================================================
const confettiShapes = ['petal-fall', 'petal-round', 'petal-leaf'];

function createPetalConfetti() {
    const count = 120;

    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = `confetti ${confettiShapes[Math.floor(Math.random() * confettiShapes.length)]}`;

        const hue = Math.random() > 0.5 ? '#FFD700' : (Math.random() > 0.5 ? '#FFA500' : '#FF8C00');
        petal.style.background = hue;
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top  = '-15px';
        petal.style.transform = `rotate(${Math.random() * 360}deg)`;

        const dur   = (Math.random() * 3 + 2.5) + 's';
        const delay = (Math.random() * 1.2) + 's';

        petal.style.animation = `confetti-fall ${dur} ${delay} linear forwards`;

        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), 6000);
    }
}

const finalSection = document.querySelector('.final');
let confettiLaunched = false;

const confettiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !confettiLaunched) {
            setTimeout(createPetalConfetti, 400);
            confettiLaunched = true;
        }
    });
}, { threshold: 0.4 });

confettiObserver.observe(finalSection);

// ============================================================
// SCROLL: FADE-IN CONTAINERS
// ============================================================
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -80px 0px' };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, observerOptions);

document.querySelectorAll('.container').forEach(container => observer.observe(container));

// Ocultar scroll indicator tras primer scroll
let scrolled = false;
window.addEventListener('scroll', () => {
    if (!scrolled && window.scrollY > 100) {
        document.querySelector('.scroll-indicator').style.opacity = '0';
        scrolled = true;
    }
});

// ============================================================
// CONTROL DE AUDIO
// ============================================================
const audioToggle    = document.getElementById('audioToggle');
const backgroundMusic = document.getElementById('backgroundMusic');

audioToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        audioToggle.classList.remove('muted');
    } else {
        backgroundMusic.pause();
        audioToggle.classList.add('muted');
    }
});

// Iniciar muteado
audioToggle.classList.add('muted');
