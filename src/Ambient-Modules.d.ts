declare module '*.glsl';
declare module '*.purs';
declare module '*.wasm';
declare const BUILD_VERSION:string;
declare const process:any;

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

