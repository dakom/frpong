import {Renderer, RendererPrograms, Renderable, Constants, Scoreboard} from "io/types/Types";
import {createSceneThunk} from "./thunks/Scene-Thunk";
import {createCamera} from "./camera/Camera";
import {createSpriteTextures} from "io/renderer/textures/Textures";
import {createPostProcessing} from "./PostProcessing-Setup";

import quadVertexShader from "./shaders/Quad-Shader-Vertex.glsl";

import quadFragmentShader from "./shaders/Quad-Shader-Fragment.glsl";
import convFragmentShader from "./shaders/Convolution-Shader-Fragment.glsl";
import barrelFragmentShader from "./shaders/Barrel-Shader-Fragment.glsl";
import scanlinesFragmentShader from "./shaders/Scanlines-Shader-Fragment.glsl";

import crtShader from "./shaders/Crt-Shader.glsl";

const crtShaderSource = {vertex: "#define VERTEX\n" + crtShader, fragment: "#define FRAGMENT\n" + crtShader}


export const setupRenderer = (constants:Constants) => new Promise<Renderer>((resolve, reject) => {
    const canvas = createCanvas(constants);
    const gl = createContext(canvas) ({ premultipliedAlpha: false});
    const programList = [
        {vertex: quadVertexShader, fragment: quadFragmentShader},
        {vertex: quadVertexShader, fragment: convFragmentShader},
        {vertex: quadVertexShader, fragment: barrelFragmentShader},
        {vertex: quadVertexShader, fragment: scanlinesFragmentShader},
        crtShaderSource
    ].map(compileShader(gl));

    const programError = programList.find(program => program instanceof Error);
    if(programError) {
        reject(programError);
        return;
    }

    const programs:RendererPrograms = {
        scene: programList[0] as WebGLProgram,
        conv: programList[1] as WebGLProgram,
        barrel: programList[2] as WebGLProgram,
        scanlines: programList[3] as WebGLProgram,
        crt: programList[4] as WebGLProgram,
    }
    createSpriteTextures (constants) (gl);
    gl.clearColor(0, 0, 0, 0);
    gl.enable (gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const camera = createCamera(constants);
    const resizeDisplay = createResizer ({gl, canvas, constants});
    const renderScene = createSceneThunk({gl, constants, canvas, program: programs.scene, camera});
    const postProcessing = createPostProcessing ({gl, canvas, programs, camera, constants}); 

    const render = (renderables:Array<Renderable>) => {
        postProcessing.render(() => renderScene(renderables));
    }

    const resize = () => {
        //no need to resize camera, we're at a locked view
        resizeDisplay({ width: window.innerWidth, height: window.innerHeight});
    }
    resize();
    window.addEventListener('resize', resize);

    const renderer = {gl, render, canvas};

    resolve(renderer);
})

const createCanvas = (constants:Constants) => {
    const canvas = document.createElement("canvas");

    
    canvas.style.position = "absolute";

    canvas.setAttribute('width', `${constants.canvasWidth}`);
    canvas.setAttribute('height', `${constants.canvasHeight}`);

    document.getElementById("app").appendChild(canvas);

    return canvas;
}

const createContext = (canvas:HTMLCanvasElement) => (opts:any) => 
    canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);

const createResizer = ({gl, canvas, constants}:{gl: WebGLRenderingContext, canvas:HTMLCanvasElement, constants:Constants}) => {
    let lastScreenSize:{width?:number, height?:number} = {};

    return (screenSize:{ width: number, height: number }) => {
        if (lastScreenSize.width !== screenSize.width || lastScreenSize.height !== screenSize.height) {

            const ratio = Math.min(screenSize.width / constants.canvasWidth, screenSize.height / constants.canvasHeight);
            const cssWidth = constants.canvasWidth * ratio;
            const cssHeight = constants.canvasHeight * ratio;

            canvas.style.left = `${(screenSize.width - cssWidth)/2}px`;
            canvas.style.top = `${(screenSize.height - cssHeight)/2}px`;
            canvas.style.width = `${cssWidth}px`; 
            canvas.style.height = `${cssHeight}px`; 

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            lastScreenSize.width = screenSize.width;
            lastScreenSize.height = screenSize.height;
        }
    }
}

const compileShader = (gl:WebGLRenderingContext) => (source:{vertex: string, fragment: string}): WebGLProgram | Error => {
    const program = gl.createProgram();
    let vShaderOrError: WebGLShader | Error;
    let fShaderOrError: WebGLShader | Error;

    const dispose = () => {
        if (vShaderOrError !== undefined && (vShaderOrError instanceof WebGLShader)) {
            gl.deleteShader(vShaderOrError);
        }

        if (fShaderOrError !== undefined && (fShaderOrError instanceof WebGLShader)) {
            gl.deleteShader(fShaderOrError);
        }

        gl.deleteProgram(program);
    }

    const getShaderName = (shaderType: number): string => shaderType === gl.VERTEX_SHADER ? "vertex" : "fragment";

    const loadShader = (shaderType: number) => (sourceText: string): WebGLShader | Error => {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, sourceText);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorMessage = `${getShaderName(shaderType)} error: ` + gl.getShaderInfoLog(shader);
            throw new Error(errorMessage); //this _should_ be an exception
        }

        gl.attachShader(program, shader);
        return shader;
    }

    vShaderOrError = loadShader(gl.VERTEX_SHADER)(source.vertex);
    if (vShaderOrError instanceof Error) {
        dispose();
        return vShaderOrError;
    }

    fShaderOrError = loadShader(gl.FRAGMENT_SHADER)(source.fragment);
    if (fShaderOrError instanceof Error) {
        dispose();
        return fShaderOrError;
    }

    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        dispose();
        return new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);
    return program;
}
