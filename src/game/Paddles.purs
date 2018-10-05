module Game.Paddles (getPaddle) where

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

-- Get a paddle
getPaddle ::    Stream Tick
                -> Paddle
                -> {
                     cPosition :: Cell Position,
                     cTrajectory :: Cell PaddleTrajectory
                   }
getPaddle sTick paddleType =
    {
        cPosition: (\paddle -> paddle.pos) <$> cPaddleState,
        cTrajectory: (\paddle -> paddle.traj) <$> cPaddleState
    }
    where
        initialPosition = case paddleType of
            Paddle1 -> {x: constants.paddleMargin, y: constants.canvasHeight / 2.0}
            Paddle2 -> {x: constants.canvasWidth - constants.paddleMargin - constants.paddleWidth, y: constants.canvasHeight / 2.0}
        initialPaddle = 
            {
                pos: initialPosition, 
                traj: PaddleTrajectory 0.0 0.0 initialPosition
            }
        cPaddleState = accum updatePaddle initialPaddle sTick

updatePaddle :: Tick -> PaddleState -> PaddleState
updatePaddle tick state = case tick of
    (ControllerTick controller _) ->
        updateTrajectory time controller state #
        updateMotion time
    _ -> 
        updateMotion time state
    where 
        time = toTime tick

updateTrajectory :: Time -> Controller -> PaddleState -> PaddleState
updateTrajectory startTime controller state = state {traj = newTraj}
    where 
        pos = state.pos
        newTraj = case controller of
            UP -> PaddleTrajectory startTime constants.paddleSpeed pos
            DOWN -> PaddleTrajectory startTime (constants.paddleSpeed * -1.0) pos
            NEUTRAL -> PaddleTrajectory startTime 0.0 pos 
            _ -> state.traj


updateMotion :: Time -> PaddleState -> PaddleState
updateMotion time state = state {pos = posAtTime state.traj time}

-- By just defining the startime, speed, and position values...
-- we always get the full trajectory functions :D


type PaddleState = 
    {
        pos :: Position,
        traj :: PaddleTrajectory
    }
