import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableSound from '../components/DraggableSound';
import Arranger from '../components/Arranger';
import LoginRegisterModal from '../components/LoginRegisterModal';
import LoginLogoutButton from '../components/LoginLogoutButton';
import { SoundsContext } from '../contexts/SoundsContext';
import { getAudioContext, resumeAudioContext } from '../audioContext';

function Create() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [user] = useState(null);
  const { sounds } = useContext(SoundsContext);
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
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') {
      resumeAudioContext().then(() => {
        console.log('Playback resumed successfully');
        Object.values(audioNodes).forEach(({ audioElement }) => {
          if (audioElement && audioElement.src) { // Check if the src is truthy before playing
            audioElement.play().catch(e => console.error('Error playing sound:', e));
          }
        });
      }).catch(e => console.error('Error resuming audio context:', e));
    } else {
      Object.values(audioNodes).forEach(({ audioElement }) => {
        if (audioElement && audioElement.src) { // Check if the src is truthy before playing
          audioElement.play().catch(e => console.error('Error playing sound:', e));
        }
      });
    }
  };
  
  const filteredSounds = sounds.filter(sound => 
    sound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDrop = (item, slotIndex) => {
    const audioCtx = getAudioContext();
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
    const token = localStorage.getItem('token');

    if (!droppedSounds.length || droppedSounds.every(sound => sound == null)) {
      setSaveMessage('Cannot save an empty arrangement. Please add some sounds.');
      return;
    }

    // Map sound URLs to sound objects
    const soundObjects = droppedSounds
      .filter(soundName => soundName)
      .map(soundName => {
        const fullSoundObject = sounds.find(sound => sound.name === soundName);
        return fullSoundObject || null;
      })
      .filter(soundObject => soundObject);
    console.log(soundObjects);

    // Define helper function to post data to an endpoint
    const postArrangement = async (endpoint, data) => {
      try {
        const response = await fetch(`/.netlify/functions/userArrangements`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.status === 201) {
          console.log(`Saved to ${endpoint}`, await response.json());
          // Update UI feedback based on which endpoint was successful
        }
      } catch (error) {
        console.error(`Error saving to ${endpoint}`, error.message);
        // Update UI feedback based on which endpoint had an error
      }
    };

    // Prepare the data for userArrangements, including the isPrivate property
    const userArrangementsData = {
      sounds: soundObjects,
      isPrivate: isPrivate, // Only for userArrangements
    };

    // Prepare the data for userLibraries, without the isPrivate property
    const userLibrariesData = {
      arrangement: {
        sounds: soundObjects,
      }
    };
    try {
      // Save to userArrangements
      const userArrangementsResponse = await postArrangement('/.netlify/functions/userArrangements', userArrangementsData);

      // Check if the request was successful
      if (userArrangementsResponse.status !== 200) {
        throw new Error('Failed to save to userArrangements');
      }

      // Save to userLibraries
      const userLibrariesResponse = await postArrangement('/.netlify/functions/userLibraries', userLibrariesData);

      // Check if the request was successful
      if (userLibrariesResponse.status !== 200) {
        throw new Error('Failed to save to userLibraries');
      }

      // Set final save message for the user
      setSaveMessage('Arrangement saved!');
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      setSaveMessage('Saving Failed!');
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
            <Link to="/discover" className='icon-link'>
              <div className='discover-icon'>
                <h2 className="discover-title">DISCOVER</h2>
              </div>
            </Link>
            <Link to="/create" className='icon-link'>
              <div className='create-icon'>
                <h2 className="create-title" style={{fontSize: 60}}>CREATE</h2>
              </div>
            </Link>
            <Link to="/my-library" className='icon-link'>
              <div className='my-library-icon'>
                <h2 className="my-library-title">MY LIBRARY</h2>
              </div>
            </Link>
          </div>
          <div className='right-header-content'>
            <LoginLogoutButton />
            <Link to="/" className="icon-link">
              <div className="home-icon">
                <span className="icon-text">Home</span><br />
              </div>
            </Link>
          </div>
        </header>

        <div className="sound-sample-container">
          <p className="drag-and-drop-summary">
            Drag sounds to the Arranger on the left to create your own ASMR Arrangement!  <br /><span style={{fontSize:20, color:'white'}}>You can play each sound independently to preview sounds and experiment.<br />Once you drag a sound over, you'll 
            be able to change the pan and volume of each sound to your own satisfaction!</span>
          </p>
          <div className="sort-by-buttons">
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

        <div className="arranger-create-page">
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
        <p className="save-to-library-summary">If you'd like to share your creation with the Mood Meadow community, click Save to Library with "Make Private" unchecked!</p>
      </div>
    </DndProvider>
  );
}

export default Create;
