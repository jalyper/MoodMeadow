import React from 'react';

function CommunityArrangementList({ arrangements, onSelect }) {

    function showSounds(arrangement) {
        console.log('Showing sounds for arrangement:', arrangement.sounds);
        // Ensure sound is not null before trying to access its properties
        arrangement.sounds.forEach((sound, index) => {
            if (sound) {
                console.log(`Sound ${index + 1}:`, sound.name);
            }
        });
    }

    return (
        <div className="community-arrangements-list">
            {arrangements.map(arrangement => (
                <div 
                    key={arrangement._id} 
                    className="arrangement-item"
                >
                    <p className="created-by-text">Created by: {arrangement.username}</p> 
                    <ul>
                        {arrangement.sounds
                            .filter(sound => sound !== null) // Filter out null values
                            .map((sound, index) => (
                                <li key={index}>sound: {sound.name}</li>
                        ))}
                    </ul>
                    <button onClick={() => showSounds(arrangement)}>Show Sounds --debug--</button>
                    <button onClick={() => onSelect(arrangement)}>Load Arrangement</button>
                </div>
            ))}
        </div>
    );
}

export default CommunityArrangementList;
