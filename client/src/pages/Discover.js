import React, { useState, useEffect } from 'react';
import Arranger from '../components/Arranger';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getAudioContext, resumeAudioContext } from '../audioContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CommunityArrangementList from '../components/CommunityArrangementList';
import LoginLogoutButton from '../components/LoginLogoutButton';

function Discover() {
  const audioCtx = getAudioContext();
  const [audioNodes, setAudioNodes] = useState({});
  const [droppedSounds, setDroppedSounds] = useState(Array(5).fill(null));
  const [isLooping, setIsLooping] = useState(false);
  const [, setIsPlaying] = useState(false);
  const [communityArrangements, setCommunityArrangements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArrangements, setFilteredArrangements] = useState([]);
  const [lastLoadedArrangement, setLastLoadedArrangement] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchPublicArrangements = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/userArrangements/public-arrangements`);
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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArrangements(communityArrangements);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = communityArrangements.filter(arrangement => {
        const hasMatchingSound = arrangement.sounds.some(sound =>
          sound && sound.name && sound.name.toLowerCase().includes(lowercasedTerm)
        );
        const createdByMatches = arrangement.userId && arrangement.userId.username && arrangement.userId.username.toLowerCase().includes(lowercasedTerm);
        return hasMatchingSound || createdByMatches;
      });
      setFilteredArrangements(filtered);
    }
  }, [searchTerm, communityArrangements]);
  
  // Function to play all sounds
  const playAllSounds = () => {
    // If the audio context is suspended
    if (audioCtx.state === 'suspended') {
      // Resume the audio context
      resumeAudioContext().then(() => {
        // Log a success message
        console.log('Playback resumed successfully');
        // For each audioNode
        Object.values(audioNodes).forEach((audioNode) => {
          // If the audioNode exists and has a trackSrc property with a mediaElement
          if (audioNode && audioNode.trackSrc && audioNode.trackSrc.mediaElement) {
            // Play the mediaElement
            audioNode.trackSrc.mediaElement.play();
          }
        });
        // Set isPlaying to true
        setIsPlaying(true);
      });
    } 
  };

  const stopAllSounds = () => {
    Object.keys(audioNodes).forEach(key => {
      if (audioNodes[key] && audioNodes[key].audioElement) {
        audioNodes[key].audioElement.pause();
        audioNodes[key].audioElement.currentTime = 0; // Reset the audio to the start
      }
    });
    setIsPlaying(false);
  };
  
  const clearLoadedSounds = () => {
    stopAllSounds();
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
    setLastLoadedArrangement(null);
  };
  

  const handleLoadArrangement = (arrangement) => {
    // Start with an empty object for newAudioNodes
    let newAudioNodes = {};
  
    // Map over the arrangement's sounds
    arrangement.sounds.forEach((sound, index) => {
      if (sound) {
        // Create a new Audio object with the sound source
        const audioElement = new Audio(sound.src);
        // Set the loop property of the audio element to the value of isLooping
        audioElement.loop = isLooping;
        // Create a new MediaElementAudioSourceNode from the audio element
        const trackSrc = audioCtx.createMediaElementSource(audioElement);
        // Create a new GainNode to control the volume of the audio
        const gainNode = audioCtx.createGain();
        // Create a new StereoPannerNode to control the panning of the audio
        const pannerNode = audioCtx.createStereoPanner();

        // Connect the nodes in the following order: trackSrc -> gainNode -> pannerNode -> destination
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

    // Update the lastLoadedArrangement state
    setLastLoadedArrangement(arrangement);
    console.log(arrangement);
  };


    
  // This function is used to save the currently loaded arrangement to the user's library
  const handleSaveToLibrary = async () => {
    // Set the initial save status
    setSaveStatus('Saving...');
    try {
      // Log the function call
      console.log('handleSaveToLibrary called');

      // Retrieve the user's token from local storage
      const token = localStorage.getItem('token');
      console.log(`Retrieved token from local storage: ${token}`);

      // Check if an arrangement is currently loaded
      if (!lastLoadedArrangement) {
        console.log('lastLoadedArrangement is null or undefined');
      } else {
        console.log('lastLoadedArrangement is not null or empty');
        console.log(lastLoadedArrangement);
      }

      // If the user is logged in and an arrangement is loaded
      if (token && lastLoadedArrangement) {
        console.log('User is logged in and an arrangement is selected');

        try {
          console.log('Sending POST request to save arrangement');

          // Send a POST request to save the arrangement
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/userLibraries/save`, {arrangement: lastLoadedArrangement }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log(`Received response with status code: ${response.status}`);

          // If the arrangement was saved successfully
          if (response.status === 201) {
            console.log('Saved successfully!');
            setSaveStatus('Saved successfully!');
            // Clear the currently loaded arrangement
            setLastLoadedArrangement(null);
          }

        } catch (error) {
          // If the arrangement already exists in the library
          if (error.response && error.response.status === 409) {
            console.log('Arrangement already exists in library');
            setSaveStatus('Arrangement already exists in library');
          } else {
            // If there was an error saving the arrangement
            console.error('Saving failed. Error: ', error);
            setSaveStatus('Saving Failed!');
          }
        }
      } else {
        // If the user is not logged in
        if (!token) {
          console.warn('User is not logged in.');
          setSaveStatus('You must log in to save arrangements.');
        }
        // If no arrangement is loaded
        if (!lastLoadedArrangement) {
          console.warn('No arrangement is selected.');
          setSaveStatus('You must select an arrangement to save.');
        }
      }
    } catch (error) {
      // If there was an error in the function
      console.error('Saving failed. Error: ', error);
      setSaveStatus('Saving Failed!');
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

          <div className='right-header-content'>
            <LoginLogoutButton />
            <Link to="/" className="icon-link">
              <div className="home-icon">
                <span className="icon-text">Home</span><br />
              </div>
            </Link>
          </div>
          
        </header>
        <div className="community-arrangements">
          <h3 className='community-arrangements-title'>Community Arrangements</h3>
            <CommunityArrangementList 
                arrangements={filteredArrangements} 
                onSelect={handleLoadArrangement} 
            />
        </div>
        
        <div className="player-discover-page">
        <h2 className="player-title-discover-page">PLAYER</h2>
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
            <button onClick={stopAllSounds} className="stop-button">Stop</button>
            <button onClick={clearLoadedSounds} className="clear-button">Clear</button>
            <button onClick={handleSaveToLibrary} className="save-to-library">Save to Library</button>
            <p>{saveStatus}</p>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default Discover;
