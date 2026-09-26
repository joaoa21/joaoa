// Native dialog provides focus containment and Escape-to-close behavior.
const artwork = [...document.querySelectorAll('.gallery-item img, .card img, .widget img, .gamif-card img, .banner img')].filter(img=>!img.closest('a, button'));
if(artwork.length){
 const dialog=document.createElement('dialog'); dialog.className='art-viewer'; dialog.setAttribute('aria-label','Visualização da peça');
 const close=document.createElement('button'); close.type='button'; close.textContent='Fechar ×';
 const image=document.createElement('img'); const caption=document.createElement('p');
 dialog.append(close,image,caption); document.body.append(dialog);
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{image.removeAttribute('src');});
 artwork.forEach(img=>{const button=document.createElement('button');button.type='button';button.className='gallery-open';button.setAttribute('aria-label','Ampliar: '+img.alt);img.before(button);button.append(img);button.addEventListener('click',()=>{image.src=img.dataset.full||img.src;image.alt=img.alt;caption.textContent=img.alt;dialog.showModal();});});
}
