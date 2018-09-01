import * as loadWasm from "./lib.rs";

interface Point {
    x: number;
    y: number;
}

export const getWasm = () => 
    loadWasm().then(wasm => {
        return wasm.instance.exports; 
    })
