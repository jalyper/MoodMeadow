import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableSound from '../components/DraggableSound';
import Arranger from '../components/Arranger';
import { audioCtx } from '../audioContext';
import axios from 'axios';
import LoginRegisterModal from '../components/LoginRegisterModal';
import LoginLogoutButton from '../components/LoginLogoutButton';
import { SoundsContext } from '../contexts/SoundsContext';

function Create() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [user, setUser] = useState(null);
  const { sounds, setSounds } = useContext(SoundsContext);
  const [audioNodes, setAudioNodes] = useState({});
  const [isLooping, setIsLooping] = useState(false);
  const [droppedSounds, setDroppedSounds] = useState(Array(5).fill(null));

  // Step 1: Set isLoggedIn based on token in localStorage
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    // This effect updates the loop property whenever isLooping or audioNodes change
    Object.values(audioNodes).forEach(({ audioElement }) => {
      if (audioElement) {
        audioElement.loop = isLooping;
      }
    });
  }, [isLooping, audioNodes]);

  const playAllSounds = () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('Playback resumed successfully');
        Object.values(audioNodes).forEach(({ trackSrc }) => {
          if (trackSrc && trackSrc.mediaElement) {
            trackSrc.mediaElement.play();
          }
        });
      });
    } else {
      Object.values(audioNodes).forEach(({ trackSrc }) => {
        if (trackSrc && trackSrc.mediaElement) {
          trackSrc.mediaElement.play();
        }
      });
    }
  };

  const filteredSounds = sounds.filter(sound => 
    sound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const clearDroppedSounds = () => {
    Object.values(audioNodes).forEach(({ audioElement }) => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    });

    // Reset the state
    setDroppedSounds(Array(5).fill(null));
    setAudioNodes({}); // Reset the audioNodes state
  };
  
  const handleSaveToLibrary = () => {
    if (!isLoggedIn) {
      console.log('User not logged in, displaying modal...');
      setShowLoginModal(true);
      return;
    }
    // Proceed with saving the arrangement
    saveArrangement(user, sounds);
  };

  const saveArrangement = async () => {
    // Retrieve the token from local storage (or your state management)
    const token = localStorage.getItem('token');
  
    // Check if the droppedSounds array is empty or contains only null or undefined values
    if (!droppedSounds.length || droppedSounds.every(sound => sound == null)) {
      setSaveMessage('Cannot save an empty arrangement. Please add some sounds.');
      return; // Exit the function early if the validation fails
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/userArrangements/save`, {
        sounds: droppedSounds,
        isPrivate: isPrivate,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 201) {
        console.log('Saved to library', response.data);
        setSaveMessage('Arrangement saved successfully!');
        // Additional UI feedback can be provided here
      }
    } catch (error) {
      console.error('Error saving to library', error.response.data);
      setSaveMessage('Failed to save arrangement. Please make sure you are logged in and try again.');
      // Handle errors, possibly show user feedback
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="create-page">  
        <header className="create-header">
          <div className="header-content">
            <input 
              type="text" 
              placeholder="Search for sounds or creators..." 
              className="search-input"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <h2 className="create-title">CREATE</h2>
          </div>

          <Link to="/" className="icon-link">
            <div className="home-icon">
              <span className="icon-text">Home</span><br />
              <LoginLogoutButton />
            </div>
            
          </Link>
        </header>

        <div className="sound-sample-container">
          <p className="drag-and-drop-summary">
            Drag sounds to the Arranger on the left to create your own ASMR Arrangement!  <br /><span style={{fontSize:20, color:'white'}}>You can play each sound independently to preview sounds and experiment.<br />Once you drag a sound over, you'll 
            be able to change the pan and volume of each sound to your own satisfaction!</span>
          </p>
          <div class="sort-by-buttons">
            Sort by: 
            <button className="sort-by-name-button">NAME (A-Z)</button> 
            <button className="sort-by-popularity-button">MOST POPULAR</button> 
            <button className="sort-by-age-button">UPLOAD DATE (NEWEST TO OLDEST)</button>
          </div>
            {filteredSounds.map((sound) => (
              <DraggableSound 
                key={sound.id} 
                sound={sound}
                isDropped={droppedSounds.includes(sound.id)} 
              />
            ))}
        </div>
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
          {droppedSounds.map((droppedSound, index) => (
            <Arranger 
              key={index} 
              onDrop={handleDrop} 
              index={index} 
              droppedSound={droppedSound} 
              audioNodes={audioNodes}
            />
          ))}
        </div>
        <label className="make-private-checkbox">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <b> Make Private</b>
        </label>    
        <button onClick={handleSaveToLibrary} className="save-to-library">Save to Library</button>    
        <LoginRegisterModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} setIsLoggedIn={setIsLoggedIn} />
        <button onClick={playAllSounds} className="play-all-button">Play</button>
        <button onClick={clearDroppedSounds} className="clear-button">Clear</button>
        {saveMessage && <div className="saved-to-library-result"> {saveMessage}</div>}
        <p className="save-to-library-summary">You can save your arrangement to your Library, where you can choose to publish it to the Discover page for the Mood Meadow community to experience!</p>
      </div>
    </DndProvider>
  );
}

export default Create;
