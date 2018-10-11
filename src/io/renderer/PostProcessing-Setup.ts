import {Constants, Camera, RendererPrograms} from "io/types/Types";
import {mat4} from "gl-matrix";
import {createConvRenderer, KERNELS} from "./thunks/post/Convolution-Thunk";
import {createBarrelRenderer} from "./thunks/post/Barrel-Thunk";
import {createScanlinesRenderer} from "./thunks/post/Scanlines-Thunk";
import {createCrtRenderer} from "./thunks/post/Crt-Thunk";


interface Props {
    gl: WebGLRenderingContext; 
    canvas:HTMLCanvasElement;
    programs:RendererPrograms;
    camera:Camera;
    constants:Constants;
}


export const createPostProcessing = ({gl, canvas, programs, camera, constants}:Props) => {

    let effectSwitch:boolean; 

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

    const renderScanlines = createScanlinesRenderer({
        gl,
        constants,
        program: programs.scanlines,
        camera,
        canvas,
    });

    const renderCrt = createCrtRenderer({
        gl,
        constants,
        program: programs.crt,
        camera,
        canvas,
    });
    const doEffect = (fb:WebGLFramebuffer) => (program:WebGLProgram) => (fn:(texture:WebGLTexture) => void) => {
        const inTex = effectSwitch ? texture1 : texture2;
        const outTex = effectSwitch ? texture2 : texture1;
        gl.useProgram(program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        if(fb != null) {
            gl.bindTexture(gl.TEXTURE_2D, outTex);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outTex, 0);
            gl.viewport(0, 0, constants.canvasWidth, constants.canvasHeight);

        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        fn(inTex);
        
        effectSwitch = effectSwitch ? false : true;
    }


    const render = (renderScene:() => void) => {
        //Last effect must be with null framebuffer in order to show
        doEffect (fb) (programs.scene) (renderScene);
        doEffect (fb) (programs.crt) (renderCrt);
        doEffect (null) (programs.conv) (renderConv(KERNELS.BOX_BLUR));
        //doEffect (fb) (programs.barrel) (renderBarrel);
        //doEffect (null) (programs.scanlines) (renderScanlines);
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

