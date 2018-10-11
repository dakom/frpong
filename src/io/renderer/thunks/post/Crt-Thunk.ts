
import {CommonRenderProps} from "io/types/Types";
import {mat4} from "gl-matrix";
import {createCommonThunk} from "./Common-Post-Thunk";

interface RenderProps extends CommonRenderProps {
}

export const createCrtRenderer = (props:RenderProps) => {
    const {gl, program} = props;

    const prepRender = createCommonThunk(props);


    return (texture:WebGLTexture) => {
        prepRender(texture);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
