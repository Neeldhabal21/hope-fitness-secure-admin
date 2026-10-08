let page=0, query='';
const $=id=>document.getElementById(id);
async function api(url,opts={}){const r=await fetch(url,{credentials:'same-origin',...opts}); if(r.status===401||r.status===403){location.href='/admin/login.html';throw new Error('Session expired');} const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.message||'Request failed'); return d;}
async function load(){
  try{
    const [stats, data, me]=await Promise.all([api('/api/admin/stats'),api(`/api/admin/leads?page=${page}&size=10&q=${encodeURIComponent(query)}`),api('/api/auth/me')]);
    $('stat-total').textContent=stats.total; $('stat-new').textContent=stats.new; $('stat-contacted').textContent=stats.contacted; $('stat-converted').textContent=stats.converted; $('stat-today').textContent=stats.today; $('admin-name').textContent=me.username.toUpperCase();
    $('lead-body').innerHTML=data.content.length?data.content.map(l=>`<tr><td><b>${esc(l.name)}</b><small>${esc(l.email||'')}</small></td><td><a href="tel:${esc(l.phone)}">${esc(l.phone)}</a></td><td>${esc(l.interestedPlan||'—')}</td><td><select data-id="${l.id}" class="status"><option ${l.status==='NEW'?'selected':''}>NEW</option><option ${l.status==='CONTACTED'?'selected':''}>CONTACTED</option><option ${l.status==='CONVERTED'?'selected':''}>CONVERTED</option><option ${l.status==='CLOSED'?'selected':''}>CLOSED</option></select></td><td>${new Date(l.createdAt).toLocaleString('en-IN')}</td><td><button class="delete" data-id="${l.id}">DELETE</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty">No leads found.</td></tr>`;
    $('page-info').textContent=`Page ${data.page+1} of ${Math.max(data.totalPages,1)}`; $('prev').disabled=data.page===0; $('next').disabled=data.page+1>=data.totalPages;
    document.querySelectorAll('.status').forEach(x=>x.onchange=async()=>{await api('/api/admin/leads/'+x.dataset.id,{method:'PATCH',headers:{'Content-Type':'application/json','X-XSRF-TOKEN':getCookie('XSRF-TOKEN')},body:JSON.stringify({status:x.value})});load();});
    document.querySelectorAll('.delete').forEach(x=>x.onclick=async()=>{if(confirm('Delete this lead permanently?')){await api('/api/admin/leads/'+x.dataset.id,{method:'DELETE',headers:{'X-XSRF-TOKEN':getCookie('XSRF-TOKEN')}});load();}});
  }catch(e){$('toast').textContent=e.message;}
}
function getCookie(n){return document.cookie.split('; ').find(x=>x.startsWith(n+'='))?.split('=')[1]||''}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
$('search').addEventListener('input',()=>{query=$('search').value.trim();page=0;load()}); $('refresh').onclick=load; $('prev').onclick=()=>{if(page>0){page--;load()}}; $('next').onclick=()=>{page++;load()}; $('logout').onclick=async()=>{await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin',headers:{'X-XSRF-TOKEN':getCookie('XSRF-TOKEN')}});location.href='/admin/login.html'}; load();
