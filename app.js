const STORAGE_KEY="minha-jornada-v1";
function makeId(){return "id-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10)}
const categories=["Espiritualidade","Profissional","Estudos","Saúde","Saúde Ocular","Finanças","Desenvolvimento","Produtividade","Casa","Relacionamentos","Lazer","Outro"];
const financeCategories=["Moradia","Alimentação","Transporte","Saúde","Educação","Lazer","Doações","Assinaturas","Impostos","Investimentos","Renda","Outros"];
const week=[{id:0,label:"Dom"},{id:1,label:"Seg"},{id:2,label:"Ter"},{id:3,label:"Qua"},{id:4,label:"Qui"},{id:5,label:"Sex"},{id:6,label:"Sáb"}];
const seedGoals=[
["Culto matinal","Espiritualidade","Alta","daily",[0,1,2,3,4,5,6],7,"1 culto","Começar o dia em comunhão com Deus"],
["Orar por pelo menos 30 minutos","Espiritualidade","Alta","daily",[0,1,2,3,4,5,6],7,"30 minutos","Fortalecer a vida de oração"],
["Lição da Escola Sabatina","Espiritualidade","Alta","daily",[0,1,2,3,4,5,6],7,"1 lição","Estudar a lição diariamente"],
["Reavivados por Sua Palavra","Espiritualidade","Alta","daily",[0,1,2,3,4,5,6],7,"Leitura do dia","Leitura bíblica sistemática"],
["Assinar todas as caixas dos GTs da Procuradoria","Profissional","Alta","daily",[1,2,3,4,5],5,"Todas as caixas do dia","Rotina de expediente"],
["Estudar por pelo menos 2 horas","Estudos","Alta","daily",[0,1,2,3,4,5],6,"2 horas","Sábado reservado ao descanso"],
["Kickboxing","Saúde","Média","weekly",[2,4],1,"1 treino por semana","Escolher terça ou quinta"],
["Jiu-jitsu pela manhã","Saúde","Alta","weekly",[1,3,5],3,"3 treinos por semana","Segunda, quarta e sexta"],
["Atividade física","Saúde","Alta","daily",[0,1,2,3,4,5],6,"30 minutos","Kickboxing e jiu-jitsu contam"],
["Pausas visuais durante uso de telas","Saúde Ocular","Alta","daily",[0,1,2,3,4,5],6,"Regra 20-20-20","Ajuda no conforto; não trata ceratocone"],
["Não coçar nem pressionar os olhos","Saúde Ocular","Alta","daily",[0,1,2,3,4,5,6],7,"Dia inteiro","Evitar fricção ocular"],
["Acompanhamento do ceratocone","Saúde Ocular","Alta","monthly",[0,1,2,3,4,5,6],1,"Conforme prescrição","Acompanhamento com especialista em córnea"],
["Encerrar trabalho e estudos antes do pôr do sol de sexta","Espiritualidade","Alta","weekly",[5],1,"Antes do pôr do sol","Preparar a entrada do sábado"],
["Guardar o sábado como dia de descanso, culto e comunhão","Espiritualidade","Alta","weekly",[6],1,"Período sabático","Do pôr do sol de sexta ao pôr do sol de sábado"]
].map((g,i)=>({id:makeId(),name:g[0],category:g[1],priority:g[2],frequency:g[3],weekdays:g[4],weeklyTarget:g[5],duration:g[6],notes:g[7],start:"2026-01-01",end:"2026-12-31",active:true,order:i}));
const defaultState=()=>({goals:JSON.parse(JSON.stringify(seedGoals)),completions:{},transactions:[],version:1});
let state=loadState(),currentCategory="Todos";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||defaultState()}catch{return defaultState()}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function parseDate(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function fmtDate(s){return parseDate(s).toLocaleDateString("pt-BR")}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function toast(text){const t=$("#toast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function isScheduled(goal,date){
 if(!goal.active||iso(date)<goal.start||iso(date)>goal.end)return false;
 if(goal.frequency==="daily")return goal.weekdays.includes(date.getDay());
 if(goal.frequency==="weekly")return goal.weekdays.includes(date.getDay());
 if(goal.frequency==="monthly")return date.getDate()===1;
 return goal.weekdays.includes(date.getDay());
}
function completionKey(goalId,date){return `${goalId}|${iso(date)}`}
function isDone(goalId,date){return !!state.completions[completionKey(goalId,date)]}
function toggleDone(goalId,date){const k=completionKey(goalId,date);state.completions[k]?delete state.completions[k]:state.completions[k]=true;save()}
function tasksForDate(date){return state.goals.filter(g=>isScheduled(g,date)).sort((a,b)=>a.order-b.order)}
function dayProgress(date){const tasks=tasksForDate(date);return tasks.length?tasks.filter(g=>isDone(g.id,date)).length/tasks.length:0}
function frequencyLabel(v){return ({daily:"Diária",weekly:"Semanal",monthly:"Mensal",flexible:"Flexível"})[v]||v}
function setView(name){
 if(!name)return;
 $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
 $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
 $$(".mobile-nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
 const titles={hoje:"Visão de hoje",calendario:"Checklist mensal",objetivos:"Planejamento central",dashboard:"Dashboard",financas:"Finanças pessoais",config:"Dados e backup"};
 $("#pageTitle").textContent=titles[name];$(".sidebar").classList.remove("open");
 ({hoje:renderToday,calendario:renderCalendar,objetivos:renderGoals,dashboard:renderDashboard,financas:renderFinance,config:()=>{}})[name]();
}
function renderToday(){
 const date=parseDate($("#todayPicker").value),tasks=tasksForDate(date),p=dayProgress(date),done=tasks.filter(g=>isDone(g.id,date)).length;
 $("#todayPercent").textContent=`${Math.round(p*100)}%`;$("#todaySummary").textContent=`${done} de ${tasks.length} atividades concluídas.`;
 $("#todayRing").style.setProperty("--p",Math.round(p*100));$("#todayRing span").textContent=`${Math.round(p*100)}%`;
 const groups=Object.groupBy?Object.groupBy(tasks,g=>g.category):tasks.reduce((a,g)=>((a[g.category]??=[]).push(g),a),{});
 $("#todayTasks").innerHTML=Object.entries(groups).map(([cat,goals])=>`<article class="task-group"><div class="task-group-head"><h3>${cat}</h3><span>${goals.filter(g=>isDone(g.id,date)).length}/${goals.length}</span></div>${goals.map(g=>`<label class="task-row ${isDone(g.id,date)?"done":""}"><input class="task-check" type="checkbox" data-goal="${g.id}" ${isDone(g.id,date)?"checked":""}><span class="task-copy"><strong>${g.name}</strong><span>${g.duration}${g.notes?` · ${g.notes}`:""}</span></span><span class="badge">${g.priority}</span></label>`).join("")}</article>`).join("")||`<article class="panel"><p>Nenhuma atividade planejada para este dia.</p></article>`;
 $$("#todayTasks .task-check").forEach(el=>el.onchange=()=>{toggleDone(el.dataset.goal,date);renderToday()});
}
function renderCalendar(){
 const month=Number($("#monthSelect").value),year=Number($("#yearSelect").value),days=new Date(year,month+1,0).getDate();
 const goals=state.goals.filter(g=>g.active&&g.start<=`${year}-${String(month+1).padStart(2,"0")}-${String(days).padStart(2,"0")}`&&g.end>=`${year}-${String(month+1).padStart(2,"0")}-01`);
 let html=`<thead><tr><th>Objetivo</th>${Array.from({length:days},(_,i)=>`<th>${i+1}<small><br>${week[new Date(year,month,i+1).getDay()].label}</small></th>`).join("")}<th>%</th></tr></thead><tbody>`;
 for(const g of goals){let expected=0,done=0,cells="";for(let d=1;d<=days;d++){const date=new Date(year,month,d),scheduled=isScheduled(g,date),checked=isDone(g.id,date);if(scheduled)expected++;if(checked)done++;cells+=`<td class="day-cell ${checked?"done":""} ${scheduled?"":"disabled"}" data-goal="${g.id}" data-day="${d}">${checked?"✓":scheduled?"":"·"}</td>`}html+=`<tr><td>${g.name}<br><small>${g.category}</small></td>${cells}<td><strong>${Math.round((done/(expected||1))*100)}%</strong></td></tr>`}html+="</tbody>";$("#calendarTable").innerHTML=html;
 $$("#calendarTable .day-cell:not(.disabled)").forEach(td=>td.onclick=()=>{toggleDone(td.dataset.goal,new Date(year,month,Number(td.dataset.day)));renderCalendar()});
}
function renderGoals(){
 const cats=["Todos",...new Set(state.goals.map(g=>g.category))];$("#goalFilters").innerHTML=cats.map(c=>`<button class="filter-chip ${c===currentCategory?"active":""}" data-cat="${c}">${c}</button>`).join("");
 $$("#goalFilters button").forEach(b=>b.onclick=()=>{currentCategory=b.dataset.cat;renderGoals()});
 const goals=state.goals.filter(g=>currentCategory==="Todos"||g.category===currentCategory);
 $("#goalsGrid").innerHTML=goals.map(g=>`<article class="goal-card"><div class="goal-card-head"><span class="eyebrow">${g.category}</span><span class="badge">${g.active?"Ativo":"Pausado"}</span></div><h3>${g.name}</h3><p>${g.notes||"Sem observações."}</p><div class="goal-meta"><span class="badge">${g.priority}</span><span class="badge">${frequencyLabel(g.frequency)}</span><span class="badge">${g.duration}</span></div><div class="goal-actions"><button class="text-btn edit-goal" data-id="${g.id}">Editar</button><button class="text-btn toggle-goal" data-id="${g.id}">${g.active?"Pausar":"Ativar"}</button><button class="text-btn delete delete-goal" data-id="${g.id}">Excluir</button></div></article>`).join("");
 $$(".edit-goal").forEach(b=>b.onclick=()=>openGoal(b.dataset.id));$$(".toggle-goal").forEach(b=>b.onclick=()=>{const g=state.goals.find(x=>x.id===b.dataset.id);g.active=!g.active;save();renderGoals()});$$(".delete-goal").forEach(b=>b.onclick=()=>{if(confirm("Excluir este objetivo e seu histórico?")){state.goals=state.goals.filter(g=>g.id!==b.dataset.id);Object.keys(state.completions).filter(k=>k.startsWith(b.dataset.id+"|")).forEach(k=>delete state.completions[k]);save();renderGoals()}});
}
function dateRange(days){const result=[],end=new Date();for(let i=days-1;i>=0;i--){const d=new Date(end);d.setDate(end.getDate()-i);result.push(d)}return result}
function renderColumns(el,values,labels){const max=Math.max(.01,...values);$(el).innerHTML=values.map((v,i)=>`<div class="chart-col" style="height:${Math.max(1,v/max*100)}%" data-label="${labels[i]}: ${Math.round(v*100)}%"></div>`).join("")}
function renderDashboard(){
 const year=2026,days=dateRange(30),values=days.map(dayProgress),allDays=Array.from({length:365},(_,i)=>{const d=new Date(year,0,1);d.setDate(i+1);return d}),annual=allDays.reduce((s,d)=>s+dayProgress(d),0)/365;
 const perfect=allDays.filter(d=>dayProgress(d)===1&&tasksForDate(d).length).length,active=state.goals.filter(g=>g.active).length;
 $("#kpiGrid").innerHTML=[["Conclusão anual",`${Math.round(annual*100)}%`],["Objetivos ativos",active],["Dias 100%",perfect],["Categorias",new Set(state.goals.filter(g=>g.active).map(g=>g.category)).size]].map(([a,b])=>`<article class="kpi"><span>${a}</span><strong>${b}</strong></article>`).join("");
 renderColumns("#dailyChart",values,days.map(d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})));
 const catData={};state.goals.filter(g=>g.active).forEach(g=>{const dates=allDays.filter(d=>isScheduled(g,d)),p=dates.length?dates.filter(d=>isDone(g.id,d)).length/dates.length:0;(catData[g.category]??=[]).push(p)});
 $("#categoryChart").innerHTML=Object.entries(catData).map(([cat,vals])=>{const v=vals.reduce((a,b)=>a+b,0)/vals.length;return `<div class="bar-row"><span>${cat}</span><div class="bar-track"><div class="bar-fill" style="width:${v*100}%"></div></div><strong>${Math.round(v*100)}%</strong></div>`}).join("");
 const monthly=Array.from({length:12},(_,m)=>{const n=new Date(year,m+1,0).getDate();return Array.from({length:n},(_,i)=>dayProgress(new Date(year,m,i+1))).reduce((a,b)=>a+b,0)/n});renderColumns("#monthlyChart",monthly,["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]);
}
function renderFinance(){
 const income=state.transactions.filter(t=>t.type==="Receita").reduce((s,t)=>s+t.value,0),expense=state.transactions.filter(t=>t.type==="Despesa").reduce((s,t)=>s+t.value,0);
 $("#financeKpis").innerHTML=[["Receitas",money(income)],["Despesas",money(expense)],["Saldo",money(income-expense)]].map(([a,b])=>`<article class="kpi"><span>${a}</span><strong>${b}</strong></article>`).join("");
 const cats={};state.transactions.filter(t=>t.type==="Despesa").forEach(t=>cats[t.category]=(cats[t.category]||0)+t.value);const max=Math.max(1,...Object.values(cats));$("#expenseCategories").innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,v])=>`<div class="bar-row"><span>${cat}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${money(v)}</strong></div>`).join("")||"<p>Sem despesas registradas.</p>";
 const monthly=Array.from({length:12},(_,m)=>state.transactions.filter(t=>parseDate(t.date).getMonth()===m).reduce((s,t)=>s+(t.type==="Receita"?t.value:-t.value),0));const abs=Math.max(1,...monthly.map(Math.abs));$("#financeChart").innerHTML=monthly.map((v,i)=>`<div class="chart-col" style="height:${Math.max(1,Math.abs(v)/abs*100)}%;background:${v<0?"#df6b6b":"#49a97e"}" data-label="${i+1}/2026: ${money(v)}"></div>`).join("");
 const sorted=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date));$("#transactionCount").textContent=`${sorted.length} registros`;$("#transactionsBody").innerHTML=sorted.map(t=>`<tr><td>${fmtDate(t.date)}</td><td>${t.type}</td><td>${t.category}</td><td>${t.description}</td><td class="amount ${t.type==="Despesa"?"expense":"income"}">${t.type==="Despesa"?"−":"+"}${money(t.value)}</td><td><button class="text-btn delete delete-transaction" data-id="${t.id}">Excluir</button></td></tr>`).join("")||`<tr><td colspan="6">Nenhum lançamento registrado.</td></tr>`;$$(".delete-transaction").forEach(b=>b.onclick=()=>{state.transactions=state.transactions.filter(t=>t.id!==b.dataset.id);save();renderFinance()});
}
function openGoal(id){
 const form=$("#goalForm"),g=id?state.goals.find(x=>x.id===id):null;form.reset();form.id.value=g?.id||"";form.name.value=g?.name||"";form.category.value=g?.category||"Espiritualidade";form.priority.value=g?.priority||"Alta";form.frequency.value=g?.frequency||"daily";form.weeklyTarget.value=g?.weeklyTarget||1;form.start.value=g?.start||"2026-01-01";form.end.value=g?.end||"2026-12-31";form.duration.value=g?.duration||"";form.notes.value=g?.notes||"";form.active.checked=g?.active??true;$$('#weekdayChecks input').forEach(i=>i.checked=(g?.weekdays||[1,2,3,4,5]).includes(Number(i.value)));$("#goalDialogTitle").textContent=g?"Editar objetivo":"Novo objetivo";$("#goalDialog").showModal();
}
function init(){
 const now=new Date();$("#todayLabel").textContent=now.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});$("#todayPicker").value=iso(now);
 $("#monthSelect").innerHTML=Array.from({length:12},(_,i)=>`<option value="${i}" ${i===now.getMonth()?"selected":""}>${new Date(2026,i).toLocaleDateString("pt-BR",{month:"long"})}</option>`).join("");$("#yearSelect").innerHTML=`<option>2026</option>`;
 $('#goalForm select[name="category"]').innerHTML=categories.map(c=>`<option>${c}</option>`).join("");$('#transactionForm select[name="category"]').innerHTML=financeCategories.map(c=>`<option>${c}</option>`).join("");$("#weekdayChecks").innerHTML=week.map(d=>`<label><input type="checkbox" value="${d.id}">${d.label}</label>`).join("");
 const navigate=e=>{const button=e.target.closest("[data-view]");if(!button)return;e.preventDefault();setView(button.dataset.view)};
 $("#nav").addEventListener("click",navigate);
 $(".mobile-nav").addEventListener("click",navigate);
 $("#menuBtn").onclick=()=>$(".sidebar").classList.toggle("open");$("#todayPicker").onchange=renderToday;$("#monthSelect").onchange=renderCalendar;$("#yearSelect").onchange=renderCalendar;$("#quickGoal").onclick=$("#addGoal").onclick=()=>openGoal();$("#quickExpense").onclick=$("#addTransaction").onclick=()=>{const f=$("#transactionForm");f.reset();f.date.value=iso(new Date());$("#transactionDialog").showModal()};
 $("#goalForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id=f.get("id"),goal={id:id||makeId(),name:f.get("name"),category:f.get("category"),priority:f.get("priority"),frequency:f.get("frequency"),weeklyTarget:Number(f.get("weeklyTarget")),start:f.get("start"),end:f.get("end"),duration:f.get("duration"),notes:f.get("notes"),active:f.get("active")==="on",weekdays:$$('#weekdayChecks input:checked').map(i=>Number(i.value)),order:id?state.goals.find(g=>g.id===id).order:state.goals.length};id?state.goals[state.goals.findIndex(g=>g.id===id)]=goal:state.goals.push(goal);save();$("#goalDialog").close();toast("Objetivo salvo");renderGoals()};
 $("#transactionForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.transactions.push({id:makeId(),date:f.get("date"),type:f.get("type"),category:f.get("category"),description:f.get("description"),payment:f.get("payment"),value:Number(f.get("value"))});save();$("#transactionDialog").close();toast("Lançamento salvo");renderFinance()};
 $("#exportData").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`minha-jornada-backup-${iso(new Date())}.json`;a.click();URL.revokeObjectURL(a.href)};
 $("#importData").onchange=async e=>{try{state=JSON.parse(await e.target.files[0].text());save();toast("Backup restaurado");setView("hoje")}catch{alert("Arquivo de backup inválido.")}};
 $("#resetData").onclick=()=>{if(confirm("Apagar todos os dados e restaurar os objetivos iniciais?")){state=defaultState();save();location.reload()}};
 let installPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installHint").textContent="O aplicativo está pronto para ser instalado."});$("#installApp").onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else{alert("No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android: abra o menu do navegador e escolha “Instalar aplicativo”.")}};
 if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{});
 renderToday();
}
init();
