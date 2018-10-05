module Game.Tick (getTick, sameType, toTime, isTickController, isTickCollision, isTickPlain) where 

import Prelude
import Effect (Effect)
import Data.Maybe (Maybe (..))
import SodiumFRP.Class (Stream, Cell)
import SodiumFRP.Transaction (runTransaction)
import SodiumFRP.Stream (hold, orElse, filter, snapshot, collect)
import Game.Types.Controller
import Game.Types.Basic
import Game.Types.Tick
import Game.Types.Collision
import Game.Utils.Sodium

getTick :: Stream Time -> Stream String -> Stream Collision -> Effect (Stream Tick)
getTick sTime sControllerString sCollisionValue = do
    cTime <- hold sTime 0.0 -- 0.0 is arbitrary since events are after first tick
    let sTick = (\time -> PlainTick time) <$> sTime
    let sController = getController sControllerString cTime
    let sCollision = getCollision sCollisionValue cTime 
    pure $ orElse sController (orElse sCollision sTick)

-- helper for just working with straight time values
toTime :: Tick -> Time
toTime = case _ of
    PlainTick time -> time
    ControllerTick _ time -> time
    CollisionTick _ time -> time

-- would be nice to generalise these logger helpers... not sure how yet
isTickController :: Tick -> Boolean
isTickController = case _ of
    ControllerTick _ _ -> true
    _ -> false

isTickCollision :: Tick -> Boolean
isTickCollision = case _ of
    CollisionTick _ _ -> true
    _ -> false

isTickPlain :: Tick -> Boolean
isTickPlain = case _ of
    PlainTick _ -> true
    _ -> false

-- get the controller with the most recent tick timestamp
getController :: Stream String -> Cell Time -> Stream Tick 
getController sControllerString cTime =
    snapshot (\controller time -> ControllerTick controller time) sController cTime
    where
          sController = justStream (convertController <$> sControllerString)


-- get the collision with the most recent tick timestamp
getCollision :: Stream Collision -> Cell Time -> Stream Tick 
getCollision sCollision cTime =
    snapshot (\collision time -> CollisionTick collision time) sCollision cTime

-- controller values come in as a string, so they should be validated
convertController :: String -> Maybe Controller
convertController = case _ of
    "up" -> Just UP
    "down" -> Just DOWN
    "neutral" -> Just NEUTRAL
    "serve" -> Just SERVE
    _ -> Nothing

-- there might be some way to derive this, not sure
sameType :: Tick -> Tick -> Boolean
sameType (PlainTick _) (PlainTick _) = true 
sameType (ControllerTick t1 _) (ControllerTick t2 _) = if t1 == t2 then true else false
sameType (CollisionTick _ _) (CollisionTick _ _) = true
sameType _ _ = false


