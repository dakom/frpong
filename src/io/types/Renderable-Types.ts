export interface Renderable {
    id: RenderableId;
    x: number;
    y: number;
}

export enum RenderableId {
    BALL = 0, 
    PADDLE1 = 1,
    PADDLE2 = 2
}
