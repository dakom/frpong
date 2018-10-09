//import MyWorker from 'worker-loader!./Main-Worker';
import {setupRenderer} from "io/renderer/Renderer-Setup";
import { getCompileFlags} from "io/utils/Utils";
import {RenderableId, WorkerCommand,  MESSAGE, Constants, Renderer, Renderable, Scoreboard} from "io/types/Types";
import {startController} from "io/controller/Controller";
import {setupBackground} from "io/background/Background";
import {createScoreboard} from "io/scoreboard/Scoreboard";
import {playCollision} from "io/audio/Audio";
import WebFont from "webfontloader";

const {buildMode, buildVersion, isProduction} = getCompileFlags();
console.log(`%c FRPong ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');

let renderer:Renderer;
let scoreboard:Scoreboard;
let renderables:Array<Renderable>;

const worker = new Worker('./mainWorker.js');
setupBackground();

WebFont.load({
    google: {
      families: ['Press Start 2P']
    },
    active: () => {

        worker.postMessage({
            cmd: WorkerCommand.WORKER_START
        });
    }
})

worker.addEventListener(MESSAGE, (evt:MessageEvent) => {
    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_READY: {
            const {constants} = evt.data;
            setupRenderer(constants).then(_renderer => {
                renderer = _renderer;
                scoreboard = createScoreboard (constants) (renderer);
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

            if(collisionName === "leftWall") {
                scoreboard.addPoint(2);
            } else if(collisionName === "rightWall") {
                scoreboard.addPoint(1);
            }

            playCollision(collisionName);

            break;
        }
    }
});

const startMain = () => {

    const tick = now => {
        //Checking if the state is fresh serves two purposes:
        //1. Avoids needless renders
        //2. Prevents buildup of worker tick messages
        if(renderables != null) {
            renderer.render(renderables.concat([{
                id: RenderableId.SCOREBOARD
            }]));
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

