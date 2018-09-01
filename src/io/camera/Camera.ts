import {
    Camera,
    createWebGlRenderer,
    PerspectiveCameraSettings,
    CameraKind,
    getCameraProjection,
    createMat4
} from "pure3d";

import {mat4} from "gl-matrix";

export const createCamera = ():Camera => {
    const settings:PerspectiveCameraSettings = {
        kind: CameraKind.PERSPECTIVE,
        yfov: 45.0 * Math.PI / 180,
        aspectRatio: window.innerWidth / window.innerHeight,
        znear: .01,
        zfar: 1000
    }

    const position = Float64Array.from([0,0,5]);
    const cameraLook = Float64Array.from([0,0,0]);
    const cameraUp = Float64Array.from([0,1,0]);
   
    const projection = getCameraProjection(settings); 

    const view = mat4.lookAt(createMat4() as any, position as any, cameraLook as any,cameraUp as any);

    return {
        settings,
        position,
        view,
        projection
    }
}

