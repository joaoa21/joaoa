const lenis = new Lenis({
  duration: 1.2, // muda a força do efeito
  smoothWheel: true,
  smoothTouch: false,
  lerp: 0.08
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

function toggleMode() {
  const html = document.documentElement

// NA LÓGIA DE PROGRAMAÇÃO
//  if(html.classList.contains('light')) {
//    html.classList.remove('light')
//  } else {
//    html.classList.add('light')
//  }

//RESUMIDO
  html.classList.toggle('light')
}