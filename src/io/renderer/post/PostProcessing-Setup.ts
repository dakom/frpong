import {Constants, Camera} from "io/types/Types";
import {mat4} from "gl-matrix";


interface Props {
    gl: WebGLRenderingContext; 
    canvas:HTMLCanvasElement;
    program:WebGLProgram;
    camera:Camera;
    constants:Constants;
}
export const createPostProcessing = ({gl, canvas, program, camera, constants}:Props) => {
    const fb = gl.createFramebuffer();

    const texture = createTexture (gl) (constants.canvasWidth) (constants.canvasHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const renderPost = createPostRenderer({
        gl,
        constants,
        program,
        camera,
        canvas,
        texture
    });

    const drawScene = (render: () => void) => {
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.viewport(0, 0, constants.canvasWidth, constants.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderPost();
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

const createPostRenderer = ({constants, gl, canvas, program, camera, texture}:Props & {texture:WebGLTexture}) => {
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

    const aVertexLocation = gl.getAttribLocation(program, "a_Vertex");
    gl.vertexAttribPointer(aVertexLocation , 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexLocation);

    const uSizeLocation = gl.getUniformLocation(program, "u_Size");
    const uTransformLocation = gl.getUniformLocation(program, "u_Transform");
    const uSampler = gl.getUniformLocation(program, "u_Sampler");

    const clipSpace = camera.getModelViewProjection(modelMatrix);
    gl.uniformMatrix4fv(uTransformLocation, false, clipSpace);
        
    mat4.fromScaling(sizeMatrix, [constants.canvasWidth, constants.canvasHeight, 1]);
    gl.uniformMatrix4fv(uSizeLocation, false, sizeMatrix);

    gl.uniform1i(uSampler, 0);

    return () => {
    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture); 



        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
