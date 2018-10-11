import {CommonRenderProps} from "io/types/Types";
import {mat4} from "gl-matrix";
import {createCommonThunk} from "./Common-Post-Thunk";

export const KERNELS = {
    GAUSSIAN_BLUR: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
    ],

    BOX_BLUR: [
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
    ],

    EDGE: [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ],

    IDENTITY: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
    ]
}
export const createConvRenderer = (props:CommonRenderProps) => {
    const {gl, program} = props;

    const prepRender = createCommonThunk(props);

    const uKernel = gl.getUniformLocation(program, "u_kernel");
    const uKernelWeight = gl.getUniformLocation(program, "u_kernelWeight");


    return (kernel:Array<number>) => (texture:WebGLTexture) => {

        gl.uniform1f(uKernelWeight, computeKernelWeight(kernel));
        gl.uniform1fv(uKernel, kernel);

        prepRender(texture);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}


const computeKernelWeight = kernel => {
   const weight = kernel.reduce(function(prev, curr) {
       return prev + curr;
   });
   return weight <= 0 ? 1 : weight;
}
