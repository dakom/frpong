module Game.Collision (getCollision, getCollisionAudioName) where

import Prelude
import Effect (Effect)
import Effect.Console (logShow)
import Effect.Unsafe (unsafePerformEffect)
import Data.Maybe (Maybe(..))
import Math (pi)
import Control.Alternative((<|>))
import SodiumFRP.Class (Stream, Cell, listen)
import SodiumFRP.Stream (snapshot, snapshot3, snapshot4, snapshot5, hold, orElse)
import SodiumFRP.Transaction (runTransaction)
import Game.Constants
import Game.Types.Collision
import Game.Types.Environment
import Game.Types.Paddle
import Game.Types.Basic
import Game.Utils.Sodium
import Game.Trajectory
import Game.Paddles

type PaddleInput =
    {
        cPosition :: Cell Position,
        cTrajectory :: Cell PaddleTrajectory 
    }
type BallInput =
    {
        cPosition :: Cell Position,
        cTrajectory :: Cell BallTrajectory 
    }

type Paddles =
    {
        paddle1Pos :: Position,
        paddle1Traj :: PaddleTrajectory,
        paddle2Pos :: Position,
        paddle2Traj :: PaddleTrajectory
    }

getCollision :: Stream Time -> PaddleInput -> PaddleInput -> BallInput -> Effect ({sCollision :: Stream Collision, sAiCollision :: Stream Position})
getCollision sTick paddle1 paddle2 ball = runTransaction do 
    cBallPositionHistory <- accumSingleHistory ball.cPosition 
    
    let sWallCollision = justStream $ snapshot3 getWallCollision sTick ball.cPosition ball.cTrajectory 

    let sPaddle1Collision = justStream $ snapshot5 (getPaddleCollision Paddle1) sTick cBallPositionHistory ball.cTrajectory paddle1.cPosition paddle1.cTrajectory 
    let sPaddle2Collision = justStream $ snapshot5 (getPaddleCollision Paddle2) sTick cBallPositionHistory ball.cTrajectory paddle2.cPosition paddle2.cTrajectory 
   
    let sAiCollision = justStream $ snapshot3 getEventualAiCollision sTick cBallPositionHistory ball.cTrajectory

    pure {
        sCollision: orElse sPaddle1Collision (orElse sPaddle2Collision sWallCollision),
        sAiCollision 
    }



{-
    Collision detection happens in two steps:
    1. See if the ball collided
    2. Move the collision point back in time to where it really intersected 
-}
       
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

getPaddleCollision :: Paddle -> Time -> SingleHistory Position -> BallTrajectory -> Position -> PaddleTrajectory -> Maybe Collision
getPaddleCollision paddleType time ballPositionHistory ballTraj paddlePosition paddleTraj = 
    if isPossiblyValid 
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
            bounceAngle = case paddleType of
                Paddle1 -> normalizedRelativeIntersectionY 
                Paddle2 -> pi - normalizedRelativeIntersectionY 

        in
        if hitPoint.y < paddleTop && hitPoint.y > paddleBottom
            then Just (CollisionPaddle paddleType { hitPoint, timeDiff, bounceAngle })
               
            else Nothing
    else Nothing
    where
        ballPosition = ballPositionHistory.curr
        ballRadius = constants.ballRadius
        halfPaddleHeight = constants.paddleHeight / 2.0
        ballDiff = 
            {
                x: ballPosition.x - ballPositionHistory.prev.x,
                y: ballPosition.y - ballPositionHistory.prev.y
            }

        isPossiblyValid = case paddleType of
            Paddle1 -> ballDiff.x < 0.0 && ballPosition.x < paddleEdge
            Paddle2 -> ballDiff.x > 0.0 && ballPosition.x > paddleEdge
        paddleEdge = getPaddleEdge paddleType paddlePosition 

{-
    Wall collision is conceptually similar to paddle collision
    Only it's simpler in terms of motion since the walls are static
-}


getWallCollision :: Time -> Position -> BallTrajectory -> Maybe Collision 
getWallCollision time ballPosition ballTraj
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


-- doesn't need to be perfect for paddle, wall target is good enough
getEventualAiCollision :: Time -> SingleHistory Position -> BallTrajectory -> Maybe Position
getEventualAiCollision time ballHistory ballTraj
    | (ballHistory.curr.x - ballHistory.prev.x) > 0.0 = Just { x: rightWall, y: getYforX ballTraj rightWall }
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

