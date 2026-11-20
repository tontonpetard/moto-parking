function render(){
const ref=me||lastFetch;
spots.forEach(s=>s.d=hav(ref,s.p));
spots.sort((a,b)=>a.d-b.d);
layer.clearLayers();markers={};
spots.forEach(s=>{
const cls='pin'+(s.fee==='no'?' free':'')+(+s.cap>=20?' big':'');
const m=L.marker(s.p,{icon:L.divIcon({className:'',html:`<div class="${cls}"></div>`,iconSize:[22,22],iconAnchor:[11,22],popupAnchor:[0,-20]})})
.bindPopup(`<b>${esc(s.name)}</b><br>${esc(detail(s))}<br><a href="${gmaps(s.p)}" target="_blank" rel="noopener">Directions in Google Maps</a>`);
m.on('click',()=>select(s.id,false));
m.addTo(layer);markers[s.id]=m;
});
$('#list').innerHTML=spots.length?spots.map(s=>`
<div class="item" id="i-${s.id}">
<div class="dist">${fmt(s.d)}</div>
<div class="info" data-id="${s.id}">
<div class="name">${esc(s.name)}</div>
<div class="meta">${esc(detail(s))}</div>
</div>
<a class="go" href="${gmaps(s.p)}" target="_blank" rel="noopener">Go</a>
</div>`).join(''):`<div class="empty">No motorcycle parking mapped within ${fmt(+$('#radius').value)}. Try a bigger radius.</div>`;
say(`${spots.length} spot${spots.length===1?'':'s'} found · green = free · tap a row to see it`);
}
function detail(s){
const a=[];
if(s.cap)a.push(s.cap+' bikes');
if(s.fee==='no')a.push('free');else if(s.fee==='yes')a.push('paid');
if(s.t.charge)a.push(s.t.charge);
if(s.hours)a.push(s.hours);
if(s.t.maxheight||s.t['motorcycle:cc'])a.push('max '+(s.t['motorcycle:cc']||s.t.maxheight)+(s.t['motorcycle:cc']?'cc':''));
if(s.mixed)a.push('shared with bicycles/cars');
if(s.op)a.push(s.op);
return a.join(' · ')||'No details mapped';
}
