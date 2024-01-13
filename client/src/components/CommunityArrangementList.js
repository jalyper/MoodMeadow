import React from 'react';

function CommunityArrangementList({ arrangements, onSelect }) {
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
                    <button onClick={() => onSelect(arrangement)}>Load Arrangement</button>
                </div>
            ))}
        </div>
    );
}

export default CommunityArrangementList;
