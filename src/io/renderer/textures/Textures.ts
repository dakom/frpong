import {TextureInfo, RenderableId, Paddle, Ball, Renderable, Constants} from "io/types/Types";

export const textureCache = new Map<RenderableId, TextureInfo>();

export const createTextures = (constants:Constants) => (gl:WebGLRenderingContext) => {

    const getBallImage = () => {
        const radius = constants.ballRadius;
        const color = "white";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');

        canvas.width = radius*2;
        canvas.height = radius*2; 
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = color; 
        ctx.fill();
        return canvas;
    }

    const getPaddleImage = () => {
        const width = constants.paddleWidth;
        const height = constants.paddleHeight;
        let cornerRadius = 10.0;
        const color = "white";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height; 
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        if (width < 2 * cornerRadius) {
            cornerRadius = width / 2;
        }
        if (height < 2 * cornerRadius) {
            cornerRadius = height / 2;
        }
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.arcTo(width, 0,   width, height, cornerRadius);
        ctx.arcTo(width, height, 0,   height, cornerRadius);
        ctx.arcTo(0,   height, 0,   0,   cornerRadius);
        ctx.arcTo(0,   0,   width, 0,   cornerRadius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        return canvas;
    }

    const createTexture = (canvas:HTMLCanvasElement):TextureInfo => {

        const texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (isPowerOf2(canvas.width) && isPowerOf2(canvas.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);


        return {
            texture,
            width: canvas.width,
            height: canvas.height
        }

    }

    textureCache.set(
        RenderableId.BALL, 
        createTexture(getBallImage())
    );

    textureCache.set(
        RenderableId.PADDLE1, 
        createTexture(getPaddleImage())
    );
    
    textureCache.set(
        RenderableId.PADDLE2, 
        createTexture(getPaddleImage())
    );
}

const isPowerOf2 = (value:number):boolean => (value & (value - 1)) == 0;
