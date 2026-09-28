(() => {
 const dialog=document.querySelector('#club-dialog');
 const trigger=document.querySelector('.club-open');
 if(!dialog || !trigger) return;
 const frame=dialog.querySelector('iframe');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let closing=false;
 let savedY=0;
 const motion=active=>document.dispatchEvent(new CustomEvent('portfolio:preview',{detail:{active}}));
 function close(){
  if(!dialog.open || closing) return;
  closing=true; dialog.classList.remove('is-visible');
  setTimeout(()=>dialog.close(),reduced.matches?0:220);
 }
 trigger.addEventListener('click',()=>{
  if(dialog.open) return;
  closing=false;
  savedY=window.scrollY;
  motion(true);
  document.documentElement.classList.add('club-preview-open');
  dialog.showModal();
  frame.src=frame.dataset.src;
  requestAnimationFrame(()=>requestAnimationFrame(()=>dialog.classList.add('is-visible')));
 });
 frame.addEventListener('load',()=>{if(dialog.open && frame.getAttribute('src')) dialog.classList.add('is-loaded');});
 dialog.querySelector('.club-close').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
 addEventListener('message',event=>{if(event.source===frame.contentWindow && event.data?.type==='club-preview-close')close();});
 dialog.addEventListener('close',()=>{
  frame.removeAttribute('src');
  dialog.classList.remove('is-visible','is-loaded');
  document.documentElement.classList.remove('club-preview-open');
  motion(false);
  window.scrollTo({top:savedY,behavior:'instant'});
  trigger.focus({preventScroll:true});closing=false;
 });
})();
