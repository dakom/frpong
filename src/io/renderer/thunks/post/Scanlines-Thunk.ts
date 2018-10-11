import {CommonRenderProps} from "io/types/Types";
import {mat4} from "gl-matrix";
import {createCommonThunk} from "./Common-Post-Thunk";

let time = 0;

export const createScanlinesRenderer = (props:CommonRenderProps) => {
    const {gl, program, } = props;

    const prepRender = createCommonThunk(props);

    const uTime = gl.getUniformLocation(program, "u_time");


    return (texture:WebGLTexture) => {
        prepRender(texture);

        gl.uniform1f(uTime, time += .01);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
