/* Presentation only. XP and lesson completion are saved before this runs. */
'use strict';
window.installLevelCelebration=({esc,progress,motion})=>{
 let current=null;
 const reduced=()=>!motion()||matchMedia('(prefers-reduced-motion:reduce)').matches;
 const avatar=(rank,initial,kind)=>`<div class="level-avatar rank-${rank} lu-avatar lu-${kind}" aria-hidden="true"><span class="level-avatar-core"></span><span class="level-initial">${esc(initial)}</span><img src="assets/profile/frame-${rank}.webp" alt="" width="320" height="320"></div>`;
 function close(){const r=current;if(!r)return;current=null;r.dead=true;for(const a of r.animations)a.cancel();r.animations.clear();clearTimeout(r.imageTimer);r.releaseImages?.();document.body.style.overflow=r.overflow;document.documentElement.style.overflow=r.rootOverflow;if(r.dialog.open)r.dialog.close();r.dialog.remove();const focus=document.querySelector('.lesson-recap .primary')||(r.focus?.isConnected?r.focus:null);focus?.focus({preventScroll:true});}
 function show({fromXP,toXP,name,earned}){
  close();const from=progress(fromXP),to=progress(toXP);if(to.level<=from.level)return;
  const dialog=document.createElement('dialog'),changed=from.rank!==to.rank,initial=[...(name||'Никита')][0].toUpperCase();
  dialog.id='level-up';dialog.className='level-up';dialog.setAttribute('aria-labelledby','lu-title');dialog.setAttribute('aria-describedby','lu-detail');
  dialog.innerHTML=`<div class="lu-stage"><p class="lu-eyebrow">Твой опыт растёт</p><div class="lu-emblem"><div class="lu-halo" aria-hidden="true"></div><div class="lu-orbit" aria-hidden="true"></div>${avatar(from.rank,initial,'old')}${avatar(to.rank,initial,'new')}<div class="lu-flash" aria-hidden="true"></div><div class="lu-particles" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--angle:${i*360/14}deg;--travel:${91+(i%3)*19}px"></i>`).join('')}</div></div><p class="lu-name">${esc(name)}</p><h2 id="lu-title">Уровень ${from.level}</h2><p class="lu-subtitle">${changed?'Новая рамка уже близко':'До нового уровня — один шаг'}</p><div class="lu-progress" role="progressbar" aria-label="Опыт до следующего уровня" aria-valuemin="0" aria-valuemax="${from.span}" aria-valuenow="${from.earned}"><span style="transform:scaleX(${from.percent/100})"></span><i aria-hidden="true"></i></div><p id="lu-detail" class="lu-detail">${from.remaining.toLocaleString('ru-RU')} XP до уровня ${from.level+1}</p><p class="lu-earned">+${Math.max(0,earned).toLocaleString('ru-RU')} XP за урок</p><button class="primary lu-continue" type="button" autofocus>Продолжить <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14 M13 6l6 6-6 6"/></svg></button><span class="sr-only lu-announcement" role="status" aria-live="polite"></span></div>`;
  const r={dialog,animations:new Set(),dead:false,final:false,overflow:document.body.style.overflow,rootOverflow:document.documentElement.style.overflow,focus:document.activeElement};current=r;
  const $=s=>dialog.querySelector(s),bar=$('.lu-progress>span'),old=$('.lu-old'),next=$('.lu-new'),title=$('#lu-title');
  function target(){title.textContent=`Уровень ${to.level}`;$('.lu-eyebrow').textContent='Новый уровень';$('.lu-subtitle').textContent=changed?'Новая рамка открыта':'Ещё один шаг вперёд';$('.lu-detail').textContent=to.done?'Максимальный уровень':`${to.remaining.toLocaleString('ru-RU')} XP до уровня ${to.level+1}`;const track=$('.lu-progress');track.setAttribute('aria-valuemax',to.done?1:to.span);track.setAttribute('aria-valuenow',to.done?1:to.earned);track.setAttribute('aria-valuetext',to.done?'Максимальный уровень':`${to.remaining} XP до уровня ${to.level+1}`);}
  function settle(){if(r.dead||r.final)return;r.final=true;for(const a of r.animations)a.cancel();r.animations.clear();dialog.dataset.phase='ready';$('.lu-stage').style.opacity='1';$('.lu-stage').style.transform='none';$('.lu-flash').style.opacity='0';$('.lu-orbit').style.opacity='0';$('.lu-halo').style.opacity='.34';$('.lu-progress>i').style.opacity='0';dialog.querySelectorAll('.lu-particles i').forEach(el=>el.style.opacity='0');old.style.opacity='0';next.style.opacity='1';next.style.transform='none';next.style.filter='none';bar.style.transform=`scaleX(${to.percent/100})`;target();$('.lu-announcement').textContent=`Достигнут уровень ${to.level}.${changed?' Открыта новая рамка.':''}`;}
  r.settle=settle;
  async function animate(el,frames,duration,easing='cubic-bezier(.22,.7,.22,1)'){
   if(r.dead||r.final)throw new Error('stopped');
   const a=el.animate(frames,{duration,easing,fill:'forwards'});r.animations.add(a);
   try{await a.finished;}finally{r.animations.delete(a);}
   if(r.dead||r.final){a.cancel();throw new Error('stopped');}
   // Keep the last style and release the animation object, including on Safari.
   const last=frames.at(-1);for(const [key,value] of Object.entries(last))if(!['offset','easing','composite'].includes(key))el.style[key]=value;a.cancel();
  }
  async function run(){try{
   // Decode both local frames before the reveal. An image failure never blocks exit.
   await new Promise(resolve=>{r.releaseImages=resolve;r.imageTimer=setTimeout(resolve,1200);Promise.all([...dialog.querySelectorAll('img')].map(i=>i.decode().catch(()=>{}))).then(resolve)});clearTimeout(r.imageTimer);r.releaseImages=null;
   if(r.dead||r.final)return;if(reduced()||!Element.prototype.animate){settle();return;}
   dialog.dataset.phase='enter';await animate($('.lu-stage'),[{opacity:0,transform:'translateY(14px) scale(.97)'},{opacity:1,transform:'none'}],320);
   dialog.dataset.phase='charge';await Promise.all([
    animate(bar,[{transform:`scaleX(${from.percent/100})`},{transform:'scaleX(1)'}],900,'cubic-bezier(.4,0,.2,1)'),
    animate($('.lu-halo'),[{opacity:.22,transform:'scale(.8)'},{opacity:.85,transform:'scale(1.07)'}],900),
    animate($('.lu-orbit'),[{opacity:0,transform:'scale(.9) rotate(-22deg)'},{opacity:.65,transform:'scale(1) rotate(0deg)'}],900),
    animate($('.lu-progress>i'),[{opacity:0,transform:'translateX(-120%)'},{opacity:.7,offset:.4},{opacity:0,transform:'translateX(350%)'}],900)
   ]);
   dialog.dataset.phase='burst';await animate($('.lu-flash'),[{opacity:0,transform:'scale(.55)'},{opacity:.9,transform:'scale(1.04)'}],140);
   target();old.style.opacity='0';bar.style.transform='scaleX(0)';next.style.opacity='1';dialog.dataset.phase='reveal';
   await Promise.all([
    animate(next,[{opacity:0,transform:'scale(.78)',filter:'brightness(1.8)'},{opacity:1,transform:'scale(1.04)',filter:'brightness(1.1)',offset:.7},{opacity:1,transform:'scale(1)',filter:'brightness(1)'}],620),
    animate($('.lu-flash'),[{opacity:.9,transform:'scale(1.04)'},{opacity:0,transform:'scale(1.7)'}],620),
    animate($('.lu-halo'),[{opacity:.85,transform:'scale(1.07)'},{opacity:.34,transform:'scale(1)'}],620),
    animate($('.lu-orbit'),[{opacity:.65,transform:'scale(1)'},{opacity:0,transform:'scale(1.3)'}],620),
    ...[...dialog.querySelectorAll('.lu-particles i')].map((el,i)=>animate(el,[{opacity:0,transform:'rotate(var(--angle)) translateY(-66px) scale(.3)'},{opacity:.85,offset:.15},{opacity:0,transform:'rotate(var(--angle)) translateY(calc(-1 * var(--travel))) scale(.1)'}],540+(i%3)*30))
   ]);
   dialog.dataset.phase='remainder';await animate(bar,[{transform:'scaleX(0)'},{transform:`scaleX(${to.percent/100})`}],520);settle();
  }catch{if(!r.dead)settle();}}
  dialog.querySelector('button').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.addEventListener('close',()=>{if(current===r)close()});document.body.append(dialog);
  try{dialog.showModal();}catch{close();return;}
  document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';dialog.scrollTop=0;
  if(reduced())settle();else{$('.lu-stage').style.opacity='0';void run();}
 }
 // Backgrounding must never leave a paused, half-revealed reward on return.
 document.addEventListener('visibilitychange',()=>{if(document.hidden)current?.settle()});window.addEventListener('pagehide',close);
 const pref=matchMedia('(prefers-reduced-motion:reduce)');pref.addEventListener?.('change',()=>{if(reduced())current?.settle()});
 return Object.freeze({show,close});
};
