import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { getAudioContext, } from '../audioContext';

const DraggableSound = ({ sound, isDropped, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [audioCtx, setAudioCtx] = useState(getAudioContext());

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sound',
    item: { id: sound.id, name: sound.name, src: sound.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handlePlayStop = () => {
    console.log('handlePlayStop function called');
    if (!audioCtx) {
      setAudioCtx(getAudioContext());
    }
    if (isPlaying) {
      stopSound();
    } else {
      playSound();
    }
  };

  const playSound = async () => {
    console.log('playSound function called');
    const audio = await onPlay(sound.src);
    console.log('Sound src: ', sound.src);
    audio.onplay = () => {
      console.log('Audio started playing');
    };
    setAudioElement(audio);
    setIsPlaying(true);
  };

  const stopSound = () => {
    console.log('stopSound function called');
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null); // Clean up the audio element
    } else {
      setIsPlaying(false);
    }
  };

  console.log('Render method: isPlaying = ', isPlaying);

  return (
    <div ref={drag} className={`sound-sample ${isDropped ? 'grayed-out' : ''}`} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {sound.name}
      <p />
      <button onClick={handlePlayStop} className="play-stop-sound-sample">{isPlaying ? 'Stop' : 'Play'}</button>
    </div>
  );
};

export default DraggableSound;