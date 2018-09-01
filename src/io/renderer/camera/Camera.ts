import {mat4} from "gl-matrix";
import {Camera, Constants} from "io/types/Types";

export const createCamera = (constants:Constants):Camera => {

    const view = mat4.create();
    const projection = mat4.ortho(new Float64Array(16) as any, 0, constants.canvasWidth, 0, constants.canvasHeight, 0, 1);
    

    return {
        getModelViewProjection: (modelMatrix:Array<number> | Float64Array | Float32Array):Float32Array => {
            const m = mat4.create();
            mat4.multiply(m, view, modelMatrix);
            mat4.multiply(m, projection, m);
            return m;
        }
    }
}

