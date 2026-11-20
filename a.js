const TOKYO=[35.681,139.767];
const ENDPOINTS=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter","https://maps.mail.ru/osm/tools/overpass/api/interpreter"];
const $=s=>document.querySelector(s);
const map=L.map('map',{zoomControl:false}).setView(TOKYO,15);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri · Data © OpenStreetMap'}).addTo(map);
const layer=L.layerGroup().addTo(map);
let me=null,meMarker=null,circle=null,spots=[],markers={},watchId=null,lastFetch=null,ctl=null;
const say=t=>$('#status').textContent=t;
const hav=(a,b)=>{const R=6371e3,r=Math.PI/180,dl=(b[0]-a[0])*r,dg=(b[1]-a[1])*r;
const x=Math.sin(dl/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
const fmt=m=>m<1000?Math.round(m/10)*10+' m':(m/1000).toFixed(1)+' km';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gmaps=p=>`https://www.google.com/maps/dir/?api=1&destination=${p[0]},${p[1]}&travelmode=driving`;
function query(c,r){
const a=`(around:${r},${c[0]},${c[1]})`;
return `[out:json][timeout:25];(
nwr["amenity"="motorcycle_parking"]${a};
nwr["amenity"="parking"]["motorcycle"~"yes|designated"]${a};
nwr["amenity"="parking"]["parking"~"motorcycle"]${a};
nwr["amenity"="bicycle_parking"]["motorcycle"~"yes|designated"]${a};
);out center tags;`;
}
async function fetchSpots(c){
const r=+$('#radius').value;
if(ctl)ctl.abort();ctl=new AbortController();
say('Searching '+fmt(r)+' around you…');
const body='data='+encodeURIComponent(query(c,r));
for(const url of ENDPOINTS){
try{
const res=await fetch(url,{method:'POST',body,headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:ctl.signal});
if(!res.ok)throw new Error(res.status);
const j=await res.json();
lastFetch=c;
spots=j.elements.map(e=>{
const p=e.center?[e.center.lat,e.center.lon]:[e.lat,e.lon],t=e.tags||{};
return{id:e.type+e.id,p,t,
name:t.name||t['name:en']||t['name:ja']||(t.amenity==='motorcycle_parking'?'Motorcycle parking':'Bike/moto parking'),
cap:t['capacity:motorcycle']||(t.amenity==='motorcycle_parking'?t.capacity:''),
fee:t.fee,hours:t.opening_hours,op:t.operator,maxcc:t['maxstay']||'',
mixed:t.amenity!=='motorcycle_parking'};
});
if(circle)circle.remove();
circle=L.circle(c,{radius:r,color:'#ffb000',weight:1,fillOpacity:.04,interactive:false}).addTo(map);
render();return;
}catch(e){if(e.name==='AbortError')return;}
}
say('Could not reach the parking data servers. Check your connection and tap Locate me.');
}
