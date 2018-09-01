import {State, Tick} from "io/types/State";
import {
    createWebGlRenderer,
    PerspectiveCameraSettings,
    CameraKind,
    getCameraProjection,
    createMat4
} from "pure3d";

export const createRenderer = () => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.backgroundColor = "#2a2a2a";

    document.getElementById("app").appendChild(canvas);

    const renderer = createWebGlRenderer({
        canvas,
        version: 1
    });
    renderer.gl.clearColor(0.2, 0.2, 0.2, 1.0);

    renderer.resize({ width: window.innerWidth, height: window.innerHeight });

    return renderer;
}

