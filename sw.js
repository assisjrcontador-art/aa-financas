const CACHE='aa-financas-v8-20260920';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    ))
  ]));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;

  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(r=>{
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy));
          return r;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached=>
      cached || fetch(e.request).then(r=>{
        if(r && r.ok){
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return r;
      })
    )
  );
});
