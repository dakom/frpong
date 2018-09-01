module Game.Types.Paddle where

import Game.Types.Basic
import Prelude

data Paddle = Paddle1 | Paddle2

instance showPaddle :: Show Paddle where
    show = case _ of
        Paddle1 -> "paddle1"
        Paddle2 -> "paddle2"

