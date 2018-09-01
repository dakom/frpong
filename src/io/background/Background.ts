export const setupBackground = () => { 
    const canvas = createCanvas();
    const ctx = createContext(canvas); 

    const draw = createDrawer (canvas) (ctx);

    const resize = () => {
        draw();
        //resizeDisplay({ width: window.innerWidth, height: window.innerHeight});
    }
    resize();
    window.addEventListener('resize', resize);

}

const createCanvas = () => {
    const canvas = document.createElement("canvas");

    
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1000";

    canvas.setAttribute('width', "100%");
    canvas.setAttribute('height', "100%"); 

    document.getElementById("app").appendChild(canvas);

    return canvas;
}

const createContext = (canvas:HTMLCanvasElement) => 
    canvas.getContext('2d'); 

const createDrawer = (canvas:HTMLCanvasElement) => (ctx:CanvasRenderingContext2D) => () => {
    const {width, height} = canvas;
    const startRatio = .3;
    const endRatio = .7;
    const radiusStart = 0;
    const radiusEnd = Math.min(width, height); 

    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createRadialGradient(  startRatio * width,
                                            startRatio * height,
                                            radiusStart,
                                            endRatio * width,
                                            endRatio * height,
                                            radiusEnd);

    grad.addColorStop(0, 'rgba(19, 57, 114, 1)');
    grad.addColorStop(1, 'rgba(13, 34, 66, 1)');


    //ctx.fillStyle = grad;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height); 
}

