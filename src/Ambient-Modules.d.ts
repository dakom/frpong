declare module '*.glsl';
declare module '*.purs';
declare const BUILD_VERSION:string;
declare const process:any;

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

