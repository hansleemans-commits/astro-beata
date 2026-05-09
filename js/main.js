/* ===================================================
   ASTRO-BEATA.NL — JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // === MOBIEL MENU ===
  const hamburger = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.nav-menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', function () {
      menu.classList.toggle('open');
      const open = menu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', open);
      hamburger.querySelectorAll('span').forEach((s, i) => {
        if (open) {
          if (i === 0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (i === 1) s.style.opacity = '0';
          if (i === 2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          s.style.transform = '';
          s.style.opacity = '';
        }
      });
    });
    // Sluit menu bij klik buiten
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav') && menu.classList.contains('open')) {
        menu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // === ACTIEVE NAV-LINK ===
  const huidigePad = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === huidigePad || (huidigePad === '' && href === 'index.html')) {
      link.classList.add('actief');
    }
  });

  // === SCROLL ANIMATIES ===
  const waarnemer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('zichtbaar');
          waarnemer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animeer').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    waarnemer.observe(el);
  });

  // CSS klasse 'zichtbaar' activeren
  const stijl = document.createElement('style');
  stijl.textContent = '.zichtbaar { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(stijl);

  // === CONTACTFORMULIER ===
  const form = document.getElementById('contact-formulier');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const knop = form.querySelector('button[type="submit"]');
      const origineel = knop.textContent;
      knop.textContent = 'Verzenden...';
      knop.disabled = true;

      const data = Object.fromEntries(new FormData(form).entries());
      data.akkoord = form.querySelector('input[name="akkoord"]').checked;

      try {
        const respons = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!respons.ok) {
          const fout = await respons.json().catch(() => ({}));
          throw new Error(fout.error || 'Verzenden mislukt.');
        }

        form.style.display = 'none';
        const succes = document.getElementById('formulier-succes');
        if (succes) succes.style.display = 'block';
      } catch (err) {
        alert('Er ging iets mis bij het verzenden: ' + err.message + '\n\nProbeer het later opnieuw of mail rechtstreeks naar info@astro-beata.nl.');
        knop.textContent = origineel;
        knop.disabled = false;
      }
    });
  }

  // === STERREN ANIMATIE (hero) ===
  const canvas = document.querySelector('.hero-sterren canvas');
  if (canvas) {
    tekenSterren(canvas);
  }

  function tekenSterren(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const sterren = [];
    for (let i = 0; i < 80; i++) {
      sterren.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        snelheid: Math.random() * 0.008 + 0.002,
        fase: Math.random() * Math.PI * 2
      });
    }
    let frame = 0;
    function teken() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sterren.forEach(s => {
        const alpha = 0.3 + 0.5 * Math.sin(frame * s.snelheid + s.fase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
      frame++;
      requestAnimationFrame(teken);
    }
    teken();
    window.addEventListener('resize', () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
  }

});
