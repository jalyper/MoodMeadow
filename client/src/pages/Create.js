import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableSound from '../components/DraggableSound';
import Arranger from '../components/Arranger';
import LoginRegisterModal from '../components/LoginRegisterModal';
import LoginLogoutButton from '../components/LoginLogoutButton';
import { SoundsContext } from '../contexts/SoundsContext';
import { getAudioContext } from '../audioContext';
import { useAuth } from '../contexts/AuthContext';
import AudioPlayer from '../components/AudioPlayer';


function Create() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [user, setUser] = useState({});
  const {userId} = useAuth();
  const { sounds } = useContext(SoundsContext);
  const [audioNodes, setAudioNodes] = useState({});
  const [isLooping, setIsLooping] = useState(false);
  const [droppedSounds, setDroppedSounds] = useState(Array(5).fill(null));
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingName, setCurrentlyPlayingName] = useState("NEW ARRANGEMENT");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) {
      console.log('Validating JWT...');

      if(userId){
        setUser({ id: userId }); // Set the user state
        setIsLoggedIn(true);
        console.log('Found User ID: ', userId);
      } else {
        setIsLoggedIn(false);
        console.log('User ID could not be found');
      }
    }
  }, [userId]);

  useEffect(() => {
    // This effect updates the loop property whenever isLooping or audioNodes change
    Object.values(audioNodes).forEach(({ audioElement }) => {
      if (audioElement) {
        audioElement.loop = isLooping;
      }
    });
  }, [isLooping, audioNodes]);

  // Global state to keep track of the currently playing audio
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const setCurrentAudioSrc = async (src) => {
    const audio = new Audio(src);
    await audio.play();
    setCurrentAudio(audio); // Use the state update function here
    return audio;
  };

  const handlePlaySound = (sound, isPlaying) => {
    console.log(`Sound ${sound.name} is now ${isPlaying ? 'stopped' : 'playing'}`);
    if (currentlyPlaying) {
      currentlyPlaying.pause();
      currentlyPlaying.currentTime = 0;
    }
  
    // Play the new sound
    const audioElement = new Audio(sound.src);
    audioElement.play().catch(e => console.error('Error playing sound:', e));
  
    // Update the currently playing sound
    setCurrentlyPlaying(audioElement);
    setCurrentlyPlayingName(sound.name);
  };

  const playAllSounds = () => {
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('Playback resumed successfully');
        playAudioNodes();
      }).catch(e => console.error('Error resuming audio context:', e));
    } else {
      playAudioNodes();
    }
    setCurrentlyPlayingName("Current Arrangement");
  };

  const playAudioNodes = () => {
    Object.values(audioNodes).forEach(({ audioElement }) => {
      if (audioElement && audioElement.src) {
        audioElement.play();
      }
    });
    setIsPlaying(true);
  };
  
  const filteredSounds = sounds.filter(sound => 
    sound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDrop = (item, slotIndex) => {
    const newDroppedSounds = [...droppedSounds];
    newDroppedSounds[slotIndex] = item.name;
    setDroppedSounds(newDroppedSounds);

    // Create an Audio object for the dropped sound
    const audio = new Audio(item.src);
    setAudioNodes(prev => ({
      ...prev,
      [slotIndex]: { audioElement: audio }
    }));

    // Set currentAudio to the dropped item's audio object
    setCurrentAudio(audio);
    setCurrentlyPlayingName(item.name);

    // Play the sound
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(error => {
      console.error('Error playing sound:', error);
    });
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

    const soundObjects = droppedSounds
      .filter(soundName => soundName)
      .map(soundName => {
        const fullSoundObject = sounds.find(sound => sound.name === soundName);
        return fullSoundObject || null;
      })
      .filter(soundObject => soundObject);

    let response;
    const postArrangement = async (endpoint, data) => {
      let responseBody;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response) {
          throw new Error('Fetch call did not return a response');
        }

        responseBody = await response.json();
        console.log(`Response from ${endpoint}:`, responseBody);

        if (response.status === 201) {
          console.log(`Saved to ${endpoint}`, responseBody);
        } else {
          console.log(`Received status ${response.status} from ${endpoint}`, responseBody);
        }
      } catch (error) {
        console.error(`Error saving to ${endpoint}`, error.message);
        return { status: 500 };
      }

      return { status: response.status, body: responseBody };
    };

    const userArrangementsData = {
      userId: userId, // Assuming 'user' is available in this scope
      sounds: soundObjects,
      isPrivate: isPrivate, // Assuming all arrangements are public. Change this as needed.
    };

    const userLibrariesData = {
      arrangement: {
        sounds: soundObjects,
      }
    };

    try {
      const userArrangementsResponse = await postArrangement(process.env.REACT_APP_API_URL_DEV + '/userArrangements/save', userArrangementsData);

      if (userArrangementsResponse.status !== 201 && userArrangementsResponse.status !== 200) {
        throw new Error(`Failed to save to userArrangements. Status: ${userArrangementsResponse.status}, Response: ${JSON.stringify(userArrangementsResponse.body)}`);
      }

      const userLibrariesResponse = await postArrangement(process.env.REACT_APP_API_URL_DEV + '/userLibraries/save', userLibrariesData);

      if (userLibrariesResponse.status !== 201 && userLibrariesResponse.status !== 200) {
        throw new Error(`Failed to save to userLibraries. Status: ${userLibrariesResponse.status}, Response: ${JSON.stringify(userLibrariesResponse.body)}`);
      }

      setSaveMessage('Arrangement saved!');
    } catch (error) {
      console.error('Error saving arrangement:', error);
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
              onPlay={handlePlaySound}
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
              currentAudio={currentAudio}
              setCurrentAudio={setCurrentAudio}
              setCurrentlyPlayingName={setCurrentlyPlayingName}
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
        <AudioPlayer 
          currentAudio={currentAudio} 
          setCurrentAudio={setCurrentAudio}
          currentlyPlayingName={currentlyPlayingName}
          setCurrentlyPlayingName={setCurrentlyPlayingName}
          audioNodes={audioNodes}
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
        />
      </div>
    </DndProvider>
  );
}

export default Create;
