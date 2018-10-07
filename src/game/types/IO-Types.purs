module Game.Types.IO where

-- Constants
type Constants = 
    {
        ballRadius :: Number,
        ballSpeed :: Number,
        
        paddleWidth :: Number,
        paddleHeight :: Number,
        paddleMargin :: Number,
     
        canvasWidth :: Number,
        canvasHeight :: Number
    }


-- Renderer
type Renderable =
    {
        id :: Number,
        x :: Number,
        y :: Number
    }
