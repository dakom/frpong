module Game.Types.Ball where

import Data.Maybe (Maybe)
import Game.Types.Basic
import Game.Types.Collision
import Game.Trajectory

type BallUpdates = 
    {
        velocity :: Velocity,
        collision :: Maybe Collision,
        trajectory :: BallTrajectory,
        position :: Position,
        serve :: Boolean
    }
