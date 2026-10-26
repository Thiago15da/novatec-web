// Separate manager-only UI. Uses existing API wrapper through window.HeliOps.init
window.HeliOps = (()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const thisMonth=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
 const today=()=>{const d=new Date();return thisMonth()+'-'+String(d.getDate()).padStart(2,'0')};
 let api, notify, me, lastReport=null, campaigns=[], initialized=false;
 const asForm=form=>Object.fromEntries(new FormData(form).entries());
 const hhmm=minutes=>`${Math.floor(minutes/60)} h ${String(minutes%60).padStart(2,'0')} min`;
 function zero(msg){return `<div class="ops-empty">${esc(msg)}</div>`}
 async function refreshFire(){
  const [cs,acts]=await Promise.all([api('/api/operations/campaigns'),api('/api/operations/activities')]);campaigns=cs;
  $('campaignCount').textContent=cs.length+' campaña(s)';
  $('campaignList').innerHTML=cs.length?cs.map(c=>`<div class="ops-campaign"><strong>${esc(c.name)}</strong><span>${esc(c.region||'Región sin especificar')} · ${esc(c.status)} · ${esc(c.start_date)}${c.end_date?' al '+esc(c.end_date):''}</span><span>${c.activities} actividades registradas</span></div>`).join(''):zero('No hay campañas. Creá la primera para empezar a registrar actividades.');
  const selected=$('activityCampaign').value;
  $('activityCampaign').innerHTML=cs.length?cs.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join(''):'<option value="">Creá primero una campaña</option>';
  if(cs.some(c=>String(c.id)===selected))$('activityCampaign').value=selected;
  $('fireActivityForm').querySelector('button').disabled=!cs.length;
  const completed=acts.filter(a=>a.status==='Completado').length, highs=acts.filter(a=>a.severity==='Alta').length,totalMin=acts.reduce((s,a)=>s+a.flight_minutes,0);
  $('fireSummary').innerHTML=[['Campañas',cs.length,'Registradas'],['Actividades',acts.length,'Todas las fechas'],['Completadas',completed,'Registros finalizados'],['Horas de vuelo',hhmm(totalMin),'Declaradas manualmente']].map(([label,n,sub])=>`<div class="ops-kpi"><span>${esc(label)}</span><strong>${esc(n)}</strong><small>${esc(sub)}</small></div>`).join('');
  $('fireRows').innerHTML=acts.length?acts.map(a=>`<tr><td>${esc(a.event_date)}</td><td><strong>${esc(a.campaign_name)}</strong><small>${esc(a.location)}</small></td><td>${esc(a.activity_type)}</td><td>${esc(a.severity)}</td><td>${hhmm(a.flight_minutes)}</td><td><select class="statusChange" data-id="${a.id}" aria-label="Estado de actividad ${a.id}">${['Programado','En curso','Completado','Cancelado'].map(s=>`<option ${a.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join(''):'<tr><td colspan="6">No hay operativos registrados.</td></tr>';
  document.querySelectorAll('.statusChange').forEach(select=>select.addEventListener('change',async()=>{try{await api('/api/operations/activities/'+select.dataset.id+'/status?status='+encodeURIComponent(select.value),{method:'PATCH'});notify('Estado actualizado');await refreshFire()}catch(e){notify(e.message)}}));
 }
 async function refreshReport(){
  const month=$('reportMonth').value||thisMonth();
  lastReport=await api('/api/operations/report/'+encodeURIComponent(month));const r=lastReport, c=r.commercial,f=r.fire;
  const kpis=values=>values.map(([n,l])=>`<div class="report-kpi"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('');
  const line=(name,num,total)=>`<div class="report-line"><span>${esc(name)}</span><div class="report-track"><i style="width:${total?Math.min(100,Math.round(num/total*100)):0}%"></i></div><strong>${num}</strong></div>`;
  const areaNames={taxi:'Taxi aéreo',escuela:'Escuela de aviación',experiencias:'Experiencias'};
  const notes=r.notes.length?`<ul class="report-notes">${r.notes.map(n=>`<li><b>${esc(({logro:'LOGRO',riesgo:'RIESGO',prioridad:'PRIORIDAD'})[n.category])}</b>${esc(n.note)}</li>`).join('')}</ul>`:zero('Todavía no hay notas de dirección para este mes.');
  $('reportContent').innerHTML=`<div class="report-head"><div><span class="ops-overline">HELITÁCTICA · REPORTE EJECUTIVO</span><h2>Resumen mensual · ${esc(month)}</h2><small>Informe calculado a partir de los registros ficticios de esta demostración</small></div><span class="report-mark">H / OPERATIONS</span></div>
  <p class="report-info">${esc(r.source)}. ${r.has_data?'Se encontraron registros para este período.':'Sin registros para este período: los indicadores son cero; NO es una estimación.'} Generado ${esc(new Date(r.as_of).toLocaleString('es-PY'))}.</p>
  <section class="report-section"><h3>01 · Desempeño comercial</h3><div class="report-kpis">${kpis([[c.inquiries,'Consultas nuevas'],[c.won_snapshot,'Ganadas · estado actual'],[c.open_snapshot,'Abiertas · estado actual'],[Object.keys(c.stages).length,'Etapas con actividad']])}</div><div class="report-breakdown" style="margin-top:22px">${Object.entries(c.by_area).map(([a,n])=>line(areaNames[a]||a,n,c.inquiries)).join('')}</div><p class="muted">${esc(c.note)}</p></section>
  <section class="report-section"><h3>02 · Campaña de control de incendios</h3><div class="report-kpis">${kpis([[f.activities,'Operativos registrados'],[f.completed,'Operativos completados'],[f.detections,'Registros de detección'],[hhmm(f.flight_minutes),'Tiempo de vuelo']])}</div><div class="report-breakdown" style="margin-top:22px">${Object.entries(f.by_type).map(([name,n])=>line(name,n,f.activities)).join('')||zero('Sin actividades de incendios registradas.')}</div><p class="muted">Alertas de severidad alta: <strong>${f.alerts_high}</strong> · Días con operativos: <strong>${f.operating_days}</strong></p><p class="muted">${esc(f.note)}</p></section>
  <section class="report-section"><h3>03 · Notas para la dirección</h3>${notes}</section>
  <section class="report-section"><h3>04 · Bitácora de incendios · ${esc(month)}</h3><div class="ops-tablewrap"><table class="ops-table"><thead><tr><th>Fecha</th><th>Campaña / Ubicación</th><th>Tipo</th><th>Estado</th><th>Severidad</th><th>Vuelo</th></tr></thead><tbody>${f.records.map(a=>`<tr><td>${esc(a.event_date)}</td><td>${esc(a.campaign_name)}<small>${esc(a.location)}</small></td><td>${esc(a.activity_type)}</td><td>${esc(a.status)}</td><td>${esc(a.severity)}</td><td>${hhmm(a.flight_minutes)}</td></tr>`).join('')||'<tr><td colspan="6">Sin registros</td></tr>'}</tbody></table></div></section>
  <div class="report-footer"><span>Helitáctica · Documento DEMO · No presentar como resultados reales</span><span>Sin datos operativos reales ni WhatsApp real · NovaTec Engineering</span></div>`;
 }
 function init(deps){api=deps.api;notify=deps.notify;me=deps.user;if(initialized)return;initialized=true;$('reportMonth').value=thisMonth();$('fireDate').value=today();$('campaignForm').querySelector('[name=start_date]').value=today();
  $('campaignForm').addEventListener('submit',async e=>{e.preventDefault();let f=e.currentTarget,v=asForm(f);if(!v.end_date)delete v.end_date;try{await api('/api/operations/campaigns',{method:'POST',body:JSON.stringify(v)});notify('Campaña guardada');f.reset();f.querySelector('[name=start_date]').value=today();await refreshFire()}catch(err){notify(err.message)}});
  $('fireActivityForm').addEventListener('submit',async e=>{e.preventDefault();let f=e.currentTarget,v=asForm(f);v.campaign_id=Number(v.campaign_id);v.flight_minutes=Number(v.flight_minutes||0);try{await api('/api/operations/activities',{method:'POST',body:JSON.stringify(v)});notify('Operativo registrado');f.reset();$('fireDate').value=today();await refreshFire()}catch(err){notify(err.message)}});
  $('noteForm').addEventListener('submit',async e=>{e.preventDefault();let f=e.currentTarget,v=asForm(f);v.month=$('reportMonth').value;try{await api('/api/operations/notes',{method:'POST',body:JSON.stringify(v)});f.reset();notify('Nota agregada al informe');await refreshReport()}catch(err){notify(err.message)}});
  $('fireDemoSeed').addEventListener('click',async()=>{try{const d=await api('/api/operations/demo-scenario',{method:'POST',body:'{}'});notify(d.created?'4 registros ficticios DEMO creados':'Los registros DEMO ya existen');await refreshFire()}catch(e){notify(e.message)}});
  $('refreshReport').addEventListener('click',()=>refreshReport().catch(e=>notify(e.message)));
  $('reportMonth').addEventListener('change',()=>refreshReport().catch(e=>notify(e.message)));
  $('printReport').addEventListener('click',()=>{if(!lastReport){notify('Primero generá el informe');return}document.body.classList.remove('print-fire-only');window.print()});
  $('printFireReport').addEventListener('click',()=>{if(!lastReport){notify('Primero generá el informe');return}document.body.classList.add('print-fire-only');window.print();setTimeout(()=>document.body.classList.remove('print-fire-only'),1000)});
  $('exportReport').addEventListener('click',async()=>{const month=$('reportMonth').value;try{const response=await fetch('/api/operations/report/'+month+'/csv',{headers:{Authorization:'Bearer '+deps.getToken()}});if(!response.ok)throw Error('No se pudo exportar');const blob=await response.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='helitactica-'+month+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}catch(e){notify(e.message)}});
 }
 return{init,refreshFire,refreshReport};
})();