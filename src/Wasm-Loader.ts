const PATH = "../target/frpong";


export async function getWasm() {
    const wasm = await import(PATH);
    return wasm;
}
