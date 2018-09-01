module Game.Types.Environment where

import Prelude
data Wall = TopWall | LeftWall | BottomWall | RightWall

instance showWall :: Show Wall where
    show = case _ of
        TopWall -> "top"
        LeftWall -> "left"
        BottomWall -> "bottom"
        RightWall -> "right"
