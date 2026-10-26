/*
 Helitáctica CRM — PRESENTATION-ONLY in-browser API simulator.
 Not a backend, not a security boundary, no network calls, no personal data.
 All records are fictional. Session storage belongs to the current browser tab.
 NovaTec Engineering · demo public 2026.
*/
(() => {
  'use strict';
  const KEY = 'heli-demo-v04-20261026-r3';
  const nativeFetch = window.fetch.bind(window);
  // about:blank is used only by offline browser QA when navigation is restricted.
  const baseUrl = () => location.protocol === 'about:' ? 'https://novatec.com.py/' : location.href;
  const AREAS = {
    taxi:{name:'Taxi aéreo',line:'linea-taxi',seller:'Gerencia Helitáctica',questions:[
      '¿Cuál sería el lugar de salida y el destino?',
      '¿Para qué fecha y horario necesitás el traslado?',
      '¿Cuántos pasajeros viajarían y sería ida o ida y vuelta?' ]},
    escuela:{name:'Escuela de aviación',line:'linea-escuela',seller:'Asesor Escuela',questions:[
      '¿Te interesa formarte como piloto o estás buscando otro curso?',
      '¿Tenés experiencia previa de vuelo?',
      '¿Para cuándo te gustaría comenzar?']},
    experiencias:{name:'Experiencias',line:'linea-experiencias',seller:'Asesor Experiencias',questions:[
      '¿Te interesa un vuelo panorámico, piloto por un día u otra experiencia?',
      '¿Para cuántas personas sería?',
      '¿Qué fecha tenés en mente? ¿Sería un regalo?']}
  };
  const LINES = Object.entries(AREAS).map(([area,data])=>({id:data.line,area,label:'WhatsApp · '+data.name,meta_phone_number_id:null,integracion:'SIMULADA'}));
  const USERS = {
    gerente:{id:1,username:'gerente',name:'Gerencia Helitáctica · DEMO',role:'manager',area:null},
    taxi:{id:2,username:'taxi',name:'Responsable taxi aéreo · DEMO',role:'seller',area:'taxi'},
    escuela:{id:3,username:'escuela',name:'Asesor Escuela · DEMO',role:'seller',area:'escuela'},
    experiencias:{id:4,username:'experiencias',name:'Asesor Experiencias · DEMO',role:'seller',area:'experiencias'}
  };
  const STAGES=['Nuevo','Interesado','Cotización','Ganado','Perdido'];
  const TYPES=['Patrullaje','Detección','Seguimiento','Coordinación','Apoyo','Otro'];
  const FIRE_STATUSES=['Programado','En curso','Completado','Cancelado'];
  const SEVERITIES=['No aplica','Baja','Media','Alta'];
  const now=()=>new Date().toISOString();
  const localDate=(offset=0)=>{let d=new Date();d.setDate(d.getDate()+offset);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const mon=(offset=0)=>{let d=new Date();d.setDate(15);d.setMonth(d.getMonth()+offset);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
  const monthDate=(month,day)=>month+'-'+String(day).padStart(2,'0');
  const iso=(month,day,hour=12)=>monthDate(month,day)+'T'+String(hour).padStart(2,'0')+':00:00.000Z';
  let ephemeral=null;
  let state;
  function store(){try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{ephemeral=JSON.stringify(state)}}
  function seed(){
    const m=mon(),prev=mon(-1);
    const s={version:3,nextId:1,msgId:1,campaignId:3,activityId:1,noteId:4,conversations:[],messages:[],answers:[],campaigns:[],activities:[],notes:[]};
    function message(cid,text,source,date){s.messages.push({id:s.msgId++,conversation_id:cid,direction:source==='client'?'in':'out',source,text,created_at:date})}
    const rows=[
      ['taxi','Ana Rojas · DEMO','DEMO-TAXI-01','Traslado privado Asunción – Ciudad del Este','Cotización','waiting',8],
      ['taxi','Luis Vera · DEMO','DEMO-TAXI-02','Viaje corporativo a Encarnación','Interesado','human',6],
      ['taxi','Sofía Duarte · DEMO','DEMO-TAXI-03','Consulta por vuelo privado','Ganado','human',4],
      ['taxi','Pablo Núñez · DEMO','DEMO-TAXI-04','Necesito información de taxi aéreo','Nuevo','triage',2],
      ['escuela','Carlos Benítez · DEMO','DEMO-ESC-01','Quiero comenzar el curso de piloto privado','Interesado','waiting',9],
      ['escuela','Lucía Franco · DEMO','DEMO-ESC-02','Consulta de clases y horarios de vuelo','Cotización','human',7],
      ['escuela','Diego Ortiz · DEMO','DEMO-ESC-03','Formación desde cero','Nuevo','triage',5],
      ['escuela','María Cabrera · DEMO','DEMO-ESC-04','Información sobre la escuela de aviación','Ganado','human',1],
      ['experiencias','Natalia López · DEMO','DEMO-EXP-01','Regalo de vuelo panorámico','Interesado','waiting',10],
      ['experiencias','Gabriela Méndez · DEMO','DEMO-EXP-02','Piloto por un día para cumpleaños','Cotización','human',8],
      ['experiencias','Andrés Ferreira · DEMO','DEMO-EXP-03','Vuelo para dos personas','Nuevo','triage',3],
      ['experiencias','Valeria Torres · DEMO','DEMO-EXP-04','Experiencia de vuelo panorámico','Ganado','human',6],
      ['taxi','Ricardo Gómez · DEMO','DEMO-TAXI-05','Planificación de traslado aéreo','Perdido','human',-1],
      ['escuela','Julia Martínez · DEMO','DEMO-ESC-05','Consulta sobre cursos de aviación','Interesado','waiting',-1],
      ['experiencias','Matías Acosta · DEMO','DEMO-EXP-05','Paseo aéreo para familia','Nuevo','human',-1]
    ];
    rows.forEach(([area,name,phone,text,stage,status,dayIndex],idx)=>{
      const month=dayIndex<0?prev:m,day=dayIndex<0?18+idx%3:Math.max(1,Math.min(22,dayIndex));
      const date=iso(month,day,9+idx%9),id=s.nextId++;
      const c={id,line_id:AREAS[area].line,contact_phone:phone,contact_name:name,area,seller_id:USERS[area].id,status,ai_enabled:status==='triage'?1:0,step:status==='triage'?1:4,stage,created_at:date,updated_at:date};
      s.conversations.push(c);
      message(id,text,'client',date);
      const intro='¡Gracias por consultar! Área de '+AREAS[area].name+'. '+AREAS[area].questions[0];
      message(id,intro,'bot',date);
      if(status!=='triage'){
        let answer=area==='taxi'?'Necesito confirmar fecha y cantidad de pasajeros':area==='escuela'?'Me interesa comenzar pronto':'Sería para dos personas';
        message(id,answer,'client',date);
        s.answers.push({conversation_id:id,question:AREAS[area].questions[0],answer});
        message(id,AREAS[area].questions[1],'bot',date);
        if(status==='human')message(id,'Hola, continúo personalmente tu consulta (simulación de WhatsApp Business).','mobile',date);
        else message(id,'Tu consulta está derivada al asesor correspondiente.','bot',date);
      }
    });
    s.campaigns=[
      {id:1,name:'DEMO · Campaña de vigilancia preventiva',start_date:monthDate(m,1),end_date:null,region:'Zona de ejemplo · Paraguay (ficticia)',goal:'Ejercicio ficticio para demostrar seguimiento y reportes',status:'Activa',created_by:'gerente',created_at:now()},
      {id:2,name:'DEMO · Operativos de seguimiento — mes anterior',start_date:monthDate(prev,1),end_date:monthDate(prev,28),region:'Zona simulada, sin ubicación real',goal:'Escenario comparativo ficticio',status:'Cerrada',created_by:'gerente',created_at:now()}
    ];
    const acts=[
      [1,m,3,'Patrullaje','Completado','No aplica',80,'Recorrido de vigilancia simulado'],
      [1,m,5,'Detección','Completado','Alta',55,'Alerta ficticia: presencia de humo observada'],
      [1,m,8,'Seguimiento','Completado','Media',47,'Verificación ficticia de un punto observado'],
      [1,m,11,'Coordinación','Completado','No aplica',0,'Reunión entre equipos simulados'],
      [1,m,14,'Patrullaje','Completado','Baja',90,'Observaciones registradas para informe DEMO'],
      [1,m,17,'Detección','En curso','Media',33,'Evaluación ficticia en seguimiento'],
      [1,m,20,'Apoyo','Programado','No aplica',0,'Coordinación pendiente · DEMO'],
      [2,prev,7,'Patrullaje','Completado','No aplica',65,'Registro ficticio mes anterior'],
      [2,prev,11,'Detección','Completado','Baja',35,'Alerta simulada sin consecuencia real'],
      [2,prev,19,'Seguimiento','Completado','Media',38,'Visita de comprobación ficticia']
    ];
    acts.forEach(([campaign_id,month,day,activity_type,status,severity,flight_minutes,findings],i)=>s.activities.push({
      id:s.activityId++,campaign_id,event_date:monthDate(month,day),location:'DEMO · Sector '+String(i+1).padStart(2,'0')+' (sin ubicación real)',activity_type,status,severity,flight_minutes,findings,responsible:'Equipo ficticio '+(i%2?'Bravo':'Alfa'),notes:'DATOS DE DEMOSTRACIÓN; no representan misiones aéreas reales.',created_by:'gerente',created_at:now()}));
    s.notes=[
      {id:1,month:m,category:'logro',note:'DEMO · Registro ficticio de operativos y seguimiento por área. No representa resultados reales.',created_by:'gerente',created_at:now()},
      {id:2,month:m,category:'riesgo',note:'DEMO · Validar datos de origen antes de presentar un informe real ante directores.',created_by:'gerente',created_at:now()},
      {id:3,month:m,category:'prioridad',note:'DEMO · Definir responsables, indicadores y próximos hitos operativos.',created_by:'gerente',created_at:now()}
    ];
    return s;
  }
  try{const saved=sessionStorage.getItem(KEY);state=saved?JSON.parse(saved):seed()}catch{state=ephemeral?JSON.parse(ephemeral):seed()}
  if(!state||state.version!==3){state=seed()}
  store();
  let signedIn=null;
  const clone=o=>JSON.parse(JSON.stringify(o));
  const response=(data,status=200,type='application/json')=>new Response(type==='application/json'?JSON.stringify(data):data,{status,headers:{'Content-Type':type,'Cache-Control':'no-store'}});
  const fail=(message,status=400)=>response({detail:message},status);
  const body=async init=>{try{if(init?.body)return JSON.parse(init.body);return {}}catch{return {}}};
  const isoStamp=()=>new Date().toISOString();
  const hasArea=c=>signedIn?.role==='manager'||c.area===signedIn?.area;
  const requireManager=()=>signedIn?.role==='manager';
  function conv(c){const line=LINES.find(l=>l.id===c.line_id);const msgs=state.messages.filter(x=>x.conversation_id===c.id);return {...c,line_label:line?.label||'Línea DEMO',seller_name:c.area?USERS[c.area]?.name:null,last_text:msgs.length?msgs[msgs.length-1].text:''}}
  const chat=(id)=>state.conversations.find(c=>c.id===id);
  function newMessage(id,text,source){state.messages.push({id:state.msgId++,conversation_id:id,direction:source==='client'?'in':'out',source,text,created_at:isoStamp()})}
  function classify(text){const normalized=String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(/panoram|experien|paseo|regalo|piloto por un dia|bautismo|sobrevuelo/.test(normalized))return 'experiencias';
    if(/escuela|curso|estudi|licencia|aprender|formacion|academia|ser piloto|clase/.test(normalized))return 'escuela';
    if(/taxi|traslad|transport|charter|viaj|destino|vuelo privado|avion privado|flete aereo/.test(normalized))return 'taxi';
    return null;
  }
  function inbound({line_id,phone,name,text}){
    const line=LINES.find(l=>l.id===line_id);if(!line)return {err:'Línea inexistente'};
    const payload=String(text||'').trim();if(!payload||!String(name||'').trim()||!String(phone||'').trim())return {err:'Completá todos los datos de prueba.'};
    let c=state.conversations.find(c=>c.line_id===line_id&&c.contact_phone===phone);
    if(!c){c={id:state.nextId++,line_id,contact_phone:phone,contact_name:name,area:null,seller_id:null,status:'triage',ai_enabled:1,step:0,stage:'Nuevo',created_at:isoStamp(),updated_at:isoStamp()};state.conversations.push(c)}
    newMessage(c.id,payload,'client');
    let reply=null;
    if(c.ai_enabled){
      if(/\b(asesor|humano|persona|vendedor|gerente|operador)\b/i.test(payload)){
        c.area=c.area||line.area;c.status='human';c.ai_enabled=0;reply='Te conectaremos con una persona del equipo de Helitáctica (simulación).';
      }else if(!c.area){c.area=classify(payload);
        if(!c.area){reply='¡Hola! Bienvenido a Helitáctica. ¿Buscás taxi aéreo, escuela de aviación o experiencias?'}
        else{c.step=1;reply='Gracias por tu consulta de '+AREAS[c.area].name+'. '+AREAS[c.area].questions[0]}
      }else{
        const questions=AREAS[c.area].questions,previous=Math.min(Math.max(0,c.step-1),questions.length-1);
        state.answers.push({conversation_id:c.id,question:questions[previous],answer:payload});c.step++;
        if(c.step>questions.length){c.status='waiting';c.ai_enabled=0;reply='Gracias, registramos tu consulta. El asesor continuará la atención. No existe ninguna reserva confirmada (simulación).'}
        else reply=questions[c.step-1];
      }
      if(c.area)c.seller_id=USERS[c.area].id;
      if(reply)newMessage(c.id,reply,'bot');
    }
    c.updated_at=isoStamp();store();return {conversation_id:c.id,duplicate:false,bot_reply:reply,area:c.area,status:c.status,ai_enabled:!!c.ai_enabled};
  }
  function scenario(){const examples=[
    {area:'taxi',name:'Cliente taxi · DEMO',lines:['Necesito taxi aéreo a Encarnación','Asunción a Encarnación','El próximo viernes de mañana','2 pasajeros ida y vuelta']},
    {area:'escuela',name:'Cliente escuela · DEMO',lines:['Quiero hacer curso de piloto','Piloto privado','No tengo experiencia','Quiero comenzar el mes próximo']},
    {area:'experiencias',name:'Cliente experiencias · DEMO',lines:['Quiero un vuelo panorámico como regalo','Vuelo panorámico','Para dos personas','Sábado de mañana, es regalo']}
  ];const created=[];
    for(const s of examples){let out=null;const phone='DEMO-GEN-'+state.nextId;for(const t of s.lines)out=inbound({line_id:AREAS[s.area].line,phone,name:s.name,text:t});created.push({conversation_id:out.conversation_id,line_id:AREAS[s.area].line,name:s.name,area:s.area,status:out.status})}
    const c=chat(created[2].conversation_id);newMessage(c.id,'¡Hola! Un asesor se hará cargo de tu experiencia (respuesta móvil simulada).','mobile');c.status='human';c.ai_enabled=0;c.updated_at=isoStamp();store();return {ok:true,created,count:3,note:'Escenarios ficticios, ningún mensaje real fue enviado.'};
  }
  function campaigns(){return state.campaigns.map(c=>({...c,activities:state.activities.filter(a=>a.campaign_id===c.id).length})).sort((a,b)=>b.id-a.id)}
  function activityRows(month=null){return state.activities.filter(a=>!month||a.event_date.startsWith(month)).map(a=>({...a,campaign_name:state.campaigns.find(c=>c.id===a.campaign_id)?.name||'Campaña'})).sort((a,b)=>b.event_date.localeCompare(a.event_date)||b.id-a.id)}
  const countKey=(rows,key)=>Object.fromEntries([...new Set(rows.map(r=>r[key]))].map(v=>[v,rows.filter(r=>r[key]===v).length]));
  function report(month){
    const convs=state.conversations.filter(c=>c.created_at.startsWith(month));
    const activities=activityRows(month);
    const byArea=Object.fromEntries(Object.keys(AREAS).map(k=>[k,convs.filter(c=>c.area===k).length]));
    const notes=state.notes.filter(n=>n.month===month).map(n=>({...n}));
    return {month,as_of:isoStamp(),source:'DEMO PÚBLICA · DATOS 100% FICTICIOS EN ESTE NAVEGADOR',
      commercial:{inquiries:convs.length,won_snapshot:convs.filter(c=>c.stage==='Ganado').length,open_snapshot:convs.filter(c=>!['Ganado','Perdido'].includes(c.stage)).length,by_area:byArea,stages:countKey(convs,'stage'),note:'Consulta DEMO del mes seleccionado; etapas muestran estado actual, no historial de cierre.'},
      fire:{activities:activities.length,completed:activities.filter(a=>a.status==='Completado').length,detections:activities.filter(a=>a.activity_type==='Detección').length,alerts_high:activities.filter(a=>a.severity==='Alta').length,flight_minutes:activities.reduce((sum,a)=>sum+Number(a.flight_minutes),0),operating_days:new Set(activities.map(a=>a.event_date)).size,by_type:countKey(activities,'activity_type'),by_status:countKey(activities,'status'),records:activities,note:'Cifras ficticias de entrenamiento. No reflejan vuelos, incendios ni resultados operativos reales.'},
      notes,has_data:Boolean(convs.length||activities.length||notes.length)};
  }
  const csvCell=value=>{let v=String(value??'');if(/^[\s]*[=+\-@]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"'};
  function csvReport(month){const r=report(month),rows=[['HELITÁCTICA — INFORME MENSUAL DEMO',month],['ADVERTENCIA','DATOS 100% FICTICIOS; no usar como reporte operativo real'],[],['Indicador','Cantidad'],['Consultas recibidas',r.commercial.inquiries],['Oportunidades ganadas (estado actual)',r.commercial.won_snapshot],['Oportunidades abiertas (estado actual)',r.commercial.open_snapshot]];
    for(const [area,count] of Object.entries(r.commercial.by_area))rows.push(['Consultas '+AREAS[area].name,count]);
    for(const [key,label] of [['activities','Operativos registrados'],['completed','Operativos completados'],['detections','Detecciones registradas'],['alerts_high','Alertas de severidad alta'],['flight_minutes','Minutos de vuelo ficticios']])rows.push([label,r.fire[key]]);
    rows.push([],['ID','Campaña','Fecha','Lugar','Tipo','Estado','Severidad','Minutos','Hallazgos','Responsable','Observaciones']);
    for(const a of r.fire.records)rows.push([''+a.id,a.campaign_name,a.event_date,a.location,a.activity_type,a.status,a.severity,a.flight_minutes,a.findings,a.responsible,a.notes]);
    return '\ufeff'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
  }
  function validateMonth(month){return /^\d{4}-(0[1-9]|1[0-2])$/.test(month)}
  async function router(path,init){
    const url=new URL(path,baseUrl()),route=url.pathname.replace(/^\/+api\//,'');const method=(init.method||'GET').toUpperCase();
    if(route==='login'&&method==='POST'){
      const p=await body(init),u=USERS[String(p.username||'').toLowerCase()];
      if(!u||p.password!=='HeliDemo2026!')return fail('Acceso ficticio: utilizá los datos demo indicados.',401);
      signedIn=u;return response({token:'SIMULACION-PUBLICA-'+u.username,user:clone(u)});
    }
    if(route==='health')return response({ok:true,mode:'BROWSER_ONLY_DEMO',whatsapp_real:false,version:'0.4.2'});
    if(route==='logout'){signedIn=null;return response({ok:true})}
    if(!signedIn)return fail('Ingresá a la demostración.',401);
    if(route==='me')return response({...signedIn,full_name:signedIn.name});
    if(route==='lines')return response(clone(LINES));
    if(route==='overview'){
      const rows=state.conversations.filter(hasArea);return response({total:rows.length,waiting:rows.filter(c=>c.status==='waiting').length,human:rows.filter(c=>c.status==='human').length,triage:rows.filter(c=>c.status==='triage').length,won:rows.filter(c=>c.stage==='Ganado').length,areas:Object.fromEntries(Object.keys(AREAS).map(k=>[k,rows.filter(c=>c.area===k).length]))});
    }
    if(route==='conversations'&&method==='GET')return response(state.conversations.filter(hasArea).map(conv).sort((a,b)=>b.updated_at.localeCompare(a.updated_at)||b.id-a.id));
    let m=route.match(/^conversations\/(\d+)(?:\/(stage|reassign|reply))?$/);
    if(m){const c=chat(Number(m[1]));if(!c||!hasArea(c))return fail('Conversación inexistente en tu área.',404);
      if(!m[2]&&method==='GET')return response({conversation:conv(c),messages:state.messages.filter(x=>x.conversation_id===c.id),answers:state.answers.filter(x=>x.conversation_id===c.id)});
      const p=await body(init);
      if(m[2]==='stage'&&method==='PATCH'){if(!STAGES.includes(p.stage))return fail('Etapa no válida',422);c.stage=p.stage;c.updated_at=isoStamp();store();return response({ok:true})}
      if(m[2]==='reassign'&&method==='PATCH'){if(!requireManager())return fail('Solo gerencia puede reasignar',403);if(!AREAS[p.area])return fail('Área no válida',422);c.area=p.area;c.seller_id=USERS[p.area].id;c.updated_at=isoStamp();store();return response({ok:true,area:p.area,note:'La línea original de WhatsApp no cambia'})}
      if(m[2]==='reply'&&method==='POST'){if(!String(p.text||'').trim())return fail('Ingresá una respuesta',422);newMessage(c.id,p.text,'seller');c.ai_enabled=0;c.status='human';c.updated_at=isoStamp();store();return response({ok:true,warning:'Respuesta interna simulada; NO enviada a WhatsApp'})}
    }
    if(route==='simulator/inbound'&&method==='POST'){if(!requireManager())return fail('Solo gerencia puede simular mensajes',403);const v=inbound(await body(init));return v.err?fail(v.err,422):response(v)}
    if(route==='simulator/scenarios'&&method==='POST'){if(!requireManager())return fail('Solo gerencia puede crear escenarios',403);return response(scenario())}
    if(route==='simulator/mobile-echo'&&method==='POST'){
      const p=await body(init),c=state.conversations.find(x=>x.line_id===p.line_id&&x.contact_phone===p.phone);
      if(!c||!hasArea(c))return fail('Conversación inexistente',404);
      newMessage(c.id,p.text||'Respuesta desde aplicación móvil · DEMO','mobile');c.status='human';c.ai_enabled=0;c.updated_at=isoStamp();store();return response({ok:true,conversation_id:c.id,ai_paused:true});
    }
    if(route.startsWith('operations/')){
      if(!requireManager())return fail('Solo gerencia puede ver campañas e informes (simulación)',403);
      if(route==='operations/campaigns'&&method==='GET')return response(campaigns());
      if(route==='operations/campaigns'&&method==='POST'){
        const p=await body(init);if(!p.name||!p.start_date)return fail('Completá nombre y fecha inicial',422);
        if(p.end_date&&p.end_date<p.start_date)return fail('La fecha final debe ser posterior al inicio',422);
        const id=state.campaignId++;state.campaigns.push({id,name:p.name,start_date:p.start_date,end_date:p.end_date||null,region:p.region||'',goal:p.goal||'',status:p.status||'Activa',created_at:isoStamp(),created_by:'gerente'});store();return response({id,ok:true},201);
      }
      if(route==='operations/activities'&&method==='GET')return response(activityRows(url.searchParams.get('month')).filter(a=>!url.searchParams.has('campaign_id')||String(a.campaign_id)===url.searchParams.get('campaign_id')));
      if(route==='operations/activities'&&method==='POST'){
        const p=await body(init),camp=state.campaigns.find(c=>c.id===p.campaign_id);
        if(!camp)return fail('La campaña no existe',404);
        if(!p.location||!p.event_date||!TYPES.includes(p.activity_type)||!FIRE_STATUSES.includes(p.status)||!SEVERITIES.includes(p.severity)||Number(p.flight_minutes)<0||Number(p.flight_minutes)>1440)return fail('Revisá los datos del operativo',422);
        if(p.event_date<camp.start_date||(camp.end_date&&p.event_date>camp.end_date))return fail('La fecha está fuera de la campaña',422);
        const id=state.activityId++;state.activities.push({...p,id,created_by:'gerente',created_at:isoStamp(),flight_minutes:Number(p.flight_minutes||0),findings:p.findings||'',responsible:p.responsible||'',notes:p.notes||''});store();return response({id,ok:true},201);
      }
      m=route.match(/^operations\/activities\/(\d+)\/status$/);
      if(m&&method==='PATCH'){const a=state.activities.find(x=>x.id===Number(m[1])),newStatus=url.searchParams.get('status');if(!a)return fail('Actividad inexistente',404);if(!FIRE_STATUSES.includes(newStatus))return fail('Estado inválido',422);a.status=newStatus;store();return response({ok:true})}
      if(route==='operations/demo-scenario'&&method==='POST'){
        const name='DEMO · Vigilancia y seguimiento de incendios';let c=state.campaigns.find(c=>c.name===name);
        if(c)return response({ok:true,created:0,campaign_id:c.id,demo:true});
        c={id:state.campaignId++,name,start_date:monthDate(mon(),1),end_date:null,region:'Zona ficticia',goal:'Escenario de muestra',status:'Activa',created_by:'gerente',created_at:isoStamp()};state.campaigns.push(c);
        for(const [type,minutes,severity] of [['Patrullaje',45,'No aplica'],['Detección',36,'Alta'],['Seguimiento',30,'Media'],['Coordinación',0,'No aplica']]){
          state.activities.push({id:state.activityId++,campaign_id:c.id,event_date:localDate(),location:'DEMO · Ubicación ficticia',activity_type:type,status:'Completado',severity,flight_minutes:minutes,findings:'Registro ilustrativo, no real.',responsible:'Equipo ficticio',notes:'DATOS DEMO',created_at:isoStamp(),created_by:'gerente'});
        }store();return response({ok:true,created:4,campaign_id:c.id,demo:true});
      }
      if(route==='operations/notes'&&method==='GET')return response(state.notes.filter(n=>n.month===url.searchParams.get('month')).sort((a,b)=>b.id-a.id));
      if(route==='operations/notes'&&method==='POST'){
        const p=await body(init);if(!validateMonth(p.month)||!['logro','riesgo','prioridad'].includes(p.category)||!String(p.note||'').trim())return fail('Nota inválida',422);
        const id=state.noteId++;state.notes.push({id,...p,created_at:isoStamp(),created_by:'gerente'});store();return response({id,ok:true},201);
      }
      m=route.match(/^operations\/report\/(\d{4}-\d{2})(\/csv)?$/);
      if(m){if(!validateMonth(m[1]))return fail('Mes inválido',422);
        if(m[2])return response(csvReport(m[1]),200,'text/csv; charset=utf-8');
        return response(report(m[1]));
      }
    }
    return fail('Función no implementada en esta demostración',404);
  }
  window.fetch = (input, init={}) => {
    const path = typeof input==='string'?input:input instanceof URL?input.href:input?.url;
    if(!path)return nativeFetch(input,init);
    const url = new URL(path,baseUrl());
    if(url.pathname.startsWith('/api/'))return Promise.resolve().then(()=>router(url.href,init)).catch(e=>{console.error('Demo API error',e);return fail('Ocurrió un error en la simulación',500)});
    return nativeFetch(input,init);
  };
  window.HeliDemo={
    reset(){try{sessionStorage.removeItem(KEY)}catch{}ephemeral=null;state=seed();store();location.reload()},
    state:()=>clone(state),
    report,
    login:username=>{signedIn=USERS[username]||USERS.gerente}
  };
  // Direct access for a commercial presentation. Demo accounts are NOT real authentication.
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('resetDemo')?.addEventListener('click',()=>{if(confirm('¿Restaurar todos los datos ficticios de esta pestaña?'))window.HeliDemo.reset()});
    const form=document.getElementById('loginForm');
    if(form&&new URLSearchParams(location.search).get('login')!=='1')window.setTimeout(()=>form.requestSubmit(),140);
  });
})();