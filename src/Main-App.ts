import MyWorker = require('worker-loader!./Main-Worker');
import {setupRenderer} from "io/renderer/Renderer-Setup";
import { getCompileFlags} from "io/utils/Utils";
import {WorkerCommand,  MESSAGE, Constants, Renderer, Renderable} from "io/types/Types";
import {startController} from "io/controller/Controller";
import {setupBackground} from "io/background/Background";
import {playCollision} from "io/audio/Audio";

const {buildMode, buildVersion, isProduction} = getCompileFlags();
console.log(`%c FRPong ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


let renderer:Renderer;
let renderables:Array<Renderable>;

const worker = new (MyWorker as any)();
setupBackground();

const startMain = () => {

    const tick = now => {
        //Checking if the state is fresh serves two purposes:
        //1. Avoids needless renders
        //2. Prevents buildup of worker tick messages
        if(renderables != null) {
            renderer.render(renderables);
            renderables = null;
            worker.postMessage({
                cmd: WorkerCommand.TICK,
                now
            });
        }
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);


    startController(controller => {
        worker.postMessage({
            cmd: WorkerCommand.CONTROLLER1,
            controller
        })
    });
}

worker.addEventListener(MESSAGE, (evt:MessageEvent) => {
    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_READY: {
            const {constants} = evt.data;
            setupRenderer(constants).then(_renderer => {
                renderer = _renderer;
                requestAnimationFrame(now => 
                    worker.postMessage({
                        cmd: WorkerCommand.TICK,
                        now
                    })
                );
            });
            break;
        }
        case WorkerCommand.RENDER: {
            const firstTime = renderables === undefined;
            renderables = evt.data.renderables;
            if(firstTime) {
                startMain();
            }             
            break;
        }

        case WorkerCommand.COLLISION_AUDIO: {
            const {collisionName} = evt.data;
            playCollision(collisionName);

            break;
        }
    }
});

worker.postMessage({
    cmd: WorkerCommand.WORKER_START
});

