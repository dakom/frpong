module Game.Collision (getCollision, getCollisionAudioName) where

import Prelude
import Effect (Effect)
import Effect.Console (logShow)
import Effect.Unsafe (unsafePerformEffect)
import Data.Maybe (Maybe(..))
import Control.Alternative((<|>))
import SodiumFRP.Class (Stream, Cell, listen)
import SodiumFRP.Stream (snapshot, snapshot3, snapshot5, hold)
import Game.Constants
import Game.Types.Collision
import Game.Types.Environment
import Game.Types.Paddle
import Game.Types.Basic
import Game.Utils.Sodium
import Game.Trajectory

getCollision :: Stream Time -> Cell Position -> Cell PaddleTrajectory -> Cell Position -> Cell BallTrajectory -> Effect (Stream Collision)
getCollision sTick cPaddlePosition cPaddleTrajectory cBallPosition cBallTrajectory = do
    cBallPositionHistory <- accumSingleHistory cBallPosition 
    let sMaybeCollision = snapshot5 getCollision' sTick cPaddlePosition cPaddleTrajectory cBallPositionHistory cBallTrajectory
    pure $ justStream sMaybeCollision

{-
    Collision detection happens in two steps:
    1. See if the ball collided
    2. Move the collision point back in time to where it really intersected 

    TODO : Paddle 2 Collision
-}
getCollision' :: Time -> Position -> PaddleTrajectory -> SingleHistory Position -> BallTrajectory -> Maybe Collision 
getCollision' time paddlePosition paddleTraj ballPositionHistory ballTraj = paddle1Collision <|> paddle2Collision <|> wallCollision
    where
        ballPosition = ballPositionHistory.curr
        ballDiff = 
            {
                x: ballPosition.x - ballPositionHistory.prev.x,
                y: ballPosition.y - ballPositionHistory.prev.y
            }
        ballRadius = constants.ballRadius
        topWall = constants.canvasHeight - ballRadius
        bottomWall = ballRadius
        rightWall = constants.canvasWidth - ballRadius
        leftWall = ballRadius
        halfPaddleHeight = constants.paddleHeight / 2.0

        paddle1Collision = getPaddleCollision 
        paddle2Collision = Nothing

        {-
            Paddle/Ball collision uses motion over the timespan between ticks
            If the ball has gone past the paddle's x threshhold, the following happens:
                1. Get both the time and y-coordinate for when the ball arrived at paddle-x 
                2. Use this time to get the paddle's y coordinate at that same moment
                3. Detect collision (paddle at that time and ball at that time)
                4. Collision info includes the time difference compared to current time, and hit point
                5. This info will ultimately be used to create the new trajectory, 
                   thereby "rewinding time" and preventing out-of-bounds errors

            The difference in motion since last update is also checked to prevent bouncing on the back of the paddle

            Finally, the bounce angle is calculated and stored
        -}

        getPaddleCollision :: Maybe Collision
        getPaddleCollision = 
            if ballDiff.x < 0.0 && ballPosition.x < paddleEdge
            then
                let
                    hitPoint = {
                        x: paddleEdge,
                        y: getYforX ballTraj paddleEdge 
                    }
                  
                    timeAtImpact = timeAtX ballTraj paddleEdge
                    timeDiff = time - timeAtImpact

                    paddlePositionAtTime = posAtTime paddleTraj timeAtImpact

                    paddleTop = paddlePositionAtTime.y + halfPaddleHeight + ballRadius
                    paddleBottom = (paddlePositionAtTime.y - halfPaddleHeight) - ballRadius
                   
                
                      -- https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
                    relativeIntersectY = paddlePositionAtTime.y - hitPoint.y
                    normalizedRelativeIntersectionY = (relativeIntersectY/halfPaddleHeight)
                    bounceAngle = normalizedRelativeIntersectionY 
                in
                if hitPoint.y < paddleTop && hitPoint.y > paddleBottom
                then Just (CollisionPaddle Paddle1 {
                          hitPoint,
                          timeDiff,
                          bounceAngle
                })
                else Nothing
            else Nothing
            where
                paddleEdge = paddlePosition.x + (constants.paddleWidth / 2.0) + ballRadius

        {-
            Wall collision is conceptually similar to paddle collision
            Only it's simpler in terms of motion since the walls are static
        -}

        wallCollision :: Maybe Collision 
        wallCollision 
            | ballPosition.y > topWall =    Just (CollisionWall TopWall ({
                                                hitPoint: {
                                                    x: getXforY ballTraj topWall,
                                                    y: topWall
                                                },
                                                timeDiff: time - (timeAtY ballTraj topWall)
                                            }))
            | ballPosition.y < bottomWall = Just (CollisionWall BottomWall ({
                                                hitPoint: {
                                                    x: getXforY ballTraj bottomWall,  
                                                    y: bottomWall
                                                }, 

                                                timeDiff: time - (timeAtY ballTraj bottomWall)
                                            }))
            | ballPosition.x > rightWall =  Just (CollisionWall RightWall ({
                                                hitPoint: {
                                                    x: rightWall,
                                                    y: getYforX ballTraj rightWall
                                                },

                                                timeDiff: time - (timeAtX ballTraj rightWall)
                                            }))
            | ballPosition.x < leftWall =   Just (CollisionWall LeftWall ({
                                                hitPoint: {
                                                    x: leftWall,
                                                    y: getYforX ballTraj leftWall 
                                                },

                                                timeDiff: time - (timeAtX ballTraj leftWall)
                                            }))
            | otherwise = Nothing

-- for sending to external audio player
getCollisionAudioName :: Collision -> String
getCollisionAudioName = case _ of
    CollisionWall TopWall _ -> "topWall"
    CollisionWall LeftWall _ -> "leftWall"
    CollisionWall RightWall _ -> "rightWall"
    CollisionWall BottomWall _ -> "bottomWall"
    CollisionPaddle Paddle1 _ -> "paddle1"
    CollisionPaddle Paddle2 _ -> "paddle2"
