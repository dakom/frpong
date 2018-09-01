[![Build Status](https://travis-ci.org/dakom/frpong.svg?branch=master)](https://travis-ci.org/dakom/frpong)


# Work-in-progress... not playable yet!

# [Live Demo](https://dakom.github.io/frpong)
----

FRPong is a proof-of-concept for architecting a game on the web.

# Tech Specs

There are two "threads" via WebWorkers:

## Game thread
* Purescript + SodiumFRP + Rust + Typescript
* Main logic is all Purescript/SodiumFRP
* Rust compiled to WebAssembly for math helpers (i.e. collision detection)
* Physics is proper integration (changes a _function_ to describe motion), not accumulation over time-steps
* Passes the state updates as a single worker message

## IO thread
* Typescript
* Raw WebGL and WebAudio
* The main message broker, and also handles rendering
* Passes input (and tick) updates as a single worker message

# Notes

* Is it over-engineered? I dunno - is there a better way to write games on the web?
* The multi-threading is probably pointless and wasteful in this case, but it doesn't really hurt afaik
* With upcoming offscreenCanvas, might separate rendering into its own thread too
* Different webpack modes ("dev", "build" and "bundle") - as well as travis setup for deployment
* Could use a renderer built for functional pipelines, like [pure3d](https://github.com/dakom/pure3d) ;)
* Since the game state must be serialized in a few places, it might be worth exploring manual serialization via flatbuffers and then using that to transfer across all boundaries (even to the wasm layer)
