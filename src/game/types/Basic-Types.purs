module Game.Types.Basic where

type Time = Number

type Point =
    {
        x :: Number,
        y :: Number
    }

type Position = Point
type Velocity = Point
type Speed = Number

type Area =
    {
        width :: Number,
        height :: Number
    }

