const CACHE='beraaem-jawhara-v3';
const ASSETS=['./index.html','./manifest.json','./app_icon_192.png','./app_icon_512.png','./app_icon_32.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==location.origin)return;
  if(!e.request.url.includes('.mp3')){
    if(e.request.mode==='navigate'){
      e.respondWith(fetch(e.request).then(r=>{
        const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));
        return r;
      }).catch(()=>caches.match(e.request)));
      return;
    }
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(e.request);
      const net=fetch(e.request).then(r=>{if(r&&r.ok){const cl=r.clone();c.put(e.request,cl);}return r;}).catch(()=>hit);
      return hit||net;
    }));
  }
});
