import {GltfScene, gltf_createAnimator, gltf_updateScene} from "pure3d";
import {initWorker} from "io/utils/Utils";
import {WorkerCommand, MESSAGE} from "io/types/Worker-Types";
//TODO - import purescript

initWorker().then(
    worker => {

        //top-level mutable state
        let lastTs:number;
        let direction:number = 1;
        let scene:Readonly<GltfScene>;
        let updateSceneForRenderer: (frameTs: number) => (scene:GltfScene) => GltfScene;

        let lightLens:Array<string | number>;

        worker.addEventListener(MESSAGE, (e:MessageEvent) => {
            switch(e.data.cmd) {
                case WorkerCommand.SCENE_PING:

                    scene = e.data.scene;
                    updateSceneForRenderer = gltf_updateScene(gltf_createAnimator(e.data.animations) ({loop: true}));

                    worker.postMessage({
                        cmd: WorkerCommand.SCENE_PONG,
                    });
                    break;

                case WorkerCommand.TICK:
                    lastTs = e.data.frameTs;

                    scene = updateSceneForRenderer (e.data.frameTs) (scene);

                    worker.postMessage({
                        cmd: WorkerCommand.RENDER,
                        scene
                    });

                    break;
            }
        });
    }
);


