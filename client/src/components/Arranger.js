import { useDrop } from 'react-dnd';

const Arranger = ({ onDrop, index, droppedSound, audioNodes, setAudioNodes }) => {
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
    if (audioNodes[index] && audioNodes[index].audioElement) {
      const volume = e.target.value;
      audioNodes[index].audioElement.volume = volume;
      setAudioNodes({...audioNodes});
    }
  };

  const handlePanChange = (e) => {
    if (audioNodes[index] && audioNodes[index].audioElement) {
      const pan = e.target.value;
      const pannerNode = audioNodes[index].audioElement.context.createStereoPanner();
      pannerNode.pan.value = pan;
      audioNodes[index].audioElement.disconnect();
      audioNodes[index].audioElement.connect(pannerNode).connect(audioNodes[index].audioElement.context.destination);
      setAudioNodes({...audioNodes});
    }
  };

  return (
    <div ref={drop} className={`sound-slot ${isOver && canDrop ? 'over' : ''}`}>
      {droppedSound ? (
        <div className="dropped-sound-text">{droppedSound}</div>
      ) : "Empty slot"}
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
  );
};

export default Arranger;