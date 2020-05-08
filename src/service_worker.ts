export default null;
declare var self: ServiceWorkerGlobalScope;

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  if (event.action === "restart-timer") {
    // Restart the timer
    const fleetId = event.notification.tag;
    const channel = new BroadcastChannel("kancolle_mission_timer");
    channel.postMessage({
      restart: true,
      fleetId
    });
  }
}, false);

self.addEventListener("activate", () => {
  self.clients.claim();
  console.log("Claimed clients");
});

self.addEventListener("install", async () => {
  console.log("service_worker installing...");

  await self.skipWaiting();

  console.log("Finished service_worker installing");
});