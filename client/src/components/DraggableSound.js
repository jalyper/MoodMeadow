import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';

const DraggableSound = ({ sound, isDropped, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(sound.src));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sound',
    item: { id: sound.id, name: sound.name, src: sound.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setIsPlaying(false));
      audio.pause();
    };
  }, []);

  const handlePlayStop = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      console.log('audio:', audio);
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      console.log('isPlaying:', isPlaying);
    } else {
      audio.play().catch(error => console.error('Error playing sound:', error));
      setIsPlaying(true);
      console.log('isPlaying:', isPlaying);
    }
    onPlay(sound, !isPlaying);  // Toggle the isPlaying state
  };

  return (
    <div ref={drag} className={`sound-sample ${isDropped ? 'grayed-out' : ''}`} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {sound.name}
      <p />
      <button onClick={handlePlayStop} className="play-stop-sound-sample">
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
};

export default DraggableSound;