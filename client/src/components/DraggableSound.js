import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getAudioContext, } from '../audioContext';

const DraggableSound = ({ sound, isDropped }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const audioCtx = getAudioContext();

  useEffect(() => {
    const newAudioElement = new Audio();
    setAudioElement(newAudioElement);

    const newTrackSrc = audioCtx.createMediaElementSource(newAudioElement);
    newTrackSrc.connect(audioCtx.destination);

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
  
    // This will ensure that the audio context is resumed only when this function is called
    // due to a user action (like clicking the "Play" button)
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
    const filename = sound.src.split('/').pop();
    console.log(`Filename: ${filename}`);
    const token = localStorage.getItem('token'); // replace with your actual JWT token
    console.log(`Token: ${token}`);
  
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
  
    const requestOptions = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
    };
  
    console.log('Request options:', requestOptions);
  
    fetch(`/.netlify/functions/get-file/${filename}`, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        audioElement.src = URL.createObjectURL(blob);
        audioElement.oncanplaythrough = () => {
          audioElement.play().then(() => {
            setIsPlaying(true);
          }).catch(e => {
            console.error('Error playing sound:', e);
          });
        };
      })
      .catch(e => console.error('Error fetching or playing sound:', e));
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