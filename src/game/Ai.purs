module Game.Ai where

import Prelude
import Effect (Effect)
import Effect.Unsafe (unsafePerformEffect)
import Effect.Random
import Data.Maybe (Maybe (..))
import Data.Either (Either (..))
import SodiumFRP.Class (Stream, Cell, newCellLoop, toCell)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Stream (orElse, accum, snapshot3, filter)
import SodiumFRP.Operational (updates)
import SodiumFRP.Cell (loopCell)
import Game.Constants
import Game.Types.Basic
import Game.Types.Paddle
import Game.Types.Controller
import Game.Types.Tick
import Game.Trajectory
import Game.Tick

getAiTick ::    Stream Tick 
                -> Cell Position
                ->  {
                        cPosition :: Cell Position,
                        cTrajectory :: Cell BallTrajectory
                    }
                -> Stream Tick
getAiTick sTick cPaddlePos ball = updates cUpdate
    where 
          cUpdate = accum getUpdate (PlainTick 0.0) sTickWithPos
          sTickWithPos = snapshot3 (\tick paddlePos ballPos -> {tick, paddlePos, ballPos}) sTick cPaddlePos ball.cPosition


getUpdate :: TickWithPos -> Tick -> Tick
getUpdate inTick state = tick
    where 
        tick = updatedTick
        time = (toTime inTick.tick)
        updatedTick = if sameType newTick state then PlainTick time else newTick
        newTick = if ballY < posY then ControllerTick DOWN time
                  else if ballY > posY then ControllerTick UP time
                  else ControllerTick NEUTRAL time
        ballY = inTick.ballPos.y
        posY = inTick.paddlePos.y

-- sUpdate (snapshot getUpdate sDelayTick ball.cPosition


-- just a convenience wrapper
type TickWithPos = 
    {
        tick :: Tick,
        paddlePos :: Position,
        ballPos :: Position
    }
