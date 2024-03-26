import React, { useState, useContext } from 'react';
import { SoundsContext } from '../contexts/SoundsContext'; // Make sure to import your SoundsContext

function AudioPlayer({ currentAudio, setCurrentAudio, arrangementName, setArrangementName, audioNodes }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLooping, setIsLooping] = useState(false);

    const { sounds } = useContext(SoundsContext); // Use the SoundsContext

    const handleLoop = () => {
        if (audioNodes) {
            audioNodes.forEach(node => {
                if (node.source) {
                node.source.loop = !node.source.loop;
                }
            });
        }
    };

    const handlePlayStop = () => {
        if (audioNodes) {
            if (isPlaying) {
                audioNodes.forEach(node => {
                    if (node.source) {
                        node.source.stop();
                    }
                });
            } else {
                audioNodes.forEach(node => {
                    if (node.source) {
                        try {
                            node.source.loop = isLooping;
                            node.source.start();
                        } catch (error) {
                            console.error('Failed to start audio', error);
                        }
                    }
                });
            }
        }

        setIsPlaying(!isPlaying);
    };

    return (
        <div className='audio-player'>
            <button className='play-stop-btn' onClick={handlePlayStop}>
                {isPlaying ? 'Stop' : 'Play'}
            </button>
            <div className='progress-bar'>
                <div className='progress'></div>
            </div>
            <div className="loop-btn">
                <label>
                    <input
                    type="checkbox"
                    checked={isLooping}
                    onChange={(e) => setIsLooping(e.target.checked)}
                    />
                    <b> LOOP</b>
                </label>
            </div>
            <p>{arrangementName || "NEW ARRANGEMENT"}</p>
        </div>
    );
}

export default AudioPlayer;