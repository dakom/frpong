//Built-in constant from web api
export const MESSAGE = "message";

/* 
 * These are really just internal wrapped with the loader functions
 */
export enum WorkerLoaderCommand {
    INIT, //Sent from IO when Worker JS is loaded
    READY, //Sent from Worker when INIT is received (worker is ready)
}

/*
 * See where these are called in IO.ts and Worker.ts to make stuff happen
 */

export enum WorkerCommand {
    SCENE_PING,//Sent from IO when first scene is ready
    SCENE_PONG, //Sent from Worker when first scene is ready
    TICK, //Sent from IO on frame tick - but only when not busy 
    RENDER, //Sent from Worker when work is finished processing 
}
