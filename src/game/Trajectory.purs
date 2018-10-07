module Game.Trajectory where

import Prelude
import Game.Types.Basic
import Game.Constants
import Game.FFI

{-
    These instances allow the game loop to only care about providing data

    The math is in the Rust/Webassembly trajectory.rs file
-}

class Trajectory a where
    posAtTime :: a -> PosAtTime 
    timeAtX :: a -> TimeAtX 
    timeAtY :: a -> TimeAtY 

type PosAtTime = Time -> Position
type TimeAtX = Number -> Time
type TimeAtY = Number -> Time

getXforY :: forall traj. Trajectory traj => traj -> Number -> Number
getXforY traj y = pos.x
    where
        pos = posAtTime traj (timeAtY traj y) 

getYforX :: forall traj. Trajectory traj => traj -> Number -> Number
getYforX traj x = pos.y
    where
        pos = posAtTime traj (timeAtX traj x) 

data BallTrajectory = BallTrajectory Time Speed Velocity Position
instance ballTrajectory :: Trajectory BallTrajectory where

    posAtTime (BallTrajectory startTime speed vel pos) = 
        \t -> {
            x:  ball_traj_pos t (vel.x * speed) pos.x startTime, 
                
            y:  ball_traj_pos t (vel.y * speed) pos.y startTime 
        }
    timeAtX (BallTrajectory startTime speed vel pos) =
        \x -> ball_traj_time x (vel.x * speed) pos.x startTime

    timeAtY (BallTrajectory startTime speed vel pos) =
        \y -> ball_traj_time y (vel.y * speed) pos.y startTime

data PaddleTrajectory = PaddleTrajectory Time Speed Position
instance paddleTrajectory :: Trajectory PaddleTrajectory where
    posAtTime (PaddleTrajectory startTime speed pos) =
        \t -> {
            x: pos.x,
            y: paddle_traj_pos t speed pos.y startTime paddleBottomY paddleTopY
        }
    timeAtX (PaddleTrajectory startTime speed pos) = 
        \x -> startTime -- kinda arbitrary
    timeAtY (PaddleTrajectory startTime speed pos) =
        \y -> paddle_traj_time y speed pos.x startTime


data DynamicTrajectory = DynamicTrajectory PosAtTime TimeAtX TimeAtY
instance dynamicTrajectory :: Trajectory DynamicTrajectory where
    posAtTime (DynamicTrajectory f1 _ _ ) = \t -> f1 t
    timeAtX (DynamicTrajectory _ f2 _) = \t -> f2 t
    timeAtY (DynamicTrajectory _ _ f3) = \t -> f3 t

