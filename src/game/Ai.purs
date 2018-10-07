
module Game.Ai (getAiPaddle) where

import Prelude
import Effect (Effect)
import Data.Maybe (Maybe (..))
import Data.Either (Either (..))
import SodiumFRP.Class (Stream, Cell, newCellLoop, toCell)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Stream (orElse, hold, accum, snapshot)
import SodiumFRP.Operational (defer)
import SodiumFRP.Cell (loopCell)
import Game.Constants
import Game.Types.Basic
import Game.Types.Paddle
import Game.Types.Controller
import Game.Types.Tick
import Game.Trajectory
import Game.Tick
import Game.FFI


-- Get a paddle
getAiPaddle ::  Stream Tick 
                -> {
                    cPosition :: Cell Position,
                    cTrajectory :: Cell BallTrajectory
                }
                -> Effect {
                     cPosition :: Cell Position,
                     cTrajectory :: Cell DynamicTrajectory
                   }

getAiPaddle sTick ball = runTransaction do
    cPositionLoop <- newCellLoop
    let cTrajectory = getTrajectory <$> (toCell cPositionLoop) <*> ball.cTrajectory
    let sPosition = snapshot (\time traj -> posAtTime traj time) (toTime <$> sTick) cTrajectory
    hold sPosition initialPosition >>= loopCell cPositionLoop

    pure {
        cPosition: (toCell cPositionLoop), 
        cTrajectory
    }
    where
        initialPosition = {x: paddle2x, y: constants.canvasHeight / 2.0}


getTrajectory :: Position -> BallTrajectory -> DynamicTrajectory
getTrajectory currentPos ballTraj = DynamicTrajectory f1 f2 f3
    where
        f1 = \t -> 
            {
                x: paddle2x,
                y: ai_traj_pos currentPos.y (posAtTime ballTraj t).y paddleBottomY paddleTopY
            }
        f2 = \x -> 0.0
        f3 = \y -> (timeAtY ballTraj y)

