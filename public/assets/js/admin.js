const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const KEY="zennara-admin";let db=JSON.parse(localStorage.getItem(KEY)||"null")||{
properties:[
{id:1,name:"The Olive House",location:"Karen · Nairobi",price:"KSh 145M",status:"Live",advisor:"Daniel Mwangi"},
{id:2,name:"Skyline Penthouse",location:"Westlands · Nairobi",price:"KSh 82M",status:"Live",advisor:"Amara Okafor"},
{id:3,name:"Azure Coast Villa",location:"Nyali · Mombasa",price:"KSh 96M",status:"Draft",advisor:"David Karanja"},
{id:4,name:"Runda Garden Residence",location:"Runda · Nairobi",price:"KSh 110M",status:"Live",advisor:"Daniel Mwangi"}],
agents:[
{name:"Daniel Mwangi",role:"Senior Property Advisor · Nairobi",img:"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80"},
{name:"Amara Okafor",role:"Investment Advisor · East Africa",img:"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80"},
{name:"David Karanja",role:"Development Advisory · Nairobi",img:"https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80"}],
leads:[
{name:"Amina Shah",subject:"Azure Bay investment",stage:"New",value:"KSh 90M"},
{name:"James Wekesa",subject:"Karen family home",stage:"Contacted",value:"KSh 120M"},
{name:"Nadia Otieno",subject:"Nairobi penthouse",stage:"Viewing",value:"KSh 82M"},
{name:"Peter Kamau",subject:"Development partnership",stage:"Qualified",value:"KSh 250M"}],
viewings:[{client:"Nadia Otieno",property:"Skyline Penthouse",date:"2026-08-14",time:"10:30",status:"Confirmed"},{client:"James Wekesa",property:"The Olive House",date:"2026-08-16",time:"14:00",status:"Pending"}],
projects:[
{name:"ZENNARA Ridges",location:"Karen · Nairobi",status:"Launching",price:"From KSh 78M"},
{name:"Azure Bay",location:"Nyali · Mombasa",status:"Pre-launch",price:"From KSh 46M"},
{name:"The Green Quarter",location:"Kololo · Kampala",status:"Selling",price:"From KSh 32M"}]
};function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function render(){ $("#kListings").textContent=db.properties.filter(p=>p.status==="Live").length;$("#kLeads").textContent=db.leads.length;$("#kViewings").textContent=db.viewings.length;$("#kProjects").textContent=db.projects.length;
let stages=["New","Contacted","Qualified","Viewing"],counts=stages.map(s=>db.leads.filter(l=>l.stage===s).length);$("#leadChart").innerHTML=counts.map((n,i)=>`<div class="bar" style="height:${Math.max(8,n*45)}px"><label>${stages[i]} ${n}</label></div>`).join("");$("#activity").innerHTML=db.leads.slice(-5).reverse().map(l=>`<div class="activity"><strong>${l.name}</strong> · ${l.subject}<br><span>${l.stage} · ${l.value}</span></div>`).join("");
renderProperties();renderAgents();renderLeads();renderViewings();renderProjects()}
function renderProperties(){let q=($("#propertySearch")?.value||"").toLowerCase(),s=$("#propertyStatus")?.value||"all";$("#propertyRows").innerHTML=db.properties.filter(p=>(s==="all"||p.status===s)&&(`${p.name} ${p.location}`.toLowerCase().includes(q))).map(p=>`<tr><td><strong>${p.name}</strong></td><td>${p.location}</td><td>${p.price}</td><td><span class="pill ${p.status.toLowerCase()}">${p.status}</span></td><td>${p.advisor}</td><td class="row-actions"><button data-edit="${p.id}">Edit</button> <button data-delete="${p.id}">Delete</button></td></tr>`).join("")}
function renderAgents(){$("#agentGrid").innerHTML=db.agents.map(a=>`<article class="agent-card"><img src="${a.img}" alt="${a.name}"><h3>${a.name}</h3><p>${a.role}</p></article>`).join("")}
function renderLeads(){let stages=["New","Contacted","Qualified","Viewing"];$("#leadColumns").innerHTML=stages.map(s=>`<div class="lead-col"><h3>${s}</h3>${db.leads.filter(l=>l.stage===s).map(l=>`<div class="lead-card"><strong>${l.name}</strong><span>${l.subject}</span><br><span>${l.value}</span></div>`).join("")||'<div class="empty">No leads</div>'}</div>`).join("")}
function renderViewings(){$("#viewingRows").innerHTML=db.viewings.map(v=>`<tr><td>${v.client}</td><td><strong>${v.property}</strong></td><td>${v.date}</td><td>${v.time}</td><td><span class="pill">${v.status}</span></td></tr>`).join("")}
function renderProjects(){$("#projectAdminGrid").innerHTML=db.projects.map(p=>`<article class="project-admin"><p>${p.status}</p><h3>${p.name}</h3><p>${p.location} · ${p.price}</p></article>`).join("")}
$$(".side").forEach(b=>b.onclick=()=>{$$(".side").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".admin-panel").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.panel).classList.add("active")});
$("#propertySearch").oninput=renderProperties;$("#propertyStatus").onchange=renderProperties;
function modal(html){$("#modalBody").innerHTML=html;$("#modal").classList.add("open")}
$("#close").onclick=()=>$("#modal").classList.remove("open");
$("#addProperty").onclick=$("#addPropertyTop").onclick=()=>modal(`<p class="eyebrow">Inventory</p><h2>Add property</h2><form id="propertyForm"><input required id="pn" placeholder="Property name"><input required id="pl" placeholder="Location"><input required id="pp" placeholder="Price e.g. KSh 95M"><select id="ps"><option>Live</option><option>Draft</option></select><input id="pa" placeholder="Advisor"><button class="gold-btn">Create property →</button></form>`);
$("#addAgent").onclick=()=>modal(`<p class="eyebrow">People</p><h2>Add advisor</h2><form id="agentForm"><input required id="an" placeholder="Full name"><input required id="ar" placeholder="Role"><input required id="ai" placeholder="Photo URL"><button class="gold-btn">Create advisor →</button></form>`);
$("#addLead").onclick=()=>modal(`<p class="eyebrow">CRM</p><h2>New lead</h2><form id="leadForm"><input required id="ln" placeholder="Client name"><input required id="ls" placeholder="Enquiry"><input required id="lv" placeholder="Budget/value"><select id="lg"><option>New</option><option>Contacted</option><option>Qualified</option><option>Viewing</option></select><button class="gold-btn">Add lead →</button></form>`);
$("#addProject").onclick=()=>modal(`<p class="eyebrow">Development</p><h2>Add project</h2><form id="projectForm"><input required id="prn" placeholder="Project name"><input required id="prl" placeholder="Location"><input required id="prp" placeholder="Price"><input required id="prs" placeholder="Status"><button class="gold-btn">Create project →</button></form>`);
document.addEventListener("submit",e=>{e.preventDefault();if(e.target.id==="propertyForm"){db.properties.push({id:Date.now(),name:$("#pn").value,location:$("#pl").value,price:$("#pp").value,status:$("#ps").value,advisor:$("#pa").value||"Unassigned"})}if(e.target.id==="agentForm"){db.agents.push({name:$("#an").value,role:$("#ar").value,img:$("#ai").value})}if(e.target.id==="leadForm"){db.leads.push({name:$("#ln").value,subject:$("#ls").value,value:$("#lv").value,stage:$("#lg").value})}if(e.target.id==="projectForm"){db.projects.push({name:$("#prn").value,location:$("#prl").value,price:$("#prp").value,status:$("#prs").value})}save();$("#modal").classList.remove("open");render()});
document.addEventListener("click",e=>{let del=e.target.dataset.delete;if(del){db.properties=db.properties.filter(p=>p.id!==+del);save();render()}});
$("#logout").onclick=()=>location.href="index.html";render();