const dialog=document.querySelector('.image-dialog');
if(dialog){document.querySelectorAll('[data-lightbox]').forEach(image=>{image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',`Enlarge: ${image.alt}`);const open=()=>{dialog.querySelector('img').src=image.src;dialog.querySelector('img').alt=image.alt;dialog.showModal()};image.addEventListener('click',open);image.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}})});dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})}
if(document.querySelector('#installation-viewer')){
 document.querySelectorAll('[data-view],[data-step],[data-stage],#reset-view,#fullscreen-view,#inspect-detail,#play-demo,#stop-demo').forEach(b=>b.disabled=true);
 document.querySelectorAll('[data-start-demo]').forEach(button=>button.disabled=true);
 import('./fruit-viewer.js?v=editorial-ui-27').catch(()=>{
  document.querySelectorAll('[data-start-demo],#play-demo,#stop-demo').forEach(button=>button.disabled=true);
  document.querySelector('#demo-status').textContent='Explore the original render and project studies below.';
  const hint=document.querySelector('.scene-hint');if(hint)hint.hidden=true;
  const area=document.querySelector('.scene-area');const image=document.querySelector('.viewer-original');image.hidden=false;
  area.querySelector('canvas')?.remove();area.querySelectorAll('.scene-overlay').forEach(item=>item.hidden=true);
  const notice=document.createElement('p');notice.className='fallback-notice';notice.textContent='The 3D view could not load. Explore the original material studies below, or open this site with the included local preview launcher.';area.append(notice);
  document.querySelector('#viewer-status').textContent='Original study';
  document.querySelector('[data-view="explore"]').setAttribute('aria-selected','false');
  document.querySelector('[data-view="explore"]').disabled=true;
  document.querySelector('[data-view="original"]').setAttribute('aria-selected','true');
  document.querySelectorAll('[data-step],[data-stage],#reset-view,#fullscreen-view,#inspect-detail').forEach(b=>b.disabled=true);
 });
}

