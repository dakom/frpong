import {Constants, Scoreboard, Renderer} from "io/types/Types";
import {updateScoreboardTexture} from "io/renderer/textures/Textures";

export const createScoreboard = (constants:Constants) => (renderer:Renderer):Scoreboard => {
    let score = {
        1: 0,
        2: 0
    }

    const getScore = (player: 1 | 2) => score[player];

    const addPoint = (player: 1 | 2) => {
        score[player]++;
        updateTextures();

    }

    const updateTextures = () => {
        const scoreText = getScore(1) + " | " + getScore(2);
        updateScoreboardTexture (constants) (renderer.gl) (scoreText);
    }

    updateTextures();

    return {
        addPoint,
        getScore
    }
}


