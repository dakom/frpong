export interface State {
    startTime: number;
    tick?: Tick;
}

export interface Tick {
    lastTime: number;
    deltaTime: number;
    elapsedTime: string;
}
