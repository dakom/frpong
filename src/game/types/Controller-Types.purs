module Game.Types.Controller where

import Prelude
import Game.Types.Basic

data Controller = UP | DOWN | NEUTRAL | SERVE

instance showController :: Show Controller where
    show = case _ of
        UP -> "up"
        DOWN -> "down"
        NEUTRAL -> "neutral"
        SERVE -> "serve"

derive instance eqController :: Eq Controller 

