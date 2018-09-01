export interface Camera {
    getModelViewProjection: (modelMatrix: Array<number> | Float64Array | Float32Array) => Float32Array;
}

