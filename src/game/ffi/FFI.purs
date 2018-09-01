module Game.FFI where

import Effect(Effect)
import Effect.Uncurried (EffectFn1, runEffectFn1)
import Prelude
import Data.Function.Uncurried (
    Fn1,
    Fn2, runFn2, mkFn2, 
    Fn3, runFn3, mkFn3, 
    Fn4, runFn4, mkFn4, 
    Fn5, runFn5, mkFn5,
    Fn6, runFn6, mkFn6,
    Fn7, runFn7
)
import Game.Types.Basic

{-
    The FFI is to interface with the Rust/Webassembly lib

    Although functions can can all be partially applied
    Purescript can optimise when arguments are filled

    See the wasm/Rust code for the actual implementations
    As well as more details on what the names mean etc. 
-}

assignLib :: WasmLib -> Effect Unit
assignLib wasmLib = runEffectFn1 assignLibImpl wasmLib

ball_traj_pos :: Number -> Number -> Number -> Number -> Number
ball_traj_pos t v p i = runFn4 ball_traj_posImpl t v p i

ball_traj_time :: Number -> Number -> Number -> Number -> Number
ball_traj_time n v p i = runFn4 ball_traj_timeImpl n v p i

paddle_traj_pos :: Number -> Number -> Number -> Number -> Number -> Number -> Number 
paddle_traj_pos t s p i bl tl = runFn6 paddle_traj_posImpl t s p i bl tl 

paddle_traj_time :: Number -> Number -> Number -> Number -> Number
paddle_traj_time n s p i = runFn4 paddle_traj_timeImpl n s p i

foreign import data WasmLib :: Type
foreign import assignLibImpl :: EffectFn1 WasmLib Unit

foreign import ball_traj_posImpl :: Fn4 Number Number Number Number Number 
foreign import ball_traj_timeImpl :: Fn4 Number Number Number Number Number 
foreign import paddle_traj_posImpl :: Fn6 Number Number Number Number Number Number Number
foreign import paddle_traj_timeImpl :: Fn4 Number Number Number Number Number 
