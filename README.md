[![Build Status](https://travis-ci.org/dakom/frpong.svg?branch=master)](https://travis-ci.org/dakom/frpong)


# [Live Demo](https://dakom.github.io/frpong)
----

FRPong is a proof-of-concept for architecting a game on the web using a combo of technologies.

Specifically, a mixture of Purescript, SodiumFRP, Rust/Wasm, Typescript, WebGL/WebAudio/WebWorkers, etc.

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
* CRT shader effect taken from [libretro](https://github.com/libretro/glsl-shaders/blob/master/crt/shaders/crt-pi.glsl) (only looks good on largish window size)

# Future ideas

* With upcoming offscreenCanvas support, might separate rendering into its own thread too
* Could use a renderer built for functional pipelines, like [pure3d](https://github.com/dakom/pure3d)
* Train AI against human data (would require hundreds of hours of playing...)
* Library idea - automatically adapt all the libretro shaders for easy swapping

# Misc Notes

* Experimental and purposefully over-engineered - though I dunno, this also kinda feels like a cool starting point? 
* The multi-threading is probably pointless and wasteful in this case, but it doesn't really hurt afaik
* Different webpack modes ("dev", "build" and "bundle") - as well as travis setup for running tests 
* It might be worth exploring state serialization via flatbuffers and then using that to transfer across all boundaries (even to the wasm layer)
