(function() {
    const track = document.getElementById('jdoTrack');
    const SCROLL_AMOUNT = 400; // largura do card + gap
 
    document.querySelector('.jdo-nav-prev').addEventListener('click', function() {
      track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    });
 
    document.querySelector('.jdo-nav-next').addEventListener('click', function() {
      track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    });
  })();