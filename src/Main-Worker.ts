import AiWorker = require('worker-loader!./Ai-Worker');
import {WorkerCommand, MESSAGE} from "io/types/Worker-Types";
import {Renderable} from "io/types/Renderable-Types";
import {getWasm} from "./Wasm-Loader";
const psBridge = require("purescript/index"); 

const aiWorker = (AiWorker as any)();

const UPDATE_DELAY_MS = 0;

interface Streams {
    sendUpdate: (now:number) => void;
    sendRender: () => void;
    sendController1: (ctlr:string) => void;
    sendController2: (aiCtrl:string) => void;
}


//Global state (also helps deal with race-conditions when loading)
let wasmLib;
let workersPending = 2;
let streams:Streams;

/*
 Ticks are driven by requestAnimationFrame, even though we're in a worker
 
 performance.now() would be nice for physics updates, but since it's rounded for security issues it makes things janky
 
 If/when that is fixed in browsers, updates can easily be independant of vsync
 
 Also, local requestAnimationFrame is an offscreenCanvas feature, so we need to use messages and let the main thread be the source of time, for wider availability
 */

const onTick = now => {
    if(streams == null) {
        //First tick
        const _streams = psBridge.main (wasmLib) (now) (onRender) (onCollision) ();

        streams = {
            sendUpdate: (now:number) => _streams.sendUpdate (now) (),
            sendRender: () => _streams.sendRender (now) (),
            sendController1: (ctlr:string) => _streams.sendController1(ctlr) (),
            sendController2: (ctlr:string) => _streams.sendController2(ctlr) (),
        }
    }

    /*
     * update fires twice before rendering to hide collision displacement changes
     * see comments in Game.purs for more details
     */
    streams.sendUpdate (now);
    streams.sendUpdate (now);
    streams.sendRender ();
}

const onRender = (renderables:Array<Renderable>) => () => {
    // console.log(renderables[0].x, renderables[0].y);

    (self as any).postMessage({
        cmd: WorkerCommand.RENDER,
        renderables
    });


    aiWorker.postMessage({
        cmd: WorkerCommand.AI_STATE,
        renderables
    });
}

const onCollision = (collisionName:string) => () => {
    //console.log("COLLISION: " + collisionName);
}

//We don't know whether wasm-loading or worker-setup happens first
//To avoid the race condition, wait till both are ready before starting the game loop
const startIfReady = () => {
    if(wasmLib != null && !workersPending) {
        (self as any).postMessage({
            cmd: WorkerCommand.WORKER_READY,
            constants: psBridge.constants
        })
    }
}

getWasm().then(_wasmLib => {
    wasmLib = _wasmLib;
    startIfReady();
});


aiWorker.addEventListener(MESSAGE, (evt:MessageEvent) => {
    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_READY: {
            workersPending--;
            startIfReady();
            break;
        }
        case WorkerCommand.AI_CONTROLLER:
            streams.sendController2(evt.data.controller);
            break;
    }
});

aiWorker.postMessage({
    cmd: WorkerCommand.WORKER_START
});

(self as any).addEventListener(MESSAGE, (evt:MessageEvent) => {

    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_START:
            workersPending--;
            startIfReady();
            break;
        case WorkerCommand.TICK:
            onTick(evt.data.now);
            break;
        case WorkerCommand.CONTROLLER1:
            streams.sendController1(evt.data.controller);
            break;

        case WorkerCommand.CONTROLLER2:
            streams.sendController2(evt.data.controller);
            break;
    }
});


