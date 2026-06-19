/**
 * Service Worker for Push Notifications
 * St. Patrick's of Armonk
 */

// Listen for push events from the server
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "St. Patrick's", body: event.data.text() };
  }

  const options = {
    body: payload.body || "",
    icon: "/manus-storage/icon-192_64ea7e0b.png",
    badge: "/manus-storage/favicon-32_b79de897.png",
    data: { url: payload.url || "/" },
    vibrate: [100, 50, 100],
    tag: "stpats-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "St. Patrick's", options)
  );
});

// Handle notification click — open the relevant page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If there's already an open tab, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Activate immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
