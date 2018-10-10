module Game.Paddles (getPaddle, getPaddleEdge) where

import Prelude
import Effect (Effect)
import Data.Maybe (Maybe (..))
import Data.Either (Either (..))
import SodiumFRP.Class (Stream, Cell, newCellLoop, toCell)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Stream (orElse, accum, snapshot)
import SodiumFRP.Operational (defer)
import SodiumFRP.Cell (loopCell)
import Game.Constants
import Game.Types.Basic
import Game.Types.Paddle
import Game.Types.Controller
import Game.Types.Tick
import Game.Trajectory
import Game.Tick
import Game.Types.Environment
import Game.Types.Collision

-- Get a paddle
getPaddle ::    Stream Tick
                -> Paddle
                -> Speed
                -> {
                     cPosition :: Cell Position,
                     cTrajectory :: Cell PaddleTrajectory
                   }
getPaddle sTick paddleType speed =
    {
        cPosition: (\paddle -> paddle.pos) <$> cPaddleState,
        cTrajectory: (\paddle -> paddle.traj) <$> cPaddleState
    }
    where
          cPaddleState = accum (updatePaddle paddleType speed) (initialState paddleType) sTick

initialState :: Paddle -> PaddleState
initialState paddleType =
    {
        pos: initialPosition, 
        traj: PaddleTrajectory 0.0 0.0 initialPosition
    }
    where
        initialPosition = case paddleType of
            Paddle1 -> {x: paddle1x, y: constants.canvasHeight / 2.0}
            Paddle2 -> {x: paddle2x, y: constants.canvasHeight / 2.0}


updatePaddle :: Paddle -> Speed -> Tick -> PaddleState -> PaddleState
updatePaddle paddleType speed tick state = case tick of
    (CollisionTick (CollisionWall LeftWall _) _) -> 
        initialState paddleType
    (CollisionTick (CollisionWall RightWall _) _) -> 
        initialState paddleType
    (ControllerTick controller _) ->
        updateTrajectory speed time controller state #
        updateMotion time
    _ -> 
        updateMotion time state
    where 
        time = toTime tick

updateTrajectory :: Speed -> Time -> Controller -> PaddleState -> PaddleState
updateTrajectory speed startTime controller state = state {traj = newTraj}
    where 
        pos = state.pos
        newTraj = case controller of
            UP -> PaddleTrajectory startTime speed pos
            DOWN -> PaddleTrajectory startTime (speed * -1.0) pos
            NEUTRAL -> PaddleTrajectory startTime 0.0 pos 
            _ -> state.traj


updateMotion :: Time -> PaddleState -> PaddleState
updateMotion time state = state {pos = posAtTime state.traj time}

-- By just defining the startime, speed, and position values...
-- we always get the full trajectory functions :D

-- helper

getPaddleEdge :: Paddle -> Position -> Number
getPaddleEdge paddleType paddlePosition = case paddleType of
    Paddle1 -> paddlePosition.x + (constants.paddleWidth / 2.0) + constants.ballRadius 
    Paddle2 -> paddlePosition.x - ((constants.paddleWidth / 2.0) + constants.ballRadius)

type PaddleState = 
    {
        pos :: Position,
        traj :: PaddleTrajectory
    }
