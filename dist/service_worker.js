!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=83)}({83:function(e,t){let n=new Map;self.addEventListener("notificationclick",e=>{if(e.notification.close(),"restart-timer"===e.action){const t=e.notification.tag,r=n.get(t);if(void 0===r)return;r.postMessage({restart:!0})}},!1),self.addEventListener("message",e=>{if(e.data&&"INIT_PORT"===e.data.type){let t=e.data.fleetId;console.log("Register port for "+t),n.set(t,e.ports[0])}}),self.addEventListener("install",e=>{console.log("service_worker installing..."),e.waitUtil(Promise.resolve())})}});
//# sourceMappingURL=service_worker.js.map