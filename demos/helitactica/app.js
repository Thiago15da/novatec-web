(()=>{'use strict';
const $=id=>document.getElementById(id);
const AREAS={taxi:{name:'Taxi aéreo',seller:'Gerente',icon:'✈'},escuela:{name:'Escuela de aviación',seller:'Asesor de escuela',icon:'◈'},experiencias:{name:'Experiencias',seller:'Asesor de experiencias',icon:'✦'}};
const STAGES=['Nuevo','Interesado','Cotización','Ganado','Perdido'];
let token='',user=null,view='dashboard',all=[],currentId=null,lines=[],stats={};
const safe=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const areaName=s=>AREAS[s]?.name||'Por clasificar';
const statusName=s=>({triage:'En clasificación',waiting:'Pendiente de vendedor',human:'Atención humana'})[s]||s;
const fmt=t=>t?new Date(t).toLocaleTimeString('es-PY',{hour:'2-digit',minute:'2-digit'}):'';
function notify(text){const n=document.createElement('div');n.className='toast';n.textContent=text;document.body.appendChild(n);setTimeout(()=>n.remove(),4200)}
function errorText(detail,status){
 if(typeof detail==='string'&&detail.trim())return detail;
 if(Array.isArray(detail)){const first=detail[0];return first?.msg?`Revisá ${first.loc?.slice(-1)[0]||'los datos'}: ${first.msg}`:`Error de validación (${status})`}
 if(detail&&typeof detail==='object')return detail.message||detail.msg||`Error de la solicitud (${status})`;
 return `Error del servidor (${status})`;
}
async function api(path,opts={}){
 const h={'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})};
 let r;try{r=await fetch(path,{...opts,headers:{...h,...opts.headers}})}catch{throw Error('No se pudo cargar la demostración. Actualizá esta pestaña.')} 
 const d=await r.json().catch(()=>({}));
 if(!r.ok){const msg=errorText(d.detail,r.status);if(r.status===401&&token)logout();throw Error(msg)}return d;
}
function logout(){token='';user=null;all=[];currentId=null;$('loginScreen').classList.remove('hidden');$('appShell').classList.add('hidden')}
$('loginForm').onsubmit=async(e)=>{
 e.preventDefault();$('loginFeedback').textContent='Accediendo…';
 try{
  const r=await api('/api/login',{method:'POST',body:JSON.stringify({username:$('loginUser').value,password:$('loginPass').value})});
  token=r.token;user=r.user;
  await refresh(); // Debe cargar los datos antes de mostrar la aplicación.
  $('currentUser').textContent=`${user.name} · ${user.role==='manager'?'Gerencia':areaName(user.area)}`;
  document.querySelector('[data-view="laboratorio"]').classList.toggle('hidden',user.role!=='manager');
  $('openLab').classList.toggle('hidden',user.role!=='manager');
  document.querySelectorAll('.manager-only').forEach(b=>b.classList.toggle('hidden',user.role!=='manager'));
  if(user.role==='manager')window.HeliOps.init({api,notify,user,getToken:()=>token});
  $('loginScreen').classList.add('hidden');$('appShell').classList.remove('hidden');
  chooseView('dashboard');
  $('loginFeedback').textContent='Sesión iniciada.';
 }catch(err){$('loginFeedback').textContent=`No se pudo iniciar: ${err.message}`;token='';user=null}
};
$('logoutBtn').onclick=async()=>{try{await api('/api/logout',{method:'POST'})}catch{}logout()};
async function refresh(){if(!token)return;const [a,b,c]=await Promise.all([api('/api/conversations'),api('/api/overview'),api('/api/lines')]);all=a;stats=b;lines=c;render();}
function render(){const rows=all;$('statLeads').textContent=stats.total||0;$('statHuman').textContent=stats.human||0;$('statWaiting').textContent=stats.waiting||0;
$('areaBars').innerHTML=Object.entries(AREAS).map(([id,d])=>{const n=stats.areas?.[id]||0;return `<div class="barrow"><div class="barline"><span>${d.name}</span><strong>${n}</strong></div><div class="track"><div class="fill" style="width:${Math.round(n/Math.max(stats.total||1,1)*100)}%"></div></div></div>`}).join('');
$('teamList').innerHTML=Object.entries(AREAS).map(([id,d])=>`<div class="teammember"><div class="avatar">${d.icon}</div><div class="grow"><div class="name">${d.seller}</div><div class="minor">${d.name}</div></div><span class="tag">${stats.areas?.[id]||0} consultas</span></div>`).join('');
$('recentList').innerHTML=rows.slice(0,5).map(l=>`<div class="recent"><div class="avatar">${safe(l.contact_name.slice(0,1))}</div><div class="grow"><div class="name">${safe(l.contact_name)}</div><div class="minor">${safe(areaName(l.area))} · ${safe(statusName(l.status))}</div></div><span class="tag">${safe(l.line_label)}</span></div>`).join('')||'<p class="muted">Todavía no hay consultas.</p>';
const previousLine=$('lineSelect').value;
$('lineSelect').innerHTML=lines.length ? lines.map(l=>`<option value="${safe(l.id)}">${safe(l.label)}</option>`).join('') : '<option value="">No hay líneas configuradas</option>';
if(lines.some(l=>l.id===previousLine))$('lineSelect').value=previousLine;
else if(lines.some(l=>l.id==='linea-experiencias'))$('lineSelect').value='linea-experiencias';
$('simulateBtn').disabled=lines.length===0;
renderInbox();renderPipeline();}
function chooseView(next){view=next;document.querySelectorAll('.page').forEach(n=>n.classList.toggle('hidden',n.id!==next));document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===next));const page={dashboard:['Panel general','Actividad comercial, tres unidades de negocio.'],inbox:['Conversaciones','Bandeja central con control de acceso real.'],pipeline:['Oportunidades','Seguimiento comercial y etapas.'],laboratorio:['Laboratorio','Simulá consultas y verificá el enrutamiento sin usar números reales.'],incendios:['Control de incendios','Campañas, seguimiento y bitácora de operaciones.'],informes:['Informes de dirección','Resumen mensual comercial y de incendios generado automáticamente.']}[next];$('pageTitle').textContent=page[0];$('pageSub').textContent=page[1];if(next==='inbox')renderInbox();if(next==='incendios')window.HeliOps.refreshFire().catch(e=>notify(e.message));if(next==='informes')window.HeliOps.refreshReport().catch(e=>notify(e.message))}
function renderInbox(){let rows=all;const search=$('searchInput').value.toLowerCase();if(search)rows=rows.filter(l=>`${l.contact_name} ${l.last_text} ${l.contact_phone}`.toLowerCase().includes(search));$('inboxCount').textContent=`${rows.length} conversaciones`;
$('conversationList').innerHTML=rows.map(l=>`<button class="thread ${l.id===currentId?'selected':''}" data-id="${l.id}"><div class="avatar">${safe(l.contact_name.slice(0,1))}</div><div class="grow"><div class="name">${safe(l.contact_name)}</div><div class="minor">${safe(areaName(l.area))} · ${safe(l.last_text||'')}</div><small>${safe(l.line_label)} · ${safe(l.stage)}</small></div></button>`).join('')||'<p class="muted">No hay conversaciones para mostrar.</p>';
document.querySelectorAll('.thread').forEach(b=>b.onclick=()=>{currentId=Number(b.dataset.id);renderInbox()});
if(!rows.some(l=>l.id===currentId)){$('chatHeader').innerHTML='<div><strong>Elegí una conversación</strong><small>Historial de mensajes</small></div>';$('chatMessages').textContent='Seleccioná un contacto para ver el historial.';$('chatCompose').classList.add('hidden');$('leadDetail').textContent='Seleccioná una conversación.';return}
loadThread();}
async function loadThread(){if(!currentId)return;let d;try{d=await api(`/api/conversations/${currentId}`)}catch(err){notify(err.message);return}if(Number(d.conversation.id)!==currentId)return;const c=d.conversation;
$('chatHeader').innerHTML=`<div><strong>${safe(c.contact_name)}</strong><small>${safe(areaName(c.area))} · ${safe(statusName(c.status))}</small></div><span class="tag">${c.ai_enabled?'IA activa':'IA pausada'}</span>`;
$('chatMessages').classList.remove('emptychat');$('chatMessages').innerHTML=d.messages.map(m=>`<div class="bubble ${m.source==='client'?'client':m.source==='bot'?'bot':m.source==='mobile'?'mobile':'seller'}">${safe(m.text)}<small>${({client:'Cliente',bot:'Bot · respuesta interna',mobile:'Vendedor · WhatsApp Business simulado',seller:'Operador CRM · simulación'})[m.source]||'Sistema'} · ${fmt(m.created_at)}</small></div>`).join('');$('chatMessages').scrollTop=$('chatMessages').scrollHeight;$('chatCompose').classList.remove('hidden');
const stages=STAGES.map(v=>`<option value="${safe(v)}" ${v===c.stage?'selected':''}>${safe(v)}</option>`).join('');const areas=Object.entries(AREAS).map(([id,v])=>`<option value="${id}" ${id===c.area?'selected':''}>${v.name}</option>`).join('');
$('leadDetail').innerHTML=`<div class="detailrow"><small>Contacto</small><strong>${safe(c.contact_name)}</strong><span>${safe(c.contact_phone)}</span></div><div class="detailrow"><small>Número corporativo de origen</small><strong>${safe(c.line_label)}</strong></div><div class="detailrow"><small>Área asignada</small><strong>${safe(areaName(c.area))}</strong>${user.role==='manager'?`<select id="assignArea"><option value="">Reasignar responsable…</option>${areas}</select><button id="assignBtn" class="btn ghost">Reasignar</button>`:''}</div><div class="detailrow"><small>Estado de conversación</small><strong>${safe(statusName(c.status))}</strong></div><div class="detailrow"><small>Etapa de venta</small><select id="stageSelect">${stages}</select></div><div class="detailrow"><small>Inteligencia artificial</small><strong>${c.ai_enabled?'Recopilando información':'Pausada / derivada'}</strong></div><div class="detailrow"><small>Respuestas recabadas</small>${d.answers.map(a=>`<p><strong>${safe(a.question)}</strong><br>${safe(a.answer)}</p>`).join('')||'<p class="muted">Todavía no hay respuestas.</p>'}</div><div class="message-warning">Las respuestas escritas aquí y las del bot son simulaciones internas, no mensajes enviados a Meta.</div><button id="mobileEchoBtn" class="btn ghost detail-action">Simular respuesta desde WhatsApp móvil</button>`;
$('leadDetail').scrollTop=0;
$('stageSelect').onchange=async(e)=>{try{await api(`/api/conversations/${c.id}/stage`,{method:'PATCH',body:JSON.stringify({stage:e.target.value})});await refresh()}catch(err){notify(err.message)}};
if(user.role==='manager')$('assignBtn').onclick=async()=>{try{await api(`/api/conversations/${c.id}/reassign`,{method:'PATCH',body:JSON.stringify({area:$('assignArea').value||c.area})});notify('Área reasignada; el número de origen no cambia');await refresh()}catch(err){notify(err.message)}};
$('mobileEchoBtn').onclick=async()=>{const text=prompt('Texto de respuesta desde WhatsApp Business (solo simulación):','Hola, soy el asesor de Helitáctica. Te ayudo con tu consulta.');if(!text)return;try{await api('/api/simulator/mobile-echo',{method:'POST',body:JSON.stringify({line_id:c.line_id,phone:c.contact_phone,text})});await refresh();notify('Echo simulado: la IA quedó pausada')}catch(err){notify(err.message)}};
}
function renderPipeline(){const labels=['Nuevo','Interesado','Cotización','Ganado','Perdido'];$('pipelineGrid').innerHTML=labels.map(stage=>`<div class="pipcol"><h3>${stage} · ${all.filter(x=>x.stage===stage).length}</h3>${all.filter(x=>x.stage===stage).map(l=>`<div class="pipitem"><strong>${safe(l.contact_name)}</strong><span>${safe(areaName(l.area))} · ${safe(l.line_label)}</span><div class="pipe-status">${safe(statusName(l.status))}</div></div>`).join('')}</div>`).join('');}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>chooseView(b.dataset.view));$('goInbox').onclick=()=>chooseView('inbox');$('openLab').onclick=()=>chooseView('laboratorio');$('searchInput').oninput=renderInbox;
$('simulateBtn').onclick=async()=>{
 const data={line_id:$('lineSelect').value,name:$('customerName').value.trim(),phone:$('customerPhone').value.trim(),text:$('customerMessage').value.trim()};
 const feedback=$('simFeedback');feedback.classList.remove('error');
 if(!data.line_id || !lines.some(l=>l.id===data.line_id)){feedback.textContent='No hay una línea de simulación válida. Reiniciá el servidor y volvé a ingresar.';feedback.classList.add('error');return}
 if(!data.text||!data.phone||!data.name){feedback.textContent='Completá el nombre, teléfono y mensaje.';feedback.classList.add('error');return}
 $('simulateBtn').disabled=true;
 try{
  const r=await api('/api/simulator/inbound',{method:'POST',body:JSON.stringify(data)});
  if(!r.conversation_id)throw Error('La respuesta del servidor no incluyó la conversación.');
  feedback.textContent='Bot: '+(r.bot_reply||'IA pausada: responde un vendedor.');
  $('customerMessage').value='';currentId=Number(r.conversation_id);
  await refresh();chooseView('inbox');
  notify(`Mensaje simulado guardado. ${r.bot_reply?'El bot respondió.':'La IA está pausada.'}`);
 }catch(err){feedback.textContent=err.message;feedback.classList.add('error');notify(`No se pudo simular: ${err.message}`)}
 finally{$('simulateBtn').disabled=lines.length===0}
};
$('seedDemoBtn').onclick=async()=>{
 const b=$('seedDemoBtn'),feedback=$('seedFeedback');b.disabled=true;feedback.classList.remove('error');
 feedback.textContent='Creando tres consultas completas, incluyendo derivación e intervención humana…';
 try{
  const result=await api('/api/simulator/scenarios',{method:'POST',body:'{}'});
  if(result.count!==3)throw Error('La simulación no completó los tres casos.');
  currentId=Number(result.created[2].conversation_id);
  await refresh();chooseView('inbox');
  feedback.textContent='Tres conversaciones completas creadas. Abrí Laboratorio para generar más pruebas.';
  notify('3 pruebas completas: Taxi aéreo, Escuela y Experiencias. ¡Revisá sus historiales!');
 }catch(err){feedback.textContent=err.message;feedback.classList.add('error');notify('No se pudieron crear las pruebas: '+err.message)}
 finally{b.disabled=false}
};
$('manualSend').onclick=async()=>{const text=$('manualText').value.trim();if(!text||!currentId)return;try{await api(`/api/conversations/${currentId}/reply`,{method:'POST',body:JSON.stringify({text})});$('manualText').value='';await refresh();notify('Respuesta guardada internamente. No enviada a WhatsApp.')}catch(err){notify(err.message)}};
$('manualText').addEventListener('keydown',e=>{if(e.key==='Enter')$('manualSend').click()});$('toggleSim').onclick=()=>{$('simBody').classList.toggle('hidden');$('toggleSim').textContent=$('simBody').classList.contains('hidden')?'+':'−'};
})();