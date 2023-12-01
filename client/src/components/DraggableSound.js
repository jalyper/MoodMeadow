import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { audioCtx } from '../audioContext'; // Make sure the path is correct

const DraggableSound = ({ sound, isDropped }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sound',
    item: { id: sound.id, name: sound.name, src: sound.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const playSound = () => {
    // Create a new audio element and source node each time we play a sound
    // Only create a new Audio if it has not been created before
    if (!audioElement) {
      const newAudioElement = new Audio(sound.src);
      const trackSrc = audioCtx.createMediaElementSource(newAudioElement);
      trackSrc.connect(audioCtx.destination);
      setAudioElement(newAudioElement);
  
      // We need to wait for the state update, so we use the callback form of the play method
      newAudioElement.onloadeddata = () => {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => {
            console.log('Playback resumed successfully');
            newAudioElement.play();
            setIsPlaying(true); // Set the playing state to true
          });
        } else {
          newAudioElement.play();
          setIsPlaying(true); // Set the playing state to true
        }
      };
    } else {
      // If audioElement already exists, we check if the context is suspended and play it
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          console.log('Playback resumed successfully');
          audioElement.play();
          setIsPlaying(true); // Set the playing state to true
        });
      } else {
        audioElement.play();
        setIsPlaying(true); // Set the playing state to true
      }
    }
  };

  const stopSound = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div ref={drag} className={`sound-sample ${isDropped ? 'grayed-out' : ''}`} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {sound.name}
      <p />
      <button onClick={playSound} className="play-sound-sample" disabled={isPlaying}>Play</button>
      <button onClick={stopSound} className="stop-sound-sample" disabled={!isPlaying}>Stop</button>
    </div>
  );
};

export default DraggableSound;
