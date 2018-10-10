import {ControllerValue} from "io/types/Controller-Types";
import {Constants} from "io/types/Constants-Types";

interface State {
    ball_x: number;
    ball_y: number;
    paddle1_x: number;
    paddle1_y: number;
    paddle2_x: number;
    paddle2_y: number;
}

const controllerLookup = new Map<number, ControllerValue>();
controllerLookup.set(0, ControllerValue.NEUTRAL);
controllerLookup.set(1, ControllerValue.DOWN);
controllerLookup.set(2, ControllerValue.UP);

let history:State 
let wasmLib;
let constants:Constants;

export const setWasmLib = _wasmLib => wasmLib = _wasmLib;
export const setConstants = _constants => constants = _constants;

export const makeAiControllerUpdater = (sendController:(val:ControllerValue) => void) => (state:State) => {
    if(history) {
        const controllerInt =
            wasmLib.ai_controller(
                constants.ballRadius,
                constants.paddleHeight,
                state.ball_x,
                state.ball_y,
                state.paddle1_x,
                state.paddle1_y,
                state.paddle2_x,
                state.paddle2_y,
                history.ball_x,
                history.ball_y,
                history.paddle1_x,
                history.paddle1_y,
                history.paddle2_x,
                history.paddle2_y,
            );

        if(controllerInt !== -1) {
            sendController (controllerLookup.get(controllerInt));
        }
    } 
    history = state;
}

export const makeAiCollisionUpdater = () => (collisionName:string) => {
    const delay = Math.floor(Math.random() * 24);
    wasmLib.ai_update_delay(delay);
}
