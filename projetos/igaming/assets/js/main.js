// Smooth scroll with Lenis. Protected so the page still works if the CDN fails.
if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({
    duration: 1.4,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    lerp: 0.08
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

// Scroll-aware navbar
const siteNav = document.getElementById('nav');

function updateNav() {
  if (!siteNav) return;

  if (window.scrollY > 40) {
    siteNav.classList.add('scrolled');
  } else {
    siteNav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Mobile menu toggle
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
    const open=links.classList.contains('open');
    links.inert=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  });

  links.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      links.inert=window.matchMedia('(max-width:900px)').matches;
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Abrir menu');
    });
  });
}

document.addEventListener('keydown',e=>{if(e.key==='Escape' && links?.classList.contains('open')){links.classList.remove('open');toggle.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');toggle.focus();}});
// Scroll reveal
const reveals = document.querySelectorAll('.reveal');

const obs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

reveals.forEach((el) => obs.observe(el));

const menuMedia=window.matchMedia('(max-width:900px)');
function syncMenu(){if(links)links.inert=menuMedia.matches&&!links.classList.contains('open');}
menuMedia.addEventListener('change',syncMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')syncMenu();});syncMenu();
