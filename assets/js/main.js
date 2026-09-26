const header=document.getElementById('header');
const nav=document.getElementById('nav');
const menuToggle=document.getElementById('menuToggle');
const statusEl=document.getElementById('headerStatus');
const statusMain=document.getElementById('statusMain');
const statusHours=document.getElementById('statusHours');

addEventListener('scroll',()=>header.classList.toggle('solid',scrollY>40),{passive:true});
function setMenu(open){
  nav.classList.toggle('open',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  document.body.classList.toggle('menu-open',open);
}
menuToggle.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});

// Horário baseado no dia/hora local do navegador da pessoa.
// Quarta a sábado: 17h–23h. Domingo: 12h–22h. Segunda/terça: fechado.
const schedule={0:[12,22],1:null,2:null,3:[17,23],4:[17,23],5:[17,23],6:[17,23]};
const dayNames=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const shortDays=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
function hh(n){return String(n).padStart(2,'0')+'h';}
function nextOpen(now){
  for(let add=0;add<=7;add++){
    const d=new Date(now); d.setDate(now.getDate()+add); d.setHours(0,0,0,0);
    const slot=schedule[d.getDay()];
    if(!slot)continue;
    const hour=slot[0];
    if(add>0 || now.getHours()<hour || (now.getHours()===hour && now.getMinutes()===0)){
      return {day:add===0?'hoje':add===1?'amanhã':shortDays[d.getDay()],hour};
    }
  }
  return null;
}
function updateOpenStatus(){
  if(!statusEl||!statusMain||!statusHours)return;
  const now=new Date();
  const day=now.getDay();
  const slot=schedule[day];
  const minutes=now.getHours()*60+now.getMinutes();
  const open=slot && minutes>=slot[0]*60 && minutes<slot[1]*60;
  statusEl.classList.toggle('is-open',!!open);
  statusEl.classList.toggle('is-closed',!open);
  statusEl.setAttribute('aria-label',open?'Praça Rippa está aberta agora':'Praça Rippa está fechada agora');
  if(open){
    statusMain.textContent='Estamos abertos agora';
    statusHours.textContent=`Hoje · ${hh(slot[0])}–${hh(slot[1])}`;
  }else if(slot && minutes<slot[0]*60){
    statusMain.textContent='Estamos fechados agora';
    statusHours.textContent=`Hoje · abre às ${hh(slot[0])}`;
  }else{
    const next=nextOpen(now);
    statusMain.textContent='Estamos fechados agora';
    statusHours.textContent=next?(next.day==='hoje'?`Hoje · abre às ${hh(next.hour)}`:`Abre ${next.day} · ${hh(next.hour)}`):'Consulte nossos horários';
  }
}
updateOpenStatus();
setInterval(updateOpenStatus,30000);

const STAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-star"/></svg>';
document.querySelectorAll('[data-rating]').forEach(el=>{
  const pct=Math.max(0,Math.min(100,(parseFloat(el.dataset.rating)/5)*100));
  el.setAttribute('role','img'); el.setAttribute('aria-label',`${el.dataset.rating} de 5 estrelas`);
  el.innerHTML=`<span class="row bg">${STAR_SVG.repeat(5)}</span><span class="fg"><span class="row">${STAR_SVG.repeat(5)}</span></span>`;
  const fg=el.querySelector('.fg');
  const io2=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){requestAnimationFrame(()=>fg.style.width=pct+'%');io2.unobserve(e.target);}}),{threshold:.4});
  io2.observe(el);
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
document.querySelectorAll('.reveal,.reveal-group').forEach(el=>io.observe(el));
if(!reduced){addEventListener('scroll',()=>{const y=Math.min(scrollY,600);document.documentElement.style.setProperty('--hero-shift',(y*.18)+'px');},{passive:true});}


