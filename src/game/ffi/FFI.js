"use strict";

var lib;

exports.assignLibImpl = function(_lib) {
    lib = _lib;
}

exports.ball_traj_posImpl = function(t,v,p,i) {
    return lib.ball_traj_pos(t,v,p,i);
}

exports.ball_traj_timeImpl = function(n,v,p,i) {
    return lib.ball_traj_time(n,v,p,i);
}

exports.paddle_traj_posImpl = function(t, s, p, i, bl, tl) {
    return lib.paddle_traj_pos(t, s, p, i, bl, tl);
}

exports.paddle_traj_timeImpl = function(n,s,p,i) {
    return lib.ball_traj_time(n,s,p,i);
}

