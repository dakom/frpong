/* tslint:disable */
import wasm from './frpong_bg.wasm';

console.log(wasm);

/**
* @param {number} arg0
* @param {number} arg1
* @param {number} arg2
* @param {number} arg3
* @returns {number}
*/
export function ball_traj_pos(arg0, arg1, arg2, arg3) {
    return wasm.ball_traj_pos(arg0, arg1, arg2, arg3);
}

/**
* @param {number} arg0
* @param {number} arg1
* @param {number} arg2
* @param {number} arg3
* @returns {number}
*/
export function ball_traj_time(arg0, arg1, arg2, arg3) {
    return wasm.ball_traj_time(arg0, arg1, arg2, arg3);
}

/**
* @param {number} arg0
* @param {number} arg1
* @param {number} arg2
* @param {number} arg3
* @param {number} arg4
* @param {number} arg5
* @returns {number}
*/
export function paddle_traj_pos(arg0, arg1, arg2, arg3, arg4, arg5) {
    return wasm.paddle_traj_pos(arg0, arg1, arg2, arg3, arg4, arg5);
}

/**
* @param {number} arg0
* @param {number} arg1
* @param {number} arg2
* @param {number} arg3
* @returns {number}
*/
export function paddle_traj_time(arg0, arg1, arg2, arg3) {
    return wasm.paddle_traj_time(arg0, arg1, arg2, arg3);
}

/**
* @param {number} arg0
* @param {number} arg1
* @param {number} arg2
* @param {number} arg3
* @returns {number}
*/
export function ai_traj_pos(arg0, arg1, arg2, arg3) {
    return wasm.ai_traj_pos(arg0, arg1, arg2, arg3);
}

/**
* @param {number} arg0
* @param {number} arg1
* @param {number} arg2
* @param {number} arg3
* @param {number} arg4
* @param {number} arg5
* @param {number} arg6
* @param {number} arg7
* @param {number} arg8
* @param {number} arg9
* @param {number} arg10
* @param {number} arg11
* @returns {number}
*/
export function ai_controller(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    return wasm.ai_controller(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11);
}

