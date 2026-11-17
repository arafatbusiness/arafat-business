/* Service worker ARAFAT BUSINESS : fonctionne hors ligne. Changez VERSION pour forcer une mise à jour. */
const VERSION='arafat-v1',CACHE=VERSION;
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  /* Firebase / Google et tout site externe : laissés au réseau (la synchro gère le hors-ligne elle-même) */
  if(u.origin!==location.origin)return;
  /* Pages : réseau d'abord (toujours la dernière version), cache si hors ligne */
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(ch=>ch.put('./index.html',c));return res}).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return;
  }
  /* Fichiers statiques : cache d'abord, mise à jour en arrière-plan */
  e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(ch=>ch.put(r,c))}return res}).catch(()=>m);return m||n}));
});
