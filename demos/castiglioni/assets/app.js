(() => {
'use strict';
const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));

const toggle=$('#menuToggle'),menu=$('#mobileMenu');
function setMenu(open){
 if(!toggle||!menu)return;
 menu.classList.toggle('open',open);
 menu.setAttribute('aria-hidden',String(!open));
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
 toggle.textContent=open?'×':'☰';
 document.body.classList.toggle('menu-open',open);
}
toggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
window.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
window.addEventListener('resize',()=>{if(innerWidth>1000&&menu?.classList.contains('open'))setMenu(false)},{passive:true});

// Actual partner photography is sourced from the current official site.
// If it is unavailable, display a typographic fallback instead of a broken photo.
$$('img[data-photo-fallback]').forEach(img=>{
 const fail=()=>{
  img.style.display='none';
  const fallback=img.parentElement?.querySelector('.person-fallback, .profile-fallback');
  if(fallback)fallback.hidden=false;
 };
 img.addEventListener('error',fail,{once:true});
 if(img.complete&&img.naturalWidth===0)fail();
});

// Contact forms open the visitor's WhatsApp or email app; no data is stored or transmitted here.
const form=$('#inquiryForm');
const fields=['fullName','company','contactEmail','subjectArea','message'];
const get=id=>String($('#'+id)?.value??'').trim();
const params=new URLSearchParams(location.search);
if($('#subjectArea')){
 const kind=params.get('area');
 if(kind&&Array.from($('#subjectArea').options).some(x=>x.value===kind))$('#subjectArea').value=kind;
}
function buildMessage(){
 if(!form?.reportValidity())return null;
 const subject=$('#subjectArea')?.selectedOptions?.[0]?.textContent??'Consulta jurídica';
 const name=get('fullName'),company=get('company'),email=get('contactEmail'),message=get('message');
 const lines=[
 'Buen día, Castiglioni & Asociados. Quisiera solicitar información para una consulta jurídica.',
 '',
 'Nombre: '+name
 ];
 if(company)lines.push('Empresa: '+company);
 lines.push('Correo electrónico: '+email);
 lines.push('Área de consulta: '+subject);
 lines.push('Consulta: '+message);
 lines.push('', 'Mensaje preparado desde una propuesta web demostrativa de NovaTec Engineering.');
 return lines.join('\n');
}
const status=$('#formStatus');
function prepare(kind){
 const message=buildMessage();if(!message)return;
 let url='';
 if(kind==='whatsapp'){
   url='https://wa.me/595981267406?text='+encodeURIComponent(message);
 }else{
   const s=$('#subjectArea')?.selectedOptions?.[0]?.textContent||'Consulta jurídica';
   url='mailto:info@castiglioni.com.py?subject='+encodeURIComponent('Consulta legal · '+s)+'&body='+encodeURIComponent(message);
 }
 if(status)status.textContent=kind==='whatsapp'?'Mensaje preparado para WhatsApp; revisalo antes de enviarlo.':'Se preparó tu mensaje para la aplicación de correo.';
 const opened=window.open(url,'_blank','noopener,noreferrer');
 if(!opened)window.location.assign(url);
}
form?.addEventListener('submit',event=>{event.preventDefault();prepare('whatsapp')});
$('#sendEmail')?.addEventListener('click',()=>prepare('email'));

// Make external map links keyboard-accessible and leave no faux "submit succeeded" state.
})();