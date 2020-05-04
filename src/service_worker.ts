export default null;
declare var self: ServiceWorkerGlobalScope;

let fleetPorts = new Map();

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  if (event.action === "restart-timer") {
    // Restart the timer
    const fleetId = event.notification.tag;
    const port = fleetPorts.get(fleetId);
    if (port === undefined)
      return;
    port.postMessage({
      restart: true
    });
  }
}, false);

self.addEventListener("message", event => {
  if (event.data && event.data.type === "INIT_PORT") {
    let fleetId: string = event.data.fleetId;
    console.log(`Register port for ${fleetId}`);
    fleetPorts.set(fleetId, event.ports[0]);
  }
});

self.addEventListener("install", async () => {
  console.log("service_worker installing...");

  await self.skipWaiting();

  console.log("Finished service_worker installing");
});