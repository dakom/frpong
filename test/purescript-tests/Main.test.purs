module Test.Main where

import Prelude
import Effect (Effect)
import Test.Unit (suite, test)
import Test.Unit.Assert as Assert
import Test.Unit.Main (runTest)


main :: Effect Unit
main = runTest do
    suite "[main]" do
        test "sanity check" do
           Assert.equal 2 2 
