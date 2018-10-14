module Game.Types.Collision where

import Prelude
import Game.Types.Environment
import Game.Types.Paddle
import Game.Types.Basic

data Collision = CollisionWall Wall WallCollisionInfo | CollisionPaddle Paddle PaddleCollisionInfo

type CollisionInfo r = 
    {
        hitPoint :: Position,
        timeDiff :: Time 
        | r
    }

type AnyCollisionInfo = CollisionInfo ()

type WallCollisionInfo = CollisionInfo ()

type PaddleCollisionInfo = CollisionInfo (
    bounceAngle :: Number
)

instance showCollision :: Show Collision where
    show = case _ of
        CollisionWall wall info -> "collision with wall: " <> show wall <> show info
        CollisionPaddle paddle info -> "collision with paddle: " <> show paddle <> show info

getCollisionInfo :: Collision -> AnyCollisionInfo
getCollisionInfo (CollisionWall _ info) = info 
getCollisionInfo (CollisionPaddle _ info) = {hitPoint: info.hitPoint, timeDiff: info.timeDiff} 
