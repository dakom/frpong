module Game.Ball (getBall) where

import Prelude
import Effect (Effect)
import Effect.Console (logShow)
import Data.Maybe (Maybe (..), fromJust, isJust, isNothing)
import Data.Either (Either (..))
import Math (cos, sin)
import SodiumFRP.Class (Stream, Cell, newCellLoop, toCell, listen)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Stream (accum, orElse, snapshot)
import SodiumFRP.Operational (defer)
import SodiumFRP.Cell (loopCell)
import Game.Types.Basic
import Game.Types.Ball
import Game.Types.Controller
import Game.Types.Collision
import Game.Types.Environment
import Game.Types.Tick
import Game.Tick
import Game.Trajectory
import Game.Constants
-- get ball
getBall ::  Stream Tick 
            -> {
                cPosition :: Cell Position,
                cTrajectory :: Cell BallTrajectory
               }

getBall sTick =
    {
        cPosition: (\ball -> ball.pos) <$> cBallState,
        cTrajectory: (\ball -> ball.traj) <$> cBallState
    }
    where
        initialPosition = {x: constants.canvasWidth / 2.0, y: constants.canvasHeight / 2.0}
        initialVelocity = {x: 0.0, y: 0.0}
        initialBall = 
            {
                pos: initialPosition,
                vel: initialVelocity, 
                traj: BallTrajectory 0.0 constants.ballSpeed initialVelocity initialPosition
            }
        cBallState = accum updateBall initialBall sTick

{-
    A ball update is one of three things:
    1. Serve (triggered by controler)
    2. Regular motion update (function of time)
    3. Collision update (motion update after physics update)
-}

updateBall :: Tick -> BallState -> BallState
updateBall tick originalState = case tick of
    (PlainTick time) ->
        updateMotion time originalState 
    (ControllerTick controller time) -> case controller of
        SERVE -> beginServe time 
        _ -> updateMotion time originalState 
    (CollisionTick collision time) -> 
        updateVelocity collision originalState #
        updateTrajectory collision time #
        updateMotion time
    where
        -- TODO - might be able to simplify with lenses
        updateMotion :: Time -> BallState -> BallState
        updateMotion time state = state {pos = updateMotion' time state.traj}

        updateVelocity :: Collision -> BallState -> BallState 
        updateVelocity collision state = state {vel = updateVelocity' collision state.vel}

        updateTrajectory :: Collision -> Time -> BallState -> BallState
        updateTrajectory collision time state = state {traj = updateTrajectory' collision time state.vel}
{-
    Position is a function of current trajectory at given time
-}
updateMotion' :: Time -> BallTrajectory -> Position 
updateMotion' time traj = 
    posAtTime traj time

{-
    Velocity is the current velocity with updated values based on collision type 
-} 
updateVelocity' :: Collision -> Velocity -> Velocity
updateVelocity' collision vel = case collision of
    CollisionWall TopWall _ -> {x: vel.x, y: vel.y * -1.0}
    CollisionWall BottomWall _ -> {x: vel.x, y: vel.y * -1.0}
    CollisionWall LeftWall _ -> {x: vel.x * -1.0, y: vel.y}
    CollisionWall RightWall _ -> {x: vel.x * -1.0, y: vel.y}
    -- https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
    CollisionPaddle _ info -> 
        {
            x: (cos info.bounceAngle),
            y: -(sin info.bounceAngle)
        }
{-
    BallTrajectory formula is set in the typeclass (see Trajectory.purs)
    Data which is set here is determined by current ball physics and collision info
-}
updateTrajectory' :: Collision -> Time -> Velocity -> BallTrajectory
updateTrajectory' collision time vel = 
    BallTrajectory startTime constants.ballSpeed vel hitPoint
    where
        startTime = time - info.timeDiff
                            
        hitPoint = info.hitPoint
        info = case collision of
            -- TODO : should be able to match on any _ _
            CollisionWall _ info -> {hitPoint: info.hitPoint, timeDiff: info.timeDiff} 
            CollisionPaddle _ info -> {hitPoint: info.hitPoint, timeDiff: info.timeDiff} 

beginServe :: Time -> BallState
beginServe startTime = 
        {
            pos, 
            vel,
            traj: BallTrajectory startTime constants.ballSpeed vel pos
        }
    where
        pos = {x: constants.canvasWidth / 2.0, y: constants.canvasHeight / 2.0}
        vel = {x: 0.5, y: 0.5} -- todo: make random



type BallState =
    {
        pos :: Position,
        traj :: BallTrajectory,
        vel :: Velocity
    }
