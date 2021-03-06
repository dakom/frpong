module Game.Constants where

import Prelude
import Game.Types.IO

constants :: Constants
constants =
    {
        ballRadius: 7.0,
        ballSpeed: 1.0,
        
        paddleWidth: 20.0,
        paddleHeight: 130.0,
        paddleMargin: 30.0,

        canvasWidth: 1024.0,
        canvasHeight: 768.0
    
    }


topWall = constants.canvasHeight - constants.ballRadius
bottomWall = constants.ballRadius 
rightWall = constants.canvasWidth - constants.ballRadius
leftWall = constants.ballRadius 

paddle1x = constants.paddleMargin
paddle2x = constants.canvasWidth - constants.paddleMargin - constants.paddleWidth


paddleHalfHeight = constants.paddleHeight / 2.0 
paddleBottomY = paddleHalfHeight 
paddleTopY = constants.canvasHeight - paddleHalfHeight 
