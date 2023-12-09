import React, { useState, useEffect } from 'react';
import Arranger from '../components/Arranger';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { audioCtx } from '../audioContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserLibraryList from '../components/UserLibraryList';
import LoginLogoutButton from '../components/LoginLogoutButton';

// other imports...

function MyLibrary() {
  const [audioNodes, setAudioNodes] = useState(Array(5).fill(null));
  const [droppedSounds, setDroppedSounds] = useState(Array(5).fill(null));
  const [isLooping, setIsLooping] = useState(false);
  const [userLibraryArrangements, setUserLibraryArrangements] = useState([]);
  const [selectedArrangement, setSelectedArrangement] = useState(null);
  const [originalAuthor, setOriginalAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch arrangements from the user's library
    const fetchUserLibraryArrangements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/userLibraries`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          // Here you need to make sure you're setting the state with the arrangements array
          setUserLibraryArrangements(response.data.arrangements); // This should now be correct
        }
      } catch (error) {
        console.error('Error fetching user library arrangements', error);
      }
    };
  
    fetchUserLibraryArrangements();
  }, []);
  

  const playAllSounds = () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('Playback resumed successfully');
        Object.values(audioNodes).forEach((audioNode) => {
          if (audioNode && audioNode.trackSrc && audioNode.trackSrc.mediaElement) {
            audioNode.trackSrc.mediaElement.play();
          }
        });
      });
    } else {
      Object.values(audioNodes).forEach((audioNode) => {
        if (audioNode && audioNode.trackSrc && audioNode.trackSrc.mediaElement) {
          audioNode.trackSrc.mediaElement.play();
        }
      });
    }
  };  

  const clearLoadedSounds = () => {
    // Iterate over each audioNode and check if it's not null before accessing properties
    Object.values(audioNodes).forEach((audioNode) => {
      if (audioNode && audioNode.audioElement) {
        audioNode.audioElement.pause();
        audioNode.audioElement.currentTime = 0;
      }
    });
  
    // Reset the state to an array of nulls if you have a fixed number of slots
    setDroppedSounds(Array(5).fill(null));
    // Reset the audioNodes state to an array of nulls to match the initial state structure
    setAudioNodes(Array(5).fill(null));
  };
  

  const handleLoadArrangement = (arrangement) => {
    // Start with an array filled with null values
    let newAudioNodes = Array(5).fill(null);
  
    // Map over the arrangement's sounds, up to the first 5 sounds
    arrangement.sounds.slice(0, 5).forEach((sound, index) => {
      if (sound) {
        const audioElement = new Audio(sound.src);
        audioElement.loop = isLooping; // Assuming isLooping is part of your component's state
        const trackSrc = audioCtx.createMediaElementSource(audioElement);
        const gainNode = audioCtx.createGain();
        const pannerNode = audioCtx.createStereoPanner();
  
        trackSrc.connect(gainNode).connect(pannerNode).connect(audioCtx.destination);
  
        // Set the audio node at the corresponding index
        newAudioNodes[index] = { trackSrc, gainNode, pannerNode, audioElement };
      }
    });
  
    // Update the audioNodes state
    setAudioNodes(newAudioNodes);
  
    // Update the droppedSounds state with the names of the sounds,
    // or null for slots that don't have a sound
    setDroppedSounds(arrangement.sounds.slice(0, 5).map(sound => sound ? sound.name : null));
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
            <Link to="/create" className='icon-link'>
              <div className='create-icon'>
                <h2 className="create-title">CREATE</h2>
              </div>
            </Link>
            <Link to="/my-library" className='icon-link'>
              <div className='my-library-icon'>
                <h2 className="my-library-title" style={{fontSize: 60}}>MY LIBRARY</h2>
              </div>
            </Link>
            <Link to="/discover" className='icon-link'>
              <div className='discover-icon'>
                <h2 className="discover-title">DISCOVER</h2>
              </div>
            </Link>

          </div>

          <Link to="/" className="icon-link">
            <div className="home-icon">
              <span className="icon-text">Home</span><br />
              <LoginLogoutButton />
            </div>
          </Link>
        </header>
        <div className="user-library-arrangements">
          {/* Render user's personal library arrangements */}
          <UserLibraryList 
            arrangements={userLibraryArrangements} // Pass the arrangements array
            onSelect={handleLoadArrangement}
          />
        </div>
        <h2 className="player-title-my-library-page">PLAYER</h2>
        <div className="player-my-library-page">
          {droppedSounds.map((droppedSound, index) => {              
            return (
              <Arranger 
                key={index} 
                onDrop={handleDrop} 
                index={index} 
                droppedSound={droppedSound}
                audioNodes={audioNodes} // Pass the audio node to the Arranger
              /> 
            );
          })}
          <div className="loop-toggle-discover-page">
          <label>
            <input
              type="checkbox"
              checked={isLooping}
              onChange={(e) => setIsLooping(e.target.checked)}
            />
            <b> LOOP</b>
          </label>
          </div>
          <div className='discover-page-button-group'>
            <button onClick={playAllSounds} className='play-all-button'>Play</button>
            <button onClick={clearLoadedSounds} className="clear-button">Clear</button>
          </div>
        </div><br />
        <div className='my-library-summary'><h3>Load a saved arrangement to begin your journey to zen.</h3></div>
      </div>
    </DndProvider>
  );
}

export default MyLibrary;
