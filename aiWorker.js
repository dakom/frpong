!function(e){self.webpackChunk=function(n,r){for(var o in r)e[o]=r[o];for(;n.length;)t[n.pop()]=1};var n={},t={0:1},r={};var o={1:function(){return{}}};function a(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,a),r.l=!0,r.exports}a.e=function(e){var n=[];return n.push(Promise.resolve().then(function(){t[e]||importScripts(e+".aiWorker.js")})),({1:[1]}[e]||[]).forEach(function(e){var t=r[e];if(t)n.push(t);else{var i,u=o[e](),l=fetch(a.p+""+{1:"825eec95a67698296cde"}[e]+".module.wasm");if(u instanceof Promise&&"function"==typeof WebAssembly.compileStreaming)i=Promise.all([WebAssembly.compileStreaming(l),u]).then(function(e){return WebAssembly.instantiate(e[0],e[1])});else if("function"==typeof WebAssembly.instantiateStreaming)i=WebAssembly.instantiateStreaming(l,u);else{i=l.then(function(e){return e.arrayBuffer()}).then(function(e){return WebAssembly.instantiate(e,u)})}n.push(r[e]=i.then(function(n){return a.w[e]=(n.instance||n).exports}))}}),Promise.all(n)},a.m=e,a.c=n,a.d=function(e,n,t){a.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,n){if(1&n&&(e=a(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(a.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)a.d(t,r,function(n){return e[n]}.bind(null,r));return t},a.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(n,"a",n),n},a.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},a.p="",a.w={},a(a.s=0)}([function(e,n,t){"use strict";t.r(n);var r,o;!function(e){e[e.WORKER_START=0]="WORKER_START",e[e.WORKER_READY=1]="WORKER_READY",e[e.TICK=2]="TICK",e[e.RENDER=3]="RENDER",e[e.CONTROLLER1=4]="CONTROLLER1",e[e.CONTROLLER2=5]="CONTROLLER2",e[e.AI_UPDATE=6]="AI_UPDATE",e[e.AI_CONTROLLER=7]="AI_CONTROLLER",e[e.COLLISION=8]="COLLISION"}(r||(r={})),function(e){e.UP="up",e.DOWN="down",e.NEUTRAL="neutral",e.SERVE="serve"}(o||(o={}));var a,i,u,l=new Map;l.set(0,o.NEUTRAL),l.set(1,o.DOWN),l.set(2,o.UP);var c,s=function(e,n,t,r){return new(t||(t=Promise))(function(o,a){function i(e){try{l(r.next(e))}catch(e){a(e)}}function u(e){try{l(r.throw(e))}catch(e){a(e)}}function l(e){e.done?o(e.value):new t(function(n){n(e.value)}).then(i,u)}l((r=r.apply(e,n||[])).next())})},f=function(e,n){var t,r,o,a,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function u(a){return function(u){return function(a){if(t)throw new TypeError("Generator is already executing.");for(;i;)try{if(t=1,r&&(o=2&a[0]?r.return:a[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,a[1])).done)return o;switch(r=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,r=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(o=(o=i.trys).length>0&&o[o.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){i.label=a[1];break}if(6===a[0]&&i.label<o[1]){i.label=o[1],o=a;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(a);break}o[2]&&i.ops.pop(),i.trys.pop();continue}a=n.call(e,i)}catch(e){a=[6,e],r=0}finally{t=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}};function p(e){return e}var d,b,y,R,h=1,O=function(){var e;null==c||h||(i=c,u=b,e=function(e){d!==e&&(d=e,self.postMessage({cmd:r.AI_CONTROLLER,controller:d}))},y=function(n){if(a){var t=i.ai_controller(u.ballRadius,u.paddleHeight,n.ball_x,n.ball_y,n.paddle1_x,n.paddle1_y,n.paddle2_x,n.paddle2_y,a.ball_x,a.ball_y,a.paddle1_x,a.paddle1_y,a.paddle2_x,a.paddle2_y);-1!==t&&e(l.get(t))}a=n},R=function(e){var n=Math.floor(24*Math.random());i.ai_update_delay(n)},self.postMessage({cmd:r.WORKER_READY}))};(function(){return s(this,void 0,void 0,function(){var e;return f(this,function(n){switch(n.label){case 0:return e=p,[4,t.e(1).then(t.bind(null,2))];case 1:return[2,e.apply(void 0,[n.sent()])]}})})})().then(function(e){c=e,O()}),self.addEventListener("message",function(e){switch(e.data.cmd){case r.WORKER_START:b=e.data.constants,h--,O();break;case r.AI_UPDATE:y(e.data);break;case r.COLLISION:R(e.data.collisionName)}})}]);