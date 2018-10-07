module Main (main, constants) where

import Prelude
import Effect(Effect)
import Effect.Console (logShow)
import Data.Maybe (Maybe(..))
import Data.Traversable (sequence)
import SodiumFRP.Class (Cell, listen, newStreamLoop, newCellLoop, newStreamSink, send, toStream, toCell)
import SodiumFRP.Stream (orElse, hold, filter, loopStream, snapshot)
import SodiumFRP.Cell (loopCell)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Operational (defer)
import Game.Constants as GameConstants
import Game.Paddles 
import Game.Ball
import Game.Types.Basic (Position, Time)
import Game.Types.IO (Constants, Renderable)
import Game.Types.Paddle
import Game.Types.Tick
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
        -> (Position -> Effect Unit)
        -> Effect 
            {
                sendUpdate :: Time -> Effect Unit,
                sendRender :: Unit -> Effect Unit,
                sendController1 :: String -> Effect Unit,
                sendController2 :: String -> Effect Unit
            }

main wasmLib firstTs onRender onCollision onAiTarget = runTransaction do
    {- FFI -}
    _ <- assignLib wasmLib
    {- INPUT -}
    
    -- streams from the outside world
    sExternalUpdate <- newStreamSink Nothing
    sExternalRender <- newStreamSink Nothing
    sExternalController1 <- newStreamSink Nothing
    sExternalController2 <- newStreamSink Nothing

    -- streams from game loop
    sCollisionLoop <- newStreamLoop

    {- MAIN -}

    -- due to web api restrictions, all time is based on rAF values
    -- therefore it's one tick, albeit of different types
    ticks <- getTicks
                (toStream sExternalUpdate)
                (defer $ toStream sCollisionLoop)
                (toStream sExternalController1) 
                (toStream sExternalController2) 
    
    -- game objects with exported cells
    let ball = getBall ticks.sBall

    let paddle1 = getPaddle ticks.sPaddle1 Paddle1 
    let paddle2 = getPaddle ticks.sPaddle2 Paddle2

    -- collision detection
    collision <- getCollision (toStream sExternalUpdate) paddle1 paddle2 ball

    {- CLOSE LOOPS -}
    _ <- loopStream sCollisionLoop collision.sCollision 

    {- OUTPUT -}

    -- render
    let cRenderables = sequence 
            [
                addIdToPosition 0.0 <$> ball.cPosition,
                addIdToPosition 1.0 <$> paddle1.cPosition,
                addIdToPosition 2.0 <$> paddle2.cPosition
            ] 
    let sRenderables = snapshot (\_ r -> r) sExternalRender cRenderables
    _ <- listen sRenderables onRender 

    -- play collision audio 
    _ <- listen (getCollisionAudioName <$> collision.sCollision) onCollision

    _ <- listen collision.sAiCollision onAiTarget 
    _ <- listen collision.sAiCollision logShow
    pure
        {
            sendUpdate: send sExternalUpdate,
            sendRender: send sExternalRender,
            sendController1: send sExternalController1,
            sendController2: send sExternalController2
        }

    where
        addIdToPosition :: Number -> Position -> {id :: Number, x :: Number, y :: Number}
        addIdToPosition id pos = {id, x: pos.x, y: pos.y}


constants :: Constants
constants = GameConstants.constants
