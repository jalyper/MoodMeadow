import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getAudioContext, } from '../audioContext';

const DraggableSound = ({ sound, isDropped }) => {
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

  const playSound = () => {
    console.log('playSound function called');
  
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('Audio context resumed');
        fetchAndPlayAudio();
      }).catch(e => console.error('Error resuming audio context:', e));
    } else {
      fetchAndPlayAudio();
    }
  };
  
  // This function fetches the audio file and plays it
  const fetchAndPlayAudio = () => {
    const newAudioElement = new Audio(sound.src);
    console.log('Sound src:', sound.src);
    
    setAudioElement(newAudioElement);
    const trackSrc = audioCtx.createMediaElementSource(newAudioElement);
    trackSrc.connect(audioCtx.destination);

    newAudioElement.play().then(() => {
      setIsPlaying(true);
      console.log('Audio element:', newAudioElement);
      console.log('Ready state:', newAudioElement.readyState);
      console.log('Paused:', newAudioElement.paused);
      console.log('Volume:', newAudioElement.volume);
      console.log('Muted:', newAudioElement.muted);
      console.log('Audio context state:', audioCtx.state);
    }).catch(e => {
      console.error('Error playing sound:', e);
    });
  };
  
  const stopSound = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null); // Clean up the audio element
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