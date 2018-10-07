import {WorkerCommand, MESSAGE} from "io/types/Worker-Types";
import {ControllerValue} from "io/types/Controller-Types";
import {Renderable} from "io/types/Renderable-Types";
import {getWasm} from "./Wasm-Loader";

const controllerLookup = new Map<number, ControllerValue>();
controllerLookup.set(-1, ControllerValue.DOWN);
controllerLookup.set(0, ControllerValue.NEUTRAL);
controllerLookup.set(1, ControllerValue.UP);

let wasmLib;
let workersPending = 1;
let controller;

let lastTargetPos;

const sendController = (_controller:number) => {
    if(controller !== _controller) {
        controller = _controller;

        (self as any).postMessage({
            cmd: WorkerCommand.AI_CONTROLLER,
            controller: controllerLookup.get(controller)
        });
    }
}

const onState= ({paddleY, targetPos}) => {
    // console.log(renderables[0].x, renderables[0].y);
    //if(!lastTargetPos || lastTargetPos.y !== targetPos.y) {
    if(Math.abs(targetPos.y - paddleY) > 5) {
        sendController(wasmLib.ai_controller(targetPos.y, paddleY));
    }
    //    lastTargetPos = targetPos;
    //} 
}

//We don't know whether wasm-loading or worker-setup happens first
const startIfReady = () => {
    if(wasmLib != null && !workersPending) {
        (self as any).postMessage({
            cmd: WorkerCommand.WORKER_READY,
        })
    }
}

getWasm().then(_wasmLib => {
    wasmLib = _wasmLib;

    startIfReady();
});

(self as any).addEventListener(MESSAGE, (evt:MessageEvent) => {

    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_START:
            workersPending--;
            startIfReady();
            break;
        case WorkerCommand.AI_STATE:
            onState(evt.data);
            break;
    }
});
