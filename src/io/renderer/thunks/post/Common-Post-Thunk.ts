import {CommonRenderProps} from "io/types/Types";
import {mat4} from "gl-matrix";


export const createCommonThunk = ({constants, gl, canvas, program, camera}:CommonRenderProps) => {
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


    const aVertexLocation = gl.getAttribLocation(program, "a_vertex");
    gl.vertexAttribPointer(aVertexLocation , 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexLocation);

    const uSizeLocation = gl.getUniformLocation(program, "u_size");
    const uTransformLocation = gl.getUniformLocation(program, "u_transform");
    const uSampler = gl.getUniformLocation(program, "u_image");
    const uTextureSize = gl.getUniformLocation(program, "u_textureSize");


    return (texture:WebGLTexture) => {
        gl.useProgram(program);

        mat4.fromScaling(sizeMatrix, [constants.canvasWidth, constants.canvasHeight, 1]);

        const clipSpace = camera.getModelViewProjection(modelMatrix);
        gl.uniformMatrix4fv(uTransformLocation, false, clipSpace);
        gl.uniformMatrix4fv(uSizeLocation, false, sizeMatrix);

        gl.uniform1i(uSampler, 0);
        gl.uniform2fv(uTextureSize, Float32Array.from([constants.canvasWidth, constants.canvasHeight]));

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture); 
        

        //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
