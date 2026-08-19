/**
 * ZENNARA Sprint 9 — Production UI Adapter
 * API-first with a graceful demo fallback.
 */
(function(){
  const API=(window.ZENNARA_CONFIG&&window.ZENNARA_CONFIG.apiBase)||"/api";
  const token=()=>localStorage.getItem("zennara-token");
  async function api(path,opts={}){
    const h={"Accept":"application/json",...(opts.body?{"Content-Type":"application/json"}:{}),...(token()?{"Authorization":"Bearer "+token()}:{}),...(opts.headers||{})};
    const r=await fetch(API+path,{...opts,headers:h});
    const d=await r.json().catch(()=>null);
    if(!r.ok) throw new Error(d?.message||`API ${r.status}`);
    return d;
  }
  function qs(obj){const q=new URLSearchParams();Object.entries(obj||{}).forEach(([k,v])=>{if(v!==""&&v!==null&&v!==undefined)q.set(k,v)});return q.toString()}
  async function list(params={}){
    return api("/properties?"+qs(params));
  }
  window.ZENNARAListings={list,detail:id=>api("/properties/"+id),favorite:id=>api(`/properties/${id}/favorite`,{method:"POST"})};
  window.ZENNARA_CONFIG=window.ZENNARA_CONFIG||{}; window.ZENNARA_CONFIG.apiBase=API;
})();