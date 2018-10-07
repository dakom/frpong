import {ControllerValue} from "io/types/Controller-Types";

interface State {
    ball_x: number;
    ball_y: number;
    paddle1_x: number;
    paddle1_y: number;
    paddle2_x: number;
    paddle2_y: number;
}

const controllerLookup = new Map<number, ControllerValue>();
controllerLookup.set(0, ControllerValue.DOWN);
controllerLookup.set(1, ControllerValue.NEUTRAL);
controllerLookup.set(2, ControllerValue.UP);

let history:State;

export const makeUpdater = wasmLib => (sendController:(val:ControllerValue) => void) => (state:State) => {

    if(history) {
        const controllerInt =
            wasmLib.ai_controller(
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
                history.paddle2_y
            );


        sendController (controllerLookup.get(controllerInt));
    } 
    history = state;
}

const diffValue = (diff:number):ControllerValue =>
    diff < 0 ? ControllerValue.DOWN
    : diff > 0 ? ControllerValue.UP
    : ControllerValue.NEUTRAL;
