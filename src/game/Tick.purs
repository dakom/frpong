module Game.Tick where 

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

getTicks :: Stream Time 
            -> Stream Collision
            -> Stream String 
            -> Stream String 
            ->  Effect {
                    sBall :: Stream Tick,
                    sPaddle1 :: Stream Tick,
                    sPaddle2 :: Stream Tick
                }
getTicks sTime sCollisionValue sController1String sController2String = do
    let sTick = (\time -> PlainTick time) <$> sTime
    cTime <- hold sTime 0.0

    let sCollision = getCollisionTick cTime sCollisionValue
    let sController1 = getControllerTick cTime sController1String
    let sController2 = getControllerTick cTime sController2String
    pure {
        sBall : orElse sController1 (orElse sCollision sTick),
        sPaddle1 : orElse sController1 (orElse sCollision sTick),
        sPaddle2 : orElse sController2 (orElse sCollision sTick)
    }


getCollisionTick :: Cell Time -> Stream Collision -> Stream Tick
getCollisionTick cTime sCollisionValue =
        snapshot CollisionTick sCollisionValue cTime

getControllerTick :: Cell Time -> Stream String -> Stream Tick
getControllerTick cTime sControllerString = sController
    where
        sController = snapshot (\controller time -> ControllerTick controller time) sControllerValue cTime
        sControllerValue = justStream (convertController <$> sControllerString)

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


