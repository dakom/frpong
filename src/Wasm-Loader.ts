import * as loadWasm from "./lib.rs";

export const getWasm = () => 
    loadWasm().then(wasm => {
        return wasm.instance.exports; 
    })
