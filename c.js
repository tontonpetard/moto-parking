function select(id,fly=true){
document.querySelectorAll('.item.sel').forEach(e=>e.classList.remove('sel'));
const el=document.getElementById('i-'+id);
if(el){el.classList.add('sel');if(!fly)el.scrollIntoView({block:'nearest',behavior:'smooth'});}
if(fly){const m=markers[id];map.setView(m.getLatLng(),Math.max(map.getZoom(),17));m.openPopup();}
}
$('#list').addEventListener('click',e=>{const i=e.target.closest('.info');if(i)select(i.dataset.id)});
function setMe(c,center){
me=c;
if(!meMarker)meMarker=L.marker(c,{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[18,18],iconAnchor:[9,9]}),zIndexOffset:1000}).addTo(map);
else meMarker.setLatLng(c);
if(center)map.setView(c,16);
if(!lastFetch||hav(lastFetch,c)>(+$('#radius').value)/3)fetchSpots(c);
else if(spots.length)render();
}
function locate(){
if(!navigator.geolocation){say('No GPS available — tap the map to search there.');fetchSpots(TOKYO);return;}
say('Getting your position…');
let first=true;
if(watchId!==null)navigator.geolocation.clearWatch(watchId);
watchId=navigator.geolocation.watchPosition(
p=>{setMe([p.coords.latitude,p.coords.longitude],first);first=false;},
err=>{say((err.code===1?'Location permission denied':'Could not get position')+' — showing Tokyo Station. Long-press the map to search anywhere.');
if(!lastFetch){map.setView(TOKYO,15);fetchSpots(TOKYO);}},
{enableHighAccuracy:true,maximumAge:10000,timeout:15000});
}
$('#locate').addEventListener('click',()=>{lastFetch=null;locate();});
$('#radius').addEventListener('change',()=>fetchSpots(me||lastFetch||TOKYO));
map.on('contextmenu',e=>{const c=[e.latlng.lat,e.latlng.lng];me=null;fetchSpots(c);});
locate();
