//Built-in constant from web api
export const MESSAGE = "message";


export enum WorkerCommand {
    WORKER_START, //Sent from IO to worker, starts things off
    WORKER_READY,
    TICK, //Sent from IO to worker, for timing info
    RENDER, //Sent from Worker when work is finished processing 
    CONTROLLER //Sent from IO on controller update
}
