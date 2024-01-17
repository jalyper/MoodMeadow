import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getAudioContext, resumeAudioContext } from '../audioContext';

const DraggableSound = ({ sound, isDropped }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const audioCtx = getAudioContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Create the audio element and source node once on mount
    const newAudioElement = new Audio();
    setAudioElement(newAudioElement);

    const newTrackSrc = audioCtx.createMediaElementSource(newAudioElement);
    newTrackSrc.connect(audioCtx.destination);

    // Clean up the audio node on unmount
    return () => {
      newTrackSrc.disconnect();
      newAudioElement.pause();
    };
  }, [audioCtx]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sound',
    item: { id: sound.id, name: sound.name, src: sound.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const playSound = () => {
      console.log('playSound function called');
      resumeAudioContext();
      const filename = sound.src.split('/').pop();
      console.log(`Filename: ${filename}`);
      const token = localStorage.getItem('token'); // replace with your actual JWT token
      console.log(`Token: ${token}`);

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);

      const requestOptions = {
        method: 'GET',
        headers: headers,
      };

      console.log('Request options:', requestOptions);

      const playAudio = () => {
        console.log('playAudio function called');
        fetch(`/.netlify/functions/get-file?filename=${filename}`, requestOptions)
          .then(response => {
            console.log('Response received:', response);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Response data:', data);
            audioElement.src = data.url;
            audioElement.oncanplaythrough = () => {
              audioElement.play();
              setIsPlaying(true);
            };
          })
          .catch(e => console.error('Error playing sound:', e));
      };

      if (audioCtx.state === 'suspended') {
        console.log('Audio context is suspended, resuming...');
        audioCtx.resume().then(playAudio).catch(e => console.error('Error resuming audio context:', e));
      } else {
        playAudio();
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