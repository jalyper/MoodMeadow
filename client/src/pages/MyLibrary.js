import React, { useState, useEffect } from 'react';
import Arranger from '../components/Arranger';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getAudioContext, resumeAudioContext } from '../audioContext';
import { Link } from 'react-router-dom';
import UserLibraryList from '../components/UserLibraryList';
import LoginLogoutButton from '../components/LoginLogoutButton';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
// other imports...

function MyLibrary() {
  const [audioNodes, setAudioNodes] = useState({});
  const [droppedSounds, setDroppedSounds] = useState(Array(5).fill(null));
  const [isLooping, setIsLooping] = useState(false);
  const [, setIsPlaying] = useState(false);
  const [userLibraryArrangements, setUserLibraryArrangements] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Declare isLoggedIn as a state variable
  const {userId} = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchUserLibraryArrangements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && userId) {
          const response = await fetch(`${process.env.REACT_APP_API_URL_DEV}/userLibraries/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setIsLoggedIn(true); // Set isLoggedIn to true here
            console.log('response.ok: ', response.ok);
            const data = await response.json();
            setUserLibraryArrangements(data.arrangements);
          }
          
          if (!response.ok) {
            localStorage.removeItem('token');
            console.log('token removed');
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        setIsLoggedIn(false); // Set isLoggedIn to false here
        console.error('Error fetching user library arrangements', error);
      }
    };

    if (userId) {
      console.log('fetching user library arrangements');
      fetchUserLibraryArrangements();
    }
  }, [userId, location.pathname]); // Remove isLoggedIn from the dependency array

  useEffect(() => {
    // This effect updates the loop property whenever isLooping or audioNodes change
    Object.keys(audioNodes).forEach(key => {
      if (audioNodes[key] && audioNodes[key].audioElement) {
        audioNodes[key].audioElement.loop = isLooping;
      }
    });
  }, [isLooping, audioNodes]);  

  const playAllSounds = () => {
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') {
      resumeAudioContext().then(() => {
        console.log('Playback resumed successfully');
        Object.values(audioNodes).forEach((audioNode) => {
          if (audioNode && audioNode.trackSrc && audioNode.trackSrc.mediaElement) {
            audioNode.trackSrc.mediaElement.play();
          }
        });
        setIsPlaying(true);
      });
    } else {
      Object.values(audioNodes).forEach((audioNode) => {
        if (audioNode && audioNode.trackSrc && audioNode.trackSrc.mediaElement) {
          audioNode.trackSrc.mediaElement.play();
        }
      });
      setIsPlaying(true);
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
  };
  

  const handleLoadArrangement = (arrangement) => {
    const audioCtx = getAudioContext();
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

  const handleDeleteArrangement = async (arrangement) => {
    console.log('arrangementId: ', arrangement._id);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Assuming the user's ID is stored in local storage
      console.log('userId: ', userId);
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL_DEV}/userLibraries/${userId}/arrangements/${arrangement._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove the deleted arrangement from the userLibraryArrangements state
        setUserLibraryArrangements(userLibraryArrangements.filter((userLibraryArrangement) => userLibraryArrangement._id !== arrangement._id));
      } 
    } catch (error) {
      console.error('Error deleting arrangement', error);
    }
  };

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="my-library-page">
        <header className="my-library-header">
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
          <div className='right-header-content'>
            <LoginLogoutButton isLoggedIn={isLoggedIn} />
            <Link to="/" className="icon-link">
              <div className="home-icon">
                <span className="icon-text">Home</span><br />
              </div>
            </Link>
          </div>
        </header>
        <div className="user-library-arrangements">
          {/* Render user's personal library arrangements */}
          <UserLibraryList 
            arrangements={userLibraryArrangements} // Pass the arrangements array
            onSelect={handleLoadArrangement}
            onDelete={handleDeleteArrangement}
          />
        </div>
    
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
            <button onClick={stopAllSounds} className="stop-button">Stop</button>
            <button onClick={clearLoadedSounds} className="clear-button">Clear</button>
            <p className='loggedIn'>Is Logged In: {String(isLoggedIn)}</p>
          </div>
        </div><br />
        <div className='my-library-summary'><h3>Load a saved arrangement to begin your journey to zen.</h3></div>
      </div>
    </DndProvider>
  );
}

export default MyLibrary;
