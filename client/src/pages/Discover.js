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

  useEffect(() => {
    // This effect updates the loop property whenever isLooping or audioNodes change
    Object.keys(audioNodes).forEach(key => {
      if (audioNodes[key] && audioNodes[key].audioElement) {
        audioNodes[key].audioElement.loop = isLooping;
      }
    });
  }, [isLooping, audioNodes]);  

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
    // Start with an empty object for newAudioNodes
    let newAudioNodes = {};
  
    // Map over the arrangement's sounds
    arrangement.sounds.forEach((sound, index) => {
      if (sound) {
        const audioElement = new Audio(sound.src);
        audioElement.loop = isLooping;
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
          console.log('Saved successfully!');
        }
      } catch (error) {
        console.log('Saving failed. Error: ', error);
        // Handle errors, such as showing a message to the user
      }
    } else {
      console.log('Login failed.');
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
            <input 
              type="text" 
              placeholder="Search for sounds or creators..." 
              className="search-input"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link to="/my-library" className='icon-link'>
              <div className='my-library-icon'>
                <h2 className="my-library-title">MY LIBRARY</h2>
              </div>
            </Link>
            <Link to="/discover" className='icon-link'>
              <div className='discover-icon'>
                <h2 className="discover-title" style={{fontSize: 60}}>DISCOVER</h2>
              </div>
            </Link>
            <Link to="/create" className='icon-link'>
              <div className='create-icon'>
                <h2 className="create-title">CREATE</h2>
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
        <div className="community-arrangements">
          <h3 className='community-arrangements-title'>Community Arrangements</h3>
            <CommunityArrangementList 
                arrangements={communityArrangements} 
                onSelect={handleLoadArrangement} 
            />
        </div>
        
        <div className="arranger-discover-page">
        <h2 className="arranger-title-discover-page">ARRANGER</h2>
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
            <button onClick={playAllSounds} className="play-all-button">Play</button>
            <button onClick={clearLoadedSounds} className="clear-button">Clear</button>
            <button onClick={handleSaveToLibrary} className="save-to-library">Save to Library</button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default Discover;
