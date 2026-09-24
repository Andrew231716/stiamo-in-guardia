/* Stiamo in guardia — service worker */
const CACHE = "sig-static-v3";
const ASSETS = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          const copy = res.clone();
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Stiamo in guardia",
    body: "Hai un promemoria discreto.",
    url: "/",
    tag: "sig-push",
  };
  try {
    if (event.data) {
      const data = event.data.json();
      payload = {
        title: typeof data.title === "string" ? data.title : payload.title,
        body: typeof data.body === "string" ? data.body : payload.body,
        url: typeof data.url === "string" ? data.url : payload.url,
        tag: typeof data.tag === "string" ? data.tag : payload.tag,
      };
    }
  } catch {
    try {
      const text = event.data && event.data.text();
      if (text) payload.body = text;
    } catch {
      /* keep default */
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: payload.tag,
      renotify: true,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client && typeof client.navigate === "function") {
            return client.navigate(target).then((c) => (c && "focus" in c ? c.focus() : client.focus()));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const sub = await self.registration.pushManager.subscribe(event.newOptions || { userVisibleOnly: true });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: {
              p256dh: arrayBufferToBase64Url(sub.getKey("p256dh")),
              auth: arrayBufferToBase64Url(sub.getKey("auth")),
            },
            timezone: "Europe/Rome",
            settings: {
              dailyActivity: { enabled: true, time: "08:00" },
              checkIn: { enabled: true, time: "09:00" },
              prayer: { enabled: true, time: "21:00" },
            },
          }),
        });
      } catch {
        /* ignore */
      }
    })(),
  );
});

function arrayBufferToBase64Url(buf) {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SIG_REMINDERS") {
    // Orari gestiti server-side via Web Push; ack solo per compatibilità.
  }
});
