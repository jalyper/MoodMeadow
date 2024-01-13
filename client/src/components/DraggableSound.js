import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { audioCtx } from '../audioContext';

const DraggableSound = ({ sound, isDropped }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [, setTrackSrc] = useState(null);

  useEffect(() => {
    // Create the audio element and source node once on mount
    const newAudioElement = new Audio(sound.src);
    setAudioElement(newAudioElement);

    const newTrackSrc = audioCtx.createMediaElementSource(newAudioElement);
    newTrackSrc.connect(audioCtx.destination);
    setTrackSrc(newTrackSrc);

    // Clean up the audio node on unmount
    return () => {
      newTrackSrc.disconnect();
      newAudioElement.pause();
    };
  }, [sound.src]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sound',
    item: { id: sound.id, name: sound.name, src: sound.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const playSound = () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        audioElement.play();
        setIsPlaying(true);
      });
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const stopSound = () => {
    audioElement.pause();
    audioElement.currentTime = 0;
    setIsPlaying(false);
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
