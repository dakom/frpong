import {Renderer, Renderable, Constants, Scoreboard} from "io/types/Types";
import {createRenderThunk} from "./Render-Thunk";
import {createCamera} from "./camera/Camera";
import {createSpriteTextures} from "io/renderer/textures/Textures";
import {createPostProcessing} from "./post/PostProcessing-Setup";

import vertexShader from "./shaders/Quad-Shader-Vertex.glsl";
import fragmentShader from "./shaders/Quad-Shader-Fragment.glsl";

export const setupRenderer = (constants:Constants) => new Promise<Renderer>((resolve, reject) => {
    const canvas = createCanvas(constants);
    const gl = createContext(canvas) ({ premultipliedAlpha: false});
    const program = compileShader (gl) ({vertex: vertexShader, fragment: fragmentShader});
    if(program instanceof Error) {
        reject(program);
        return;
    }

    createSpriteTextures (constants) (gl);
    gl.clearColor(0, 0, 0, 0);
    gl.enable (gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const camera = createCamera(constants);
    const resizeDisplay = createResizer ({gl, canvas, constants});
    const renderScene = createRenderThunk({gl, canvas, program, camera});
    const postProcessing = createPostProcessing ({gl, canvas, program, camera, constants}); 

    const render = (renderables:Array<Renderable>) => {
        postProcessing.drawScene(() => renderScene(renderables));
        postProcessing.process();
        postProcessing.show();
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

    canvas.style.backgroundColor = "#333";

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
