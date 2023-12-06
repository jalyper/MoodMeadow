import React, { useState, useEffect } from 'react';
import Arranger from '../components/Arranger';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { audioCtx } from '../audioContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CommunityArrangementList from '../components/CommunityArrangementList';
import LoginLogoutButton from '../components/LoginLogoutButton';

// other imports...

function Discover() {
  const [audioNodes, setAudioNodes] = useState({});
  const [droppedSounds, setDroppedSounds] = useState(Array(5).fill(null));
  const [isLooping, setIsLooping] = useState(false);
  const [communityArrangements, setCommunityArrangements] = useState([]);
  const [selectedArrangement, setSelectedArrangement] = useState(null);
  const [originalAuthor, setOriginalAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch community arrangements from your backend and set state
    const fetchPublicArrangements = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/userArrangements/public-arrangements`);
        setCommunityArrangements(response.data);
      } catch (error) {
        console.error('Error fetching public arrangements', error);
      }
    };

    fetchPublicArrangements();
  }, []);

  const handleArrangementSelect = (arrangement) => {
    // Clear any existing audio nodes
    setAudioNodes({});
  
    // Initialize an array with null values for each of the 5 slots
    let newDroppedSounds = Array(5).fill(null);
    
    // Replace nulls with actual sound names if they exist in the arrangement
    newDroppedSounds = newDroppedSounds.map((_, index) => {
      return arrangement.sounds[index] ? arrangement.sounds[index].name : null;
    });
  
    // Update the droppedSounds state with the names of the sounds
    setDroppedSounds(newDroppedSounds);
  
    // Create new audio elements and nodes for the sounds
    const newAudioNodes = newDroppedSounds.reduce((nodes, soundName, index) => {
      if (soundName) {
        // Find the sound object by name from the arrangement to get the src
        const sound = arrangement.sounds.find(s => s.name === soundName);
  
        if (sound && sound.src) {
          const audioElement = new Audio(sound.src);
          audioElement.loop = isLooping;
          const trackSrc = audioCtx.createMediaElementSource(audioElement);
          const gainNode = audioCtx.createGain();
          const pannerNode = audioCtx.createStereoPanner();
  
          trackSrc.connect(gainNode).connect(pannerNode).connect(audioCtx.destination);
  
          nodes[index] = { trackSrc, gainNode, pannerNode, audioElement };
        }
      }
      return nodes;
    }, {});
  
    // Update the audioNodes state with new audio nodes
    setAudioNodes(newAudioNodes);
  };  

  const handleSaveToLibrary = async () => {
    // Assuming you have the token and selectedArrangement is an object with the arrangement data
    const token = localStorage.getItem('token');
    if (token && selectedArrangement) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/userArrangements/save`, {
          sounds: selectedArrangement.sounds, // assuming this is an array of sound names or IDs
          isPrivate: false, // assuming you want to save it as public by default
          originalArrangementId: selectedArrangement._id, // reference to the original arrangement
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.status === 201) {
          // Handle successful save, maybe a message to the user
        }
      } catch (error) {
        // Handle errors, such as showing a message to the user
      }
    } else {
      // Handle the case where the user is not logged in
    }
  };  

  const handleDrop = (item, slotIndex) => {
    const newDroppedSounds = [...droppedSounds];
    newDroppedSounds[slotIndex] = item.name;
    setDroppedSounds(newDroppedSounds);
  
    // Only create new audio elements and nodes if they don't already exist for the slot
    if (!audioNodes[slotIndex]) {
      const audioElement = new Audio(item.src);
      audioElement.loop = isLooping; // Set loop based on isLooping state
      const trackSrc = audioCtx.createMediaElementSource(audioElement);
      const gainNode = audioCtx.createGain();
      const pannerNode = audioCtx.createStereoPanner();
  
      trackSrc.connect(gainNode).connect(pannerNode).connect(audioCtx.destination);
  
      // Update the audioNodes state with new audio nodes
      setAudioNodes(prevNodes => ({
        ...prevNodes,
        [slotIndex]: { trackSrc, gainNode, pannerNode, audioElement }
      }));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="discover-page">
        <header className="discover-header">
          <div className="header-content">
            <h1>DISCOVER</h1>
          </div>
          <Link to="/" className="icon-link">
            <div className="home-icon">
              <span className="icon-text">Home</span><br />
              <LoginLogoutButton />
            </div>
          </Link>
        </header><br />
        <input 
          type="text" 
          placeholder="Search for sounds or creators..." 
          className="search-input"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        /><br />
        <div className="community-arrangements">
            <CommunityArrangementList 
                arrangements={communityArrangements} 
                onSelect={handleArrangementSelect} 
            />
            
        </div>
        <div className="discover-arranger">
          <h2 className="arranger-title">ARRANGER</h2>
          <div className="loop-toggle">
            <label>
              <input
                type="checkbox"
                checked={isLooping}
                onChange={(e) => setIsLooping(e.target.checked)}
              />
              <b> LOOP</b>
            </label>
            
          </div>

          <div className="arranger">
            {droppedSounds.map((droppedSoundName, index) => {
              // Find the audio node for the current sound name
              const audioNode = audioNodes[index];
              
              return (
                <Arranger 
                  key={index} 
                  onDrop={handleDrop} 
                  index={index} 
                  droppedSound={droppedSoundName}
                  audioNode={audioNode} // Pass the audio node to the Arranger
                />
              );
            })}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default Discover;
