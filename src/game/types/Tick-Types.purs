module Game.Types.Tick where

import Prelude
import Game.Types.Basic
import Game.Types.Controller
import Game.Types.Collision

data Tick = PlainTick Time 
            | ControllerTick Controller Time
            | CollisionTick Collision Time

instance showTick :: Show Tick where
    show = case _ of
        PlainTick time -> show time
        ControllerTick controller time -> show controller <> " " <> show time
        CollisionTick collision time -> show collision <> " " <> show time

