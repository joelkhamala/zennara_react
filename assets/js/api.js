const ZENNARA_API = window.ZENNARA_API || "/api";
const zennaraToken = () => localStorage.getItem("zennara-token");
async function zennaraFetch(path, options={}) {
  const headers = {"Accept":"application/json", ...(options.body?{"Content-Type":"application/json"}:{}), ...(zennaraToken()?{"Authorization":`Bearer ${zennaraToken()}`}:{})};
  const res = await fetch(`${ZENNARA_API}${path}`, {...options, headers:{...headers,...(options.headers||{})}});
  if(!res.ok) throw new Error((await res.json().catch(()=>({}))).message || `API error ${res.status}`);
  return res.status===204?null:res.json();
}
window.ZennaraAPI={fetch:zennaraFetch, login:async(email,password)=>{const x=await zennaraFetch("/auth/login",{method:"POST",body:JSON.stringify({email,password})});localStorage.setItem("zennara-token",x.token);return x}, logout:async()=>{try{await zennaraFetch("/auth/logout",{method:"POST"})}finally{localStorage.removeItem("zennara-token")}}, properties:(params="")=>zennaraFetch(`/properties${params?`?${params}`:""}`), property:id=>zennaraFetch(`/properties/${id}`), favorite:id=>zennaraFetch(`/properties/${id}/favorite`,{method:"POST"}), projects:()=>zennaraFetch("/projects"), lead:data=>zennaraFetch("/leads",{method:"POST",body:JSON.stringify(data)}), viewing:data=>zennaraFetch("/viewings",{method:"POST",body:JSON.stringify(data)})};
