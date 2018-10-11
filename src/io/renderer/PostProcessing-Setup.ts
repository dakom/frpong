import {Constants, Camera} from "io/types/Types";
import {mat4} from "gl-matrix";
import {createConvRenderer, KERNELS} from "./thunks/post/Convolution-Thunk";
import {createBarrelRenderer} from "./thunks/post/Barrel-Thunk";


interface Props {
    gl: WebGLRenderingContext; 
    canvas:HTMLCanvasElement;
    programs: {
        scene: WebGLProgram;
        conv: WebGLProgram;
        barrel: WebGLProgram;
    };
    camera:Camera;
    constants:Constants;
}


export const createPostProcessing = ({gl, canvas, programs, camera, constants}:Props) => {


    const fb = gl.createFramebuffer();

    const texture1 = createTexture (gl) (constants.canvasWidth) (constants.canvasHeight);
    const texture2 = createTexture (gl) (constants.canvasWidth) (constants.canvasHeight);

    const renderConv = createConvRenderer({
        gl,
        constants,
        program: programs.conv,
        camera,
        canvas
    });

    const renderBarrel = createBarrelRenderer({
        gl,
        constants,
        program: programs.barrel,
        camera,
        canvas,
        distortion: 1.2 
    });


    const doEffect = (fb:WebGLFramebuffer) => (inTex:WebGLTexture) => (outTex:WebGLTexture) => (program:WebGLProgram) => (fn:(texture:WebGLTexture) => void) => {
        gl.useProgram(program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        if(fb != null) {
            gl.bindTexture(gl.TEXTURE_2D, outTex);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outTex, 0);
            gl.viewport(0, 0, constants.canvasWidth, constants.canvasHeight);

        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        fn(inTex);
    }

    const doEffectStart = (program:WebGLProgram) => (fn:(texture:WebGLTexture) => void) => {
        doEffect (fb) (null) (texture1) (program) (fn);
    }

    let lastEffect = "";

    const doEffectA = (program:WebGLProgram) => (fn:(texture:WebGLTexture) => void) => {
        lastEffect = "A";

        doEffect (fb) (texture1) (texture2) (program) (fn);
    }
    const doEffectB = (program:WebGLProgram) => (fn:(texture:WebGLTexture) => void) => {
        lastEffect = "B";
        doEffect (fb) (texture2) (texture1) (program) (fn);
    }
    const doEffectEnd = (program:WebGLProgram) => (fn:(texture:WebGLTexture) => void) => {
        doEffect (null) (lastEffect === "A" ? texture2 : texture1) (null) (program) (fn);
    }

    const render = (renderScene:() => void) => {
        doEffectStart (programs.scene) (renderScene);
        //to stack different effects, just alternate between A and B
        doEffectA (programs.barrel) (renderBarrel);
        //last call must be doEffectEnd
        doEffectEnd (programs.conv) (renderConv(KERNELS.BOX_BLUR));
        //doEffectB (programs.conv) (renderConv(KERNELS.GAUSSIAN_BLUR));
    }

    return {render}
}

const createTexture = (gl:WebGLRenderingContext) => (width: number) => (height:number):WebGLTexture => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
}

