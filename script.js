// Crear partículas flotantes
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
    particlesContainer.appendChild(particle);
}

// Girasol que sigue el cursor
const cursorSunflower = document.getElementById('cursorSunflower');
let mouseX = 0;
let mouseY = 0;
let sunflowerX = 0;
let sunflowerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!cursorSunflower.classList.contains('active')) {
        cursorSunflower.classList.add('active');
    }
});

// Animación suave del girasol siguiendo el cursor
function animateSunflower() {
    const speed = 0.15;
    sunflowerX += (mouseX - sunflowerX) * speed;
    sunflowerY += (mouseY - sunflowerY) * speed;
    
    cursorSunflower.style.left = sunflowerX - 20 + 'px';
    cursorSunflower.style.top = sunflowerY - 20 + 'px';
    
    requestAnimationFrame(animateSunflower);
}
animateSunflower();

// Crear confetti cuando se llega a la sección final
function createConfetti() {
    const colors = ['square', 'circle', 'triangle'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = `confetti ${colors[Math.floor(Math.random() * colors.length)]}`;
        
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = -10 + 'px';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animation = 'confetti-fall linear forwards';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Observar cuando se llega a la sección final
const finalSection = document.querySelector('.final');
let confettiLaunched = false;

const confettiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !confettiLaunched) {
            setTimeout(() => {
                createConfetti();
            }, 500);
            confettiLaunched = true;
        }
    });
}, { threshold: 0.5 });

confettiObserver.observe(finalSection);

// Animación al hacer scroll
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.container').forEach(container => {
    observer.observe(container);
});

// Ocultar scroll indicator después del primer scroll
let scrolled = false;
window.addEventListener('scroll', () => {
    if (!scrolled && window.scrollY > 100) {
        document.querySelector('.scroll-indicator').style.opacity = '0';
        scrolled = true;
    }
});