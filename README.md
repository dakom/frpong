[![Build Status](https://travis-ci.org/dakom/frpong.svg?branch=master)](https://travis-ci.org/dakom/frpong)


# Work-in-progress... not playable yet!

# [Live Demo](https://dakom.github.io/frpong)
----

FRPong is a proof-of-concept for architecting a game on the web.

## Controls

* Serve Ball: **Space**
* Move Paddle: **up/w** or **down/s**

# Tech Specs

## Game (via WebWorker)

* Purescript + SodiumFRP + Rust + Typescript glue
* Main logic is all Purescript and SodiumFRP
* Solves collision, out-of-bounds checking, and interpenetration adjustments by using time and history
* Physics is done by changing _functions_ to derive motion, not per-tick numerical accumulation 
* Rust/WebAssembly is mostly just a proof of concept and used for math helpers

## IO (entrypoint) 

* Raw WebGL renderer
* WebAudio synth 
* Passes input controller and tick updates 
* Typescript

# Future ideas
* Better / genuine AI (all the data is there, just gotta use it!)
* With upcoming offscreenCanvas support, might separate rendering into its own thread too
* Could use a renderer built for functional pipelines, like [pure3d](https://github.com/dakom/pure3d)
* Showcase more power of WebGL/WebAudio - though it's easy to get carried away once that door is opened ;)
  * Tentative ideas: 
  * [] bloom+CRT+barrel distortion w/ TV graphic border
  * [] spatial audio
  * [] particle emitter on collision points


# Misc Notes

* Experimental and purposefully over-engineered - though I dunno, this also kinda feels like a cool starting point? 
* The multi-threading is probably pointless and wasteful in this case, but it doesn't really hurt afaik
* Different webpack modes ("dev", "build" and "bundle") - as well as travis setup for deployment
* It might be worth exploring state serialization via flatbuffers and then using that to transfer across all boundaries (even to the wasm layer)
