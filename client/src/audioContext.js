// audioContext.js
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

export function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

export function resumeAudioContext() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') {
            return audioCtx.resume();
        }
    }
    return Promise.resolve();
}
