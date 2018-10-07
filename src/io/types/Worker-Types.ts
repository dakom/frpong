//Built-in constant from web api
export const MESSAGE = "message";


export enum WorkerCommand {
    WORKER_START, //Sent from IO to worker, starts things off
    WORKER_READY,
    TICK, //Sent from IO to worker, for timing info
    RENDER, //Sent from Worker when work is finished processing 
    CONTROLLER1, //Sent from IO on controller update
    CONTROLLER2, //Same as AI_CONTROLLER but could be made to player 2 
    AI_UPDATE, // Sent from Main-Worker to AI-Worker on state update
    AI_CONTROLLER, // Sent from AI-Worker on controller update
    COLLISION_AUDIO,
                    
}
