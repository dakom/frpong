function start(mymod: typeof import("../target/frpong")) {
    return mymod;
}

export async function getWasm() {
    return start(await import("../target/frpong"));
}

