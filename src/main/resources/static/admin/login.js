async function csrf(){
  const r=await fetch('/api/auth/csrf',{credentials:'same-origin'}); if(!r.ok) throw new Error('Security token unavailable'); return r.json();
}
async function init(){ try{await csrf();}catch(e){document.getElementById('error').textContent=e.message;} }
init();
document.getElementById('login-form').addEventListener('submit',async e=>{
  e.preventDefault(); const btn=document.getElementById('login-btn'), err=document.getElementById('error'); btn.disabled=true; err.textContent='';
  try{
    const token=(await csrf()).token;
    const r=await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-XSRF-TOKEN':token},body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});
    const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.message||'Login failed');
    location.href='/admin/dashboard.html';
  }catch(x){err.textContent=x.message;} finally{btn.disabled=false;}
});
