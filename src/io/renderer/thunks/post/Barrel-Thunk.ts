import {CommonRenderProps} from "io/types/Types";
import {mat4} from "gl-matrix";
import {createCommonThunk} from "./Common-Post-Thunk";

interface RenderProps extends CommonRenderProps {
    distortion: number;
}

export const createBarrelRenderer = (props:RenderProps) => {
    const {gl, program, distortion} = props;

    const prepRender = createCommonThunk(props);

    const uDistortion= gl.getUniformLocation(program, "u_distortion");

    gl.uniform1f(uDistortion, distortion);

    return (texture:WebGLTexture) => {
        prepRender(texture);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
