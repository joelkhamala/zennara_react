/**
 * ZENNARA Integration Layer
 * Set window.ZENNARA_CONFIG.apiBase before this file is loaded to connect to Laravel.
 * Falls back to demo/localStorage behavior when the API is unavailable.
 */
(function(){
  const cfg = window.ZENNARA_CONFIG || {};
  const API = cfg.apiBase || "/api";
  const tokenKey = "zennara-token";

  async function request(path, opts={}){
    const token=localStorage.getItem(tokenKey);
    const headers={"Accept":"application/json",...(opts.body?{"Content-Type":"application/json"}:{}),...(token?{"Authorization":"Bearer "+token}:{}),...(opts.headers||{})};
    const r=await fetch(API+path,{...opts,headers});
    const data=await r.json().catch(()=>null);
    if(!r.ok) throw new Error(data?.message || `Request failed (${r.status})`);
    return data;
  }

  async function login(email,password){
    const data=await request("/auth/login",{method:"POST",body:JSON.stringify({email,password})});
    localStorage.setItem(tokenKey,data.token);
    localStorage.setItem("zennara-user",JSON.stringify(data.user));
    return data;
  }

  async function register(payload){
    const data=await request("/auth/register",{method:"POST",body:JSON.stringify(payload)});
    localStorage.setItem(tokenKey,data.token);
    localStorage.setItem("zennara-user",JSON.stringify(data.user));
    return data;
  }

  async function logout(){
    try{await request("/auth/logout",{method:"POST"});}catch(e){}
    localStorage.removeItem(tokenKey);
    localStorage.removeItem("zennara-user");
  }

  async function properties(params={}){
    const q=new URLSearchParams(params).toString();
    return request("/properties"+(q?"?"+q:""));
  }

  async function property(id){return request("/properties/"+id);}
  async function projects(){return request("/projects");}
  async function favorite(id){return request(`/properties/${id}/favorite`,{method:"POST"});}
  async function lead(payload){return request("/leads",{method:"POST",body:JSON.stringify(payload)});}
  async function viewing(payload){return request("/viewings",{method:"POST",body:JSON.stringify(payload)});}
  async function searches(){return request("/searches");}
  async function saveSearch(payload){return request("/searches",{method:"POST",body:JSON.stringify(payload)});}

  window.ZENNARA={
    apiBase:API, request, login, register, logout, properties, property,
    projects, favorite, lead, viewing, searches, saveSearch,
    authenticated:()=>!!localStorage.getItem(tokenKey)
  };
})();