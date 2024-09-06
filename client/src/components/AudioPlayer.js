import React, { useState, useEffect, useContext } from 'react';
import { SoundsContext } from '../contexts/SoundsContext';

function AudioPlayer({ 
    currentAudio, 
    setCurrentAudio, 
    currentlyPlayingName,
    setCurrentlyPlayingName,
    audioNodes
  }) {
    const [progress, setProgress] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const { sounds } = useContext(SoundsContext);

    useEffect(() => {
        if (currentAudio && currentAudio instanceof Audio) {
            currentAudio.loop = isLooping;
            currentAudio.onended = () => setIsPlaying(false);
        } else if (audioNodes) {
            Object.values(audioNodes).forEach(node => {
                if (node.audioElement && node.audioElement instanceof Audio) {
                    node.audioElement.loop = isLooping;
                }
            });
        }
    }, [currentAudio, audioNodes, isLooping]);

    const handlePlayStop = () => {
        if (currentAudio) {
          if (isPlaying) {
            currentAudio.pause();
            setCurrentlyPlayingName("NEW ARRANGEMENT");
          } else {
            currentAudio.play();
            // The name should already be set when the sound was selected to play
          }
          setIsPlaying(!isPlaying);
        } else if (audioNodes) {
          Object.values(audioNodes).forEach(node => {
            if (node.audioElement) {
              if (isPlaying) {
                node.audioElement.pause();
              } else {
                node.audioElement.play();
              }
            }
          });
          setIsPlaying(!isPlaying);
          setCurrentlyPlayingName(isPlaying ? "NEW ARRANGEMENT" : "Current Arrangement");
        }
    };

    const handleLoop = () => {
        setIsLooping(!isLooping);
        if (currentAudio && currentAudio instanceof Audio) {
            currentAudio.loop = !isLooping;
        }
        if (audioNodes) {
            Object.values(audioNodes).forEach(node => {
                if (node.audioElement && node.audioElement instanceof Audio) {
                    node.audioElement.loop = !isLooping;
                }
            });
        }
    };

    useEffect(() => {
        const updateProgress = () => {
            if (currentAudio && currentAudio.duration) {
                setProgress((currentAudio.currentTime / currentAudio.duration) * 100);
            }
        };

        const intervalId = setInterval(updateProgress, 1000);
        return () => clearInterval(intervalId);
    }, [currentAudio]);

    return (
        <div className='audio-player'>
          <button className='play-stop-btn' onClick={handlePlayStop}>
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <div className='progress-bar'>
            <div className='progress' style={{width: `${progress}%`}}></div>
          </div>
          <div className="loop-btn">
            <label>
              <input
                type="checkbox"
                checked={isLooping}
                onChange={handleLoop}
              />
              <b> LOOP</b>
            </label>
          </div>
          <p>{currentlyPlayingName}</p>
        </div>
    );
}

export default AudioPlayer;