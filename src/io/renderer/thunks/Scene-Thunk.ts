import {Renderable, RenderableId, CommonRenderProps} from "io/types/Types";
import {textureCache} from "io/renderer/textures/Textures";
import {mat4} from "gl-matrix";

export const createSceneThunk = ({gl, canvas, program, camera}:CommonRenderProps) => {
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
    const uImage= gl.getUniformLocation(program, "u_image");

    gl.uniform1i(uImage, 0);

    const render = (sprite:Renderable) => {

        const textureInfo = textureCache.get(sprite.id);
       

        mat4.fromTranslation(modelMatrix, [
            sprite.x != null 
                ? sprite.x - textureInfo.width/2
                : 0,
            sprite.y != null
                ? sprite.y - textureInfo.height/2
                : 0, 
            0
        ]);
        const clipSpace = camera.getModelViewProjection(modelMatrix);
        gl.uniformMatrix4fv(uTransformLocation, false, clipSpace);
        
        mat4.fromScaling(sizeMatrix, [textureInfo.width, textureInfo.height, 1]);
        gl.uniformMatrix4fv(uSizeLocation, false, sizeMatrix);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture); 



        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    return (renderables:Array<Renderable>) => {
        render({id: RenderableId.BG});

        renderables.forEach(render);
    }
}
