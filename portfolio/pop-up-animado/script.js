const card = document.getElementById('promoCard');

let rotation = 0;

setInterval(() => {
  rotation += 180; // sempre gira mais

  card.style.transform = `rotateY(${rotation}deg)`;
}, 3000);