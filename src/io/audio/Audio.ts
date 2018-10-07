const createContext = () => {
	const ctor = window.AudioContext || window.webkitAudioContext || undefined;
	if (!ctor) {
    alert("Sorry, but the Web Audio API is not supported by your browser.");
	}
  
  return new ctor();
}

const ctx = createContext();

const playWave = hz => time => {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(hz, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();

    setTimeout(() => oscillator.stop(), time);
}

//This is per-file - gets an AudioBuffer from raw data (i.e. ArrayBuffer)
const decodeAudioBuffer = (rawData) =>
	ctx.decodeAudioData(rawData);

//Load raw data as an arraybuffer from somewhere - this has nothing to do with audio
const loadFile = (url) => 
	fetch(url)
  	.then(resp => resp.arrayBuffer())

export const playCollision = (collisionName) => {
    switch(collisionName) {
        case "paddle1": 
        case "paddle2": playWave(440) (100); break;
        case "leftWall": playWave(110) (200); break;
        case "rightWall": playWave(880) (200); break;
        default: playWave(320) (100); break;
    }
}
