// Smooth scroll with Lenis. Protected so the page still works if the CDN fails.
if (window.Lenis) {
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
  });

  links.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

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
