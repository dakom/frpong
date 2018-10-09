function start(mymod: typeof import("../target/frpong")) {
    console.log("All modules loaded");
    return mymod;
}

export async function getWasm() {
    return start(await import("../target/frpong"));
}

