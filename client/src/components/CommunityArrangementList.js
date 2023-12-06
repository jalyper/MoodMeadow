import React from 'react';

function CommunityArrangementList({ arrangements, onSelect }) {
    return (
        <div className="community-arrangements-list">
            {arrangements.map(arrangement => (
                <div 
                    key={arrangement._id} // Make sure you use the correct identifier property, typically `_id` in MongoDB
                    className="arrangement-item"
                >
                    {/* Assuming `userName` is the property holding the author's name */}
                    <p className="created-by-text">Created by: {arrangement.username}</p> 
                    {/* Assuming `sounds` is an array of sound names */}
                    <ul>
                        {arrangement.sounds.map((sound, index) => (
                            <li key={index}>{sound}</li>
                        ))}
                    </ul>
                    <button onClick={() => onSelect(arrangement)}>Load Arrangement</button>
                </div>
            ))}
        </div>
    );
}

export default CommunityArrangementList;
