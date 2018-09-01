import {Renderable} from "./Renderable-Types";

export interface Renderer {
    gl:WebGLRenderingContext;
    render: (renderables:Array<Renderable>) => void; 
    canvas: HTMLCanvasElement;
}

