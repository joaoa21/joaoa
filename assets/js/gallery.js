// Native dialog provides focus containment and Escape-to-close behavior.
const artwork = [...document.querySelectorAll('.gallery-item img, .card img, .widget img, .gamif-card img, .banner img')].filter(img=>!img.closest('a, button'));
const en=document.documentElement.lang.startsWith('en');
if(artwork.length){
 const dialog=document.createElement('dialog'); dialog.className='art-viewer'; dialog.setAttribute('aria-label',en?'Artwork preview':'Visualização da peça');
 const close=document.createElement('button'); close.type='button'; close.className='art-viewer-close'; close.setAttribute('aria-label',en?'Close':'Fechar'); close.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
 const image=document.createElement('img'); const caption=document.createElement('p');
 dialog.append(close,image,caption); document.body.append(dialog);
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{image.removeAttribute('src');});
 artwork.forEach(img=>{const button=document.createElement('button');button.type='button';button.className='gallery-open';button.setAttribute('aria-label',(en?'Enlarge: ':'Ampliar: ')+img.alt);img.before(button);button.append(img);button.addEventListener('click',()=>{image.src=img.dataset.full||img.src;image.alt=img.alt;caption.textContent=img.alt;dialog.showModal();});});
}
