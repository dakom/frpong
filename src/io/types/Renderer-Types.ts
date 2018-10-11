import {Renderable} from "./Renderable-Types";
import {Camera} from "./Camera-Types";
import {Constants} from "./Constants-Types";

export interface Renderer {
    gl:WebGLRenderingContext;
    render: (renderables:Array<Renderable>) => void; 
    canvas: HTMLCanvasElement;
}

export interface CommonRenderProps {
    gl: WebGLRenderingContext; 
    canvas:HTMLCanvasElement;
    program:WebGLProgram;
    camera:Camera;
    constants:Constants;
}

export interface RendererPrograms {
    scene: WebGLProgram;
    conv: WebGLProgram;
    barrel: WebGLProgram;
}

