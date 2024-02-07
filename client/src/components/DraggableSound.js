import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getAudioContext, } from '../audioContext';

const DraggableSound = ({ sound, isDropped }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    const newAudioElement = new Audio();
    setAudioElement(newAudioElement);

    if (audioCtx) { // If the audio context already exists, connect the new audio element to it
      const newTrackSrc = audioCtx.createMediaElementSource(newAudioElement);
      newTrackSrc.connect(audioCtx.destination);
    } 

    return () => {
      if (audioCtx) { // If the audio context exists, disconnect the new audio element from it
        newTrackSrc.disconnect();
      }
      newAudioElement.pause();
    };
  }, [audioCtx]); // Add audioCtx to the dependency array

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sound',
    item: { id: sound.id, name: sound.name, src: sound.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const playSound = () => {
    console.log('playSound function called');
  
    // Create the AudioContext when the button is clicked
    const newAudioCtx = getAudioContext();
    setAudioCtx(newAudioCtx); // Set the state variable

    if (newAudioCtx.state === 'suspended') {
      newAudioCtx.resume().then(() => {
        console.log('Audio context resumed');
        fetchAndPlayAudio(newAudioCtx);
      }).catch(e => console.error('Error resuming audio context:', e));
    } else {
      fetchAndPlayAudio(newAudioCtx);
    }
  };
  
  // This function fetches the audio file and plays it
  const fetchAndPlayAudio = (audioCtx) => {
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
        console.log('Blob:', blob);
        audioElement.src = URL.createObjectURL(blob);
        audioElement.oncanplaythrough = () => {
          audioElement.play().then(() => {
            setIsPlaying(true);
            console.log('Audio element:', audioElement);
            console.log('Ready state:', audioElement.readyState);
            console.log('Paused:', audioElement.paused);
            console.log('Volume:', audioElement.volume);
            console.log('Muted:', audioElement.muted);
            console.log('Audio context state:', audioCtx.state);
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