module Main (main, constants) where

import Prelude
import Effect(Effect)
import Effect.Console (logShow)
import Data.Maybe (Maybe(..))
import Data.Traversable (sequence)
import SodiumFRP.Class (Cell, listen, newStreamLoop, newStreamSink, send, toStream)
import SodiumFRP.Stream (filter, loopStream, snapshot)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Operational (defer)
import Game.Constants as GameConstants
import Game.Paddles 
import Game.Ball
import Game.Types.Basic (Position, Time)
import Game.Types.IO (Constants, Renderable)
import Game.Tick 
import Game.Collision
import Game.Utils.Sodium
import Game.FFI

{-
    To remove artifacts that result from collision interpenetration displacement,
    two techniques are used:
        1. sendUpdate is called *twice* for every sendRender (via js worker)
        2. sCollision is created with `defer`

    "collision interpenetration displacement" means, for example
    if a ball is past the wall/paddle, we move it back in time 
    to where (and when too!) it would have actually collided - before showing it

    It's not entirely clear to me why *both* of these approaches are needed
    But removing either of them makes it so the out-of-bounds values are rendered 
    A clue might be that removing both of them allows for two ticks of bad values

    In terms of performance - if it's actually a problem to update twice in a tick
    Then more work could be done to figure out the exact case where it's needed
    (i.e. collect both updates and compare timestamps/positions)
    Of course - that wouldn't be free either, and since we're anyways limited
    to run our work at rAF junctures, we have extra time to run multiple updates
    See Main-Worker.ts for more comments about time/rAF/performance.now()
-}

main :: WasmLib
        -> Time 
        -> (Array Renderable -> Effect Unit) 
        -> (String -> Effect Unit) 
        -> Effect 
            {
                sendUpdate :: Time -> Effect Unit,
                sendRender :: Unit -> Effect Unit,
                sendController :: String -> Effect Unit
            }

main wasmLib firstTs onRender onCollision = runTransaction do
    {- FFI -}
    _ <- assignLib wasmLib
    {- INPUT -}
    
    -- streams from the outside world
    sExternalUpdate <- newStreamSink Nothing
    sExternalRender <- newStreamSink Nothing
    sExternalController <- newStreamSink Nothing

    -- streams from game loop
    sCollisionLoop <- newStreamLoop

    {- MAIN -}

    -- due to web api restrictions, all time is based on rAF values
    -- therefore it's one tick, albeit of different types
    sTick <- getTick 
                (toStream sExternalUpdate) 
                (toStream sExternalController) 
                (defer $ toStream sCollisionLoop)

    -- game objects with exported cells
    let paddle = getPaddle sTick
    let ball = getBall sTick 

    -- collision detection
    sCollision <- getCollision (toStream sExternalUpdate) paddle.cPosition paddle.cTrajectory ball.cPosition ball.cTrajectory
    _ <- loopStream sCollisionLoop sCollision 
  
    {- OUTPUT -}

    -- render
    let cRenderables = sequence 
            [
                addIdToPosition 0.0 <$> ball.cPosition,
                addIdToPosition 1.0 <$> paddle.cPosition
            ] 
    let sRenderables = snapshot (\_ r -> r) sExternalRender cRenderables
    _ <- listen sRenderables onRender 

    -- play collision audio 
    _ <- listen (getCollisionAudioName <$> sCollision) onCollision

    pure 
        {
            sendUpdate: send sExternalUpdate,
            sendRender: send sExternalRender,
            sendController: send sExternalController
        }

    where
        addIdToPosition :: Number -> Position -> {id :: Number, x :: Number, y :: Number}
        addIdToPosition id pos = {id, x: pos.x, y: pos.y}


constants :: Constants
constants = GameConstants.constants
