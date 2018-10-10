import {Constants, Camera} from "io/types/Types";
import {mat4} from "gl-matrix";


interface Props {
    gl: WebGLRenderingContext; 
    canvas:HTMLCanvasElement;
    programs:Array<WebGLProgram>;
    camera:Camera;
    constants:Constants;
}
export const createPostProcessing = ({gl, canvas, programs, camera, constants}:Props) => {


    const fb = gl.createFramebuffer();

    const texture = createTexture (gl) (constants.canvasWidth) (constants.canvasHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const renderConv = createConvRenderer({
        gl,
        constants,
        program: programs[1],
        camera,
        canvas,
        texture
    });

    const drawScene = (render: () => void) => {
        gl.useProgram(programs[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.viewport(0, 0, constants.canvasWidth, constants.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        render();
    }

    const process = () => {
        //TODO - call shader that will manipulate texture
    }

    const show = () => {
        gl.useProgram(programs[1]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.viewport(0, 0, constants.canvasWidth, constants.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderConv();
    }

    return {drawScene, process, show}
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

interface RenderProps {
    gl: WebGLRenderingContext; 
    canvas:HTMLCanvasElement;
    program:WebGLProgram;
    camera:Camera;
    constants:Constants;
    texture:WebGLTexture;
}

const computeKernelWeight = kernel => {
   const weight = kernel.reduce(function(prev, curr) {
       return prev + curr;
   });
   return weight <= 0 ? 1 : weight;
}

const createConvRenderer = ({constants, gl, canvas, program, camera, texture}:RenderProps) => {

    gl.useProgram(program);
    const sizeMatrix = mat4.create();
    const modelMatrix = mat4.create();


    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            0.0,1.0, // top-left
            0.0,0.0, //bottom-left
            1.0, 1.0, // top-right
            1.0, 0.0 // bottom-right
        ]),
        gl.STATIC_DRAW
    );

    const kernel = [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
    ];

    const aVertexLocation = gl.getAttribLocation(program, "a_vertex");
    gl.vertexAttribPointer(aVertexLocation , 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexLocation);

    const uSizeLocation = gl.getUniformLocation(program, "u_size");
    const uTransformLocation = gl.getUniformLocation(program, "u_transform");
    const uSampler = gl.getUniformLocation(program, "u_image");
    const uTextureSize = gl.getUniformLocation(program, "u_textureSize");
    const uKernel = gl.getUniformLocation(program, "u_kernel");
    const uKernelWeight = gl.getUniformLocation(program, "u_kernelWeight");

    const clipSpace = camera.getModelViewProjection(modelMatrix);
    gl.uniformMatrix4fv(uTransformLocation, false, clipSpace);
        
    mat4.fromScaling(sizeMatrix, [constants.canvasWidth, constants.canvasHeight, 1]);
    gl.uniformMatrix4fv(uSizeLocation, false, sizeMatrix);

    gl.uniform1i(uSampler, 0);

    gl.uniform2fv(uTextureSize, Float32Array.from([constants.canvasWidth, constants.canvasHeight]));

    gl.uniform1f(uKernelWeight, computeKernelWeight(kernel));
    gl.uniform1fv(uKernel, kernel);

    return () => {
    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture); 
        


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}


