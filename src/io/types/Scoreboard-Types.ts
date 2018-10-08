export interface Scoreboard {
    addPoint: (player:1 | 2) => void;
    getScore: (player: 1 | 2) => number;
}



