import {Renderable} from "./Renderable-Types";

export interface Paddle extends Renderable {
    width: number;
    height: number;
}

export interface Ball extends Renderable {
    radius: number;
}

