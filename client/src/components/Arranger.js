import { useRef } from 'react';
import { useDrop } from 'react-dnd';

const Arranger = ({ onDrop, index, droppedSound, audioNodes }) => {
  const audioRef = useRef();  // Create a ref for the audio element

  // Check if audioNodes[index] is not null or undefined
  const isValidAudioNode = audioNodes[index] && audioNodes[index].audioElement;

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'sound',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
      onDrop(item, index);
      console.log(`Dropped sound ${item.id} into slot ${index + 1}`);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const handleVolumeChange = (e) => {
    if (audioNodes[index] && audioNodes[index].gainNode) {
      const volume = e.target.value;
      audioNodes[index].gainNode.gain.value = volume;
    }
  };
  
  const handlePanChange = (e) => {
    if (audioNodes[index] && audioNodes[index].pannerNode) {
      const pan = e.target.value;
      audioNodes[index].pannerNode.pan.value = pan;
    }
  };

  return (
    <div ref={drop} className={`sound-slot ${isOver && canDrop ? 'over' : ''}`}>
      {droppedSound && isValidAudioNode ? (
        <>
          <div className="dropped-sound-text">{droppedSound}</div>
          <audio ref={audioRef} src={audioNodes[index].audioElement.src} loop={true} hidden />
          <div className="controls">
            <label className='volume-label'>
              Volume:
              <input 
                className="volume-control"
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="1"
                onChange={handleVolumeChange}
              />
            </label>
            <label className='pan-label'>
              Pan:
              <input 
                className="pan-control"
                type="range"
                min="-1"
                max="1"
                step="0.01"
                defaultValue="0"
                onChange={handlePanChange}
              />
            </label>
          </div>
        </>
      ) : "Empty slot"}
    </div>
  );
};

export default Arranger;
