import {WorkerCommand, MESSAGE} from "io/types/Worker-Types";
import {Renderable} from "io/types/Renderable-Types";
import {ControllerValue} from "io/types/Controller-Types";
import {makeUpdater} from "./ai/Ai";
import {getWasm} from "./Wasm-Loader";


let wasmLib;
let workersPending = 1;
let controller;
let onUpdate;

const sendController = (_controller:ControllerValue) => {
    if(controller !== _controller) {
        controller = _controller;

        (self as any).postMessage({
            cmd: WorkerCommand.AI_CONTROLLER,
            controller 
        });
    }
}

//We don't know whether wasm-loading or worker-setup happens first
const startIfReady = () => {
    if(wasmLib != null && !workersPending) {
        onUpdate = makeUpdater (wasmLib) (sendController);

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
        case WorkerCommand.AI_UPDATE:
            onUpdate(evt.data);
            break;
    }
});
