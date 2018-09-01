module Game.Utils.Sodium where

import Prelude
import Effect (Effect)
import Data.Maybe (Maybe (..), isJust, fromJust)
import Partial.Unsafe (unsafePartial)
import SodiumFRP.Class (Stream, Cell)
import SodiumFRP.Stream (filter, accum)
import SodiumFRP.Cell (sample)
import SodiumFRP.Operational (updates)

justStream :: forall a. Stream (Maybe a) -> Stream a
justStream sMaybe = unsafePartial fromJust <$> filter isJust sMaybe

accumSingleHistory :: forall a. Cell a -> Effect (Cell (SingleHistory a))
accumSingleHistory cValue = do
    initialValue <- sample cValue
    let sValue = updates cValue
    pure $ accum onUpdate {prev: initialValue, curr: initialValue} sValue
    where
          onUpdate :: a -> SingleHistory a -> SingleHistory a
          onUpdate value state = 
              {
                prev: state.curr,
                curr: value
              }

delaySingle :: forall a. Cell a -> Effect (Cell a)
delaySingle cValue = do
    cHistory <- accumSingleHistory cValue
    pure $ (\update -> update.prev) <$> cHistory

type SingleHistory a = 
    {
        prev :: a,
        curr :: a
    }

