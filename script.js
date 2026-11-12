'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// La página se muestra igual en todos los equipos, aunque el sistema tenga las animaciones desactivadas
const reduceMotion = false;
const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer) document.documentElement.classList.add('fine-pointer');

// ============================================================
// GIRASOL SVG (se reutiliza en toda la página)
// ============================================================
function sunflowerSVG(petals = 20, cls = '') {
    let outer = '', inner = '', seeds = '';
    for (let i = 0; i < petals; i++) {
        const a = (360 / petals) * i;
        outer += `<g transform="rotate(${a})"><ellipse class="petal" style="--i:${i}" cx="0" cy="-31" rx="6.4" ry="17" fill="url(#sfPetal)"/></g>`;
        const b = a + 180 / petals;
        inner += `<g transform="rotate(${b})"><ellipse class="petal" style="--i:${i}" cx="0" cy="-25" rx="5" ry="13" fill="url(#sfPetalDeep)"/></g>`;
    }
    for (let k = 0; k < 70; k++) {
        const r = 15.5 * Math.sqrt((k + 0.5) / 70);
        const a = k * 2.399963;
        seeds += `<circle cx="${(r * Math.cos(a)).toFixed(2)}" cy="${(r * Math.sin(a)).toFixed(2)}" r="0.9" fill="#c98a3a" opacity="0.55"/>`;
    }
    return `<svg class="sf ${cls}" viewBox="-50 -50 100 100" aria-hidden="true">${outer}${inner}<circle r="17.5" fill="url(#sfDisc)"/>${seeds}</svg>`;
}

// Inserta los girasoles declarados en el HTML
$$('.sf-slot').forEach(slot => {
    slot.innerHTML = sunflowerSVG(+slot.dataset.sf || 20);
    (slot.dataset.sfClass || '').split(' ').filter(Boolean).forEach(c => slot.classList.add(c));
});

// ============================================================
// ENTRADA (el gesto del usuario permite que suene la música)
// ============================================================
const bgm = $('#bgm');
const audioToggle = $('#audioToggle');
let started = false;

function fadeInMusic() {
    bgm.volume = 0;
    const p = bgm.play();
    if (p && p.catch) p.catch(() => {});
    let v = 0;
    const id = setInterval(() => {
        v = Math.min(v + 0.03, 0.55);
        bgm.volume = v;
        if (v >= 0.55) clearInterval(id);
    }, 120);
}

function startExperience() {
    if (started) return;
    started = true;
    $('#gate').classList.add('open');
    document.body.classList.remove('locked');
    document.body.classList.add('go');
    $('#hero .sf-anim').classList.add('run');
    fadeInMusic();
    if (!reduceMotion) startPetals();
    update();
}
$('#gateBtn').addEventListener('click', startExperience);

audioToggle.addEventListener('click', () => {
    if (bgm.paused) { bgm.volume = 0.55; bgm.play().catch(() => {}); } else { bgm.pause(); }
});
bgm.addEventListener('play',  () => audioToggle.classList.remove('muted'));
bgm.addEventListener('pause', () => audioToggle.classList.add('muted'));

// ============================================================
// LUCIÉRNAGAS Y PÉTALOS
// ============================================================
(function fireflies() {
    if (reduceMotion) return;
    const box = $('#fireflies');
    const n = innerWidth < 700 ? 14 : 26;
    for (let i = 0; i < n; i++) {
        const f = document.createElement('i');
        f.className = 'firefly';
        f.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
            `--dx:${(Math.random() - 0.5) * 120}px;--dy:${-30 - Math.random() * 90}px;` +
            `--dur:${10 + Math.random() * 10}s;--del:${-Math.random() * 14}s`;
        box.appendChild(f);
    }
})();

const petalColors = ['#FFD21F', '#FFC200', '#FFA500', '#FFE066'];
function spawnPetal() {
    if (document.hidden) return;
    const el = document.createElement('div');
    el.className = 'falling-petal';
    const size = Math.random() * 12 + 10;
    el.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size * 1.6}px`;
    el.innerHTML = `<svg viewBox="0 0 20 32"><ellipse cx="10" cy="16" rx="7" ry="14" fill="${petalColors[(Math.random() * 4) | 0]}"/></svg>`;
    document.body.appendChild(el);
    const sway = (Math.random() - 0.5) * 140, rot = Math.random() * 720 - 360, op = Math.random() * 0.35 + 0.35;
    el.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: op },
        { transform: `translate(${sway * 0.6}px,60vh) rotate(${rot * 0.6}deg)`, opacity: op, offset: 0.6 },
        { transform: `translate(${sway}px,112vh) rotate(${rot}deg)`, opacity: 0 }
    ], { duration: 7000 + Math.random() * 5000, easing: 'linear', fill: 'forwards' }).onfinish = () => el.remove();
}
function startPetals() {
    for (let i = 0; i < 5; i++) setTimeout(spawnPetal, 1500 + i * 400);
    setInterval(spawnPetal, 1400);
}

// ============================================================
// CURSOR GIRASOL + FLOR AL HACER CLIC
// ============================================================
if (finePointer && !reduceMotion) {
    const cur = $('#cursorSf');
    cur.innerHTML = sunflowerSVG(12);
    let mx = 0, my = 0, x = 0, y = 0, rot = 0;
    addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cur.classList.add('active');
    });
    (function loop() {
        x += (mx - x) * 0.2; y += (my - y) * 0.2; rot += 0.4;
        cur.style.transform = `translate3d(${x + 6}px,${y + 6}px,0) rotate(${rot}deg)`;
        requestAnimationFrame(loop);
    })();
}

addEventListener('click', e => {
    if (reduceMotion || e.target.closest('.audio-toggle, .gate, .wish, .candle, .hero-sf, #field, .sea')) return;
    const size = Math.random() * 30 + 40;
    const b = document.createElement('div');
    b.className = 'bloom-click';
    b.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px`;
    b.innerHTML = sunflowerSVG(12);
    document.body.appendChild(b);
    b.animate([
        { transform: 'scale(0) rotate(-30deg)', opacity: 1 },
        { transform: 'scale(1.1) rotate(10deg)', opacity: 1, offset: 0.6 },
        { transform: 'scale(1.3) rotate(18deg)', opacity: 0 }
    ], { duration: 800, easing: 'ease-out', fill: 'forwards' }).onfinish = () => b.remove();
});

// Tocar el girasol de la portada suelta pétalos en todas direcciones
$('.hero-sf').addEventListener('click', () => {
    if (reduceMotion) return;
    const r = $('.hero-sf').getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 18; i++) {
        const el = document.createElement('div');
        el.className = 'falling-petal';
        const size = Math.random() * 10 + 10;
        el.style.cssText = `left:${cx - size / 2}px;top:${cy - size}px;width:${size}px;height:${size * 1.6}px`;
        el.innerHTML = `<svg viewBox="0 0 20 32"><ellipse cx="10" cy="16" rx="7" ry="14" fill="${petalColors[i % 4]}"/></svg>`;
        document.body.appendChild(el);
        const a = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
        const d = r.width * (0.7 + Math.random() * 0.7);
        const rot = Math.random() * 540 - 270;
        el.animate([
            { transform: 'translate(0,0) rotate(0) scale(0.4)', opacity: 1 },
            { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${Math.cos(a) * d * 1.15}px,${Math.sin(a) * d + 260}px) rotate(${rot * 1.6}deg) scale(1)`, opacity: 0 }
        ], { duration: 2200 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).onfinish = () => el.remove();
    }
});

// ============================================================
// CAMPO DE GIRASOLES (canvas): miran hacia el cursor / dedo,
// y al tocar el campo se siembra uno nuevo
// ============================================================
(function field() {
    const canvas = $('#fieldCanvas');
    const scene = $('#field');
    const ctx = canvas.getContext('2d');
    const TAU = Math.PI * 2;
    let W = 0, H = 0, flowers = [], running = false, bloomStart = null, t0 = 0;
    const ptr = { x: 0, y: 0, sx: 0, sy: 0, has: false };

    $('#fieldHint').textContent = finePointer
        ? 'Mueve el cursor y te siguen. Haz clic para sembrar uno.'
        : 'Toca el campo: te miran, y nace uno nuevo.';

    const planted = [];   // girasoles sembrados por ella (posiciones relativas, sobreviven al redimensionar)
    const makeSeeds = () => Array.from({ length: 44 }, (_, k) => {
        const r = Math.sqrt((k + 0.5) / 44) * 0.5;
        return [r * Math.cos(k * 2.399963), r * Math.sin(k * 2.399963)];
    });

    // Semilla fija para que el campo no cambie al redimensionar
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    function build() {
        seed = 7; flowers = [];
        const base = clamp(W * 0.04, 22, 50);
        const nBack = Math.max(4, Math.round(W / 150));
        const nFront = Math.max(5, Math.round(W / 115));
        for (let i = 0; i < nBack; i++) {
            flowers.push({ back: true, x: (i + 0.5 + (rnd() - 0.5) * 0.6) * W / nBack, gy: H * 0.93,
                hy: H * (0.6 + rnd() * 0.1), r: base * 0.68 * (0.9 + rnd() * 0.25), ph: rnd() * TAU, d: rnd() * 1.1 });
        }
        for (let i = 0; i < nFront; i++) {
            flowers.push({ back: false, x: (i + 0.5 + (rnd() - 0.5) * 0.7) * W / nFront, gy: H * 1.02,
                hy: H * (0.5 + rnd() * 0.17), r: base * (0.85 + rnd() * 0.3), ph: rnd() * TAU, d: rnd() * 1.1 });
        }
        planted.forEach(p => flowers.push({ back: false, x: p.fx * W, gy: H * 1.02, hy: p.fy * H,
            r: base * p.k, ph: p.ph, d: p.d }));
        flowers.forEach(f => { f.seeds = makeSeeds(); });
    }

    function plant(x, y) {
        if (bloomStart === null) return;
        const p = { fx: x / W, fy: clamp(y / H, 0.42, 0.82), k: 0.8 + Math.random() * 0.4,
            ph: Math.random() * TAU, d: (performance.now() - bloomStart) / 1000 };
        planted.push(p);
        if (planted.length > 16) planted.shift();
        build();
    }

    function resize() {
        const r = scene.getBoundingClientRect();
        const dpr = Math.min(devicePixelRatio || 1, 2);
        W = r.width; H = r.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ptr.sx = W / 2; ptr.sy = H * 0.2;
        build();
    }
    new ResizeObserver(resize).observe(scene);

    const ease = t => 1 - Math.pow(1 - t, 3);

    function drawFlower(f, t, bt) {
        const g = ease(clamp((bt - f.d) / 1.4, 0, 1));
        if (g <= 0) return;
        const dx = ptr.sx - f.x;
        const dy = ptr.sy - f.hy;
        const nx = clamp(dx / (W * 0.45), -1, 1);
        const ny = clamp(dy / (H * 0.6), -1, 1);
        const sway = Math.sin(t * 0.9 + f.ph) * (f.back ? 2 : 3);
        const hx = f.x + nx * f.r * 0.9 + sway;
        const hy = f.gy - (f.gy - f.hy) * g;
        const r = f.r * g;

        // Tallo
        const cx = f.x, cy = hy + (f.gy - hy) * 0.35;
        ctx.lineCap = 'round';
        ctx.strokeStyle = f.back ? '#27481a' : '#3a6f24';
        ctx.lineWidth = Math.max(3, f.r * 0.16);
        ctx.beginPath(); ctx.moveTo(f.x, f.gy); ctx.quadraticCurveTo(cx, cy, hx, hy + r * 0.3); ctx.stroke();

        // Hojas
        ctx.fillStyle = f.back ? '#2d5420' : '#4a8a2d';
        [[0.42, -1], [0.68, 1]].forEach(([u, side]) => {
            const px = (1 - u) * (1 - u) * f.x + 2 * (1 - u) * u * cx + u * u * hx;
            const py = (1 - u) * (1 - u) * f.gy + 2 * (1 - u) * u * cy + u * u * (hy + r * 0.3);
            ctx.save(); ctx.translate(px, py); ctx.rotate(side * (0.9 + Math.sin(t * 0.8 + f.ph) * 0.05) + (side > 0 ? 0 : Math.PI));
            ctx.beginPath(); ctx.ellipse(f.r * 0.45, 0, f.r * 0.5 * g, f.r * 0.17 * g, 0, 0, TAU); ctx.fill(); ctx.restore();
        });

        // Cabeza
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(nx * 0.25 + sway * 0.012);
        ctx.scale(1 - 0.16 * Math.abs(nx), 1);
        const n = 20;
        const c1 = f.back ? '#b88a00' : '#FFC81A', c2 = f.back ? '#c99a10' : '#FFD84A', c3 = f.back ? '#a8760a' : '#F5A800';
        for (let i = 0; i < n; i++) {
            ctx.save(); ctx.rotate(i / n * TAU); ctx.fillStyle = i % 2 ? c1 : c2;
            ctx.beginPath(); ctx.ellipse(0, -r * 0.95, r * 0.2, r * 0.5, 0, 0, TAU); ctx.fill(); ctx.restore();
        }
        ctx.fillStyle = c3;
        for (let i = 0; i < n; i++) {
            ctx.save(); ctx.rotate((i + 0.5) / n * TAU);
            ctx.beginPath(); ctx.ellipse(0, -r * 0.76, r * 0.16, r * 0.38, 0, 0, TAU); ctx.fill(); ctx.restore();
        }
        const ox = nx * r * 0.1, oy = ny * r * 0.1;
        const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, r * 0.55);
        gr.addColorStop(0, '#7a4210'); gr.addColorStop(0.65, '#4a260a'); gr.addColorStop(1, '#2b1405');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(ox, oy, r * 0.52, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(201,138,58,0.55)';
        const sr = Math.max(0.8, r * 0.035);
        for (const [sx, sy] of f.seeds) {
            ctx.beginPath(); ctx.arc(ox + sx * r * 2 * 0.98, oy + sy * r * 2 * 0.98, sr, 0, TAU); ctx.fill();
        }
        ctx.restore();
    }

    function frame(ts) {
        if (!running) return;
        const t = (ts - t0) / 1000;
        ctx.clearRect(0, 0, W, H);

        // Sin puntero, la "luz" recorre el campo sola
        const tx = ptr.has ? ptr.x : W * (0.5 + 0.4 * Math.sin(t * 0.35));
        const ty = ptr.has ? ptr.y : H * (0.18 + 0.08 * Math.sin(t * 0.5 + 1));
        ptr.sx += (tx - ptr.sx) * 0.06;
        ptr.sy += (ty - ptr.sy) * 0.06;

        // Resplandor que siguen los girasoles
        const glow = ctx.createRadialGradient(ptr.sx, ptr.sy, 0, ptr.sx, ptr.sy, 220);
        glow.addColorStop(0, 'rgba(255,210,31,0.22)'); glow.addColorStop(1, 'rgba(255,210,31,0)');
        ctx.fillStyle = glow; ctx.fillRect(ptr.sx - 220, ptr.sy - 220, 440, 440);

        const bt = (ts - bloomStart) / 1000;
        flowers.forEach(f => drawFlower(f, t, bt));
        requestAnimationFrame(frame);
    }

    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
            if (!running) {
                running = true;
                if (bloomStart === null) bloomStart = performance.now();
                t0 = t0 || performance.now();
                requestAnimationFrame(frame);
            }
        } else {
            running = false;
        }
    }, { threshold: 0.05 }).observe(scene);

    scene.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.has = true;
    });
    scene.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') ptr.has = false; });
    scene.addEventListener('click', e => {
        const r = canvas.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.has = true;
        plant(ptr.x, ptr.y);
    });
})();

// ============================================================
// MAR: ondas donde pasa el cursor o el dedo
// ============================================================
(function sea() {
    const sea = $('.sea');
    let last = 0;
    function ripple(e) {
        const now = performance.now();
        if (reduceMotion || now - last < 120) return;
        last = now;
        const r = sea.getBoundingClientRect();
        const d = document.createElement('i');
        d.className = 'ripple';
        d.style.left = (e.clientX - r.left) + 'px';
        d.style.top = (e.clientY - r.top) + 'px';
        sea.appendChild(d);
        d.addEventListener('animationend', () => d.remove());
    }
    sea.addEventListener('pointermove', ripple);
    sea.addEventListener('pointerdown', ripple);
})();

// ============================================================
// OLAS (senoides con periodo 600 para que el bucle sea continuo)
// ============================================================
$$('.wave').forEach((svg, i) => {
    const amp = [16, 20, 14][i], base = 60 + i * 6, ph = i * 1.7;
    let d = `M0 120 L0 ${base}`;
    for (let x = 0; x <= 1200; x += 20) d += ` L${x} ${(base + amp * Math.sin(x / 600 * 2 * Math.PI + ph)).toFixed(1)}`;
    $('path', svg).setAttribute('d', d + ' L1200 120 Z');
});

// Cinta verde de la escena de teatro: dos curvas suaves
$$('.ribbon path').forEach((p, i) => {
    let d = '';
    for (let x = 0; x <= 1200; x += 20) {
        const y = 30 + (i ? 9 : 13) * Math.sin(x / 1200 * Math.PI * (i ? 5 : 4) + i * 1.3);
        d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)} `;
    }
    p.setAttribute('d', d);
});

// ============================================================
// DESEOS (6 girasoles que se abren al tocarlos)
// ============================================================
(function wishes() {
    const data = [
        ["Paz",      "Que tengas noches tranquilas, con tu música, para soltar el día sin cargar con nada."],
        ["Salud",    "Que tu cuerpo y tu mente estén bien. Escuchas tanto a los demás que a veces tú quedas de última; que este año seas primero."],
        ["Alegría",  "Que te rías mucho, como en la foto. Tu humor merece público."],
        ["Sueños",   "Que lo que tuviste que aplazar o soltar encuentre su lugar, y que la vida te deje improvisar seguido."],
        ["Descanso", "Que descanses sin culpa, y que alguien te cuide a ti con el mismo cariño con el que tú cuidas."],
        ["Canela",   "Que tu cocina siempre huela a canela, y que nunca se apague eso tan tuyo que ilumina a quien se cruza contigo."]
    ];
    const grid = $('#wishGrid'), panel = $('#wishPanel'), count = $('#wishCount');
    const opened = new Set();
    const bonus = '<p class="wb">Y uno más, el más importante: que seas muy feliz, Yuls.</p>';
    let bonusShown = false;

    data.forEach(([title, text], i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'wish';
        b.innerHTML = sunflowerSVG(14) + `<span>${title}</span>`;
        b.addEventListener('click', () => {
            $$('.wish', grid).forEach(w => w.classList.remove('active'));
            b.classList.add('active', 'opened');
            opened.add(i); count.textContent = opened.size;
            panel.innerHTML = `<p class="wt show">${title}</p><p class="wd show" style="animation-delay:.12s">${text}</p>` + (bonusShown ? bonus : '');
            // Al abrir los seis aparece un séptimo deseo
            if (opened.size === data.length && !bonusShown) {
                bonusShown = true;
                setTimeout(() => {
                    panel.insertAdjacentHTML('beforeend', bonus.replace('"wb"', '"wb show"'));
                    count.parentElement.textContent = 'Todos abiertos';
                    confetti(45);
                }, 2200);
            }
        });
        grid.appendChild(b);
    });
})();

// ============================================================
// APARICIÓN, PALABRAS, PARALLAX Y PROGRESO
// ============================================================
$$('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    el._w = words.map((w, i) => {
        const s = document.createElement('span');
        s.className = 'word'; s.textContent = w;
        el.append(s, i < words.length - 1 ? ' ' : '');
        return s;
    });
});

const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal, .photo').forEach(el => io.observe(el));

const heroInner = $('.hero-inner');

function update() {
    const vh = innerHeight;

    // La portada se aleja suavemente al empezar a bajar
    if (!reduceMotion && scrollY < vh * 1.2) {
        const p = clamp(scrollY / vh, 0, 1);
        heroInner.style.transform = `translate3d(0,${(p * 70).toFixed(1)}px,0) scale(${(1 - p * 0.14).toFixed(3)})`;
        heroInner.style.opacity = (1 - p * 1.25).toFixed(3);
    }

    // Progreso
    const max = document.documentElement.scrollHeight - vh;
    $('#progressBar').style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;

    // Palabras que se iluminan
    $$('[data-words]').forEach(el => {
        const r = el.getBoundingClientRect();
        const p = reduceMotion ? 1 : clamp((vh * 0.9 - (r.top + r.height / 2)) / (vh * 0.4), 0, 1);
        const lit = Math.round(p * el._w.length);
        if (el._lit !== lit) {
            el._w.forEach((w, i) => w.classList.toggle('on', i < lit));
            el._lit = lit;
        }
    });

    // Parallax suave en las fotos
    if (!reduceMotion) {
        $$('[data-parallax]').forEach(img => {
            const f = img.parentElement.getBoundingClientRect();
            if (f.bottom < -100 || f.top > vh + 100) return;
            const p = clamp((f.top + f.height / 2 - vh / 2) / (vh / 2 + f.height / 2), -1, 1);
            img.style.transform = `translate3d(0,${(-p * f.height * 0.07).toFixed(1)}px,0)`;
        });
    }
}

let ticking = false;
function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
update();

// ============================================================
// CONFETI DE PÉTALOS AL LLEGAR AL FINAL
// ============================================================
function confetti(count = 90) {
    if (reduceMotion) return;
    const colors = ['#FFD21F', '#FFA500', '#FFC200', '#FFE066', '#FF8C00'];
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-p';
        const w = Math.random() * 8 + 7;
        p.style.cssText = `width:${w}px;height:${w * 1.5}px;left:${Math.random() * 100}vw;` +
            `background:${colors[(Math.random() * colors.length) | 0]};border-radius:${Math.random() > 0.5 ? '50% 50% 50% 0' : '0 50% 0 50%'}`;
        document.body.appendChild(p);
        const sway = (Math.random() - 0.5) * 220, rot = Math.random() * 900 - 450;
        p.animate([
            { transform: 'translate(0,-5vh) rotate(0)', opacity: 1 },
            { transform: `translate(${sway}px,115vh) rotate(${rot}deg)`, opacity: 0.9 }
        ], { duration: 3500 + Math.random() * 3000, delay: Math.random() * 1200, easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards' })
            .onfinish = () => p.remove();
    }
}

// ============================================================
// LA VELA: se sopla tocándola (y se puede volver a encender)
// ============================================================
(function candle() {
    const c = $('#candle'), hint = $('#candleHint'), title = $('#finalTitle');
    c.addEventListener('click', () => {
        const out = c.classList.toggle('out');
        if (out) {
            hint.textContent = 'Que se cumpla.';
            title.classList.remove('lit'); void title.offsetWidth; title.classList.add('lit');
            confetti(120);
        } else {
            hint.textContent = 'Los deseos nunca sobran: pide otro.';
        }
    });
})();
