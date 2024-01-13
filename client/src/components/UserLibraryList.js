import React from 'react';

function UserLibraryList({ arrangements, onSelect, onDelete }) {
  // Check if arrangements is an array
  if (!Array.isArray(arrangements)) {
    console.error('arrangements is not an array:', arrangements);
    return <div>No arrangements found or data is not valid.</div>;
  }

  // Rendering the list of arrangements
  return (
    <div className="user-library-list">
      {arrangements.map((arrangement, index) => (
        <div key={arrangement._id || index} className="arrangement-item">
          {/* Assuming you want to show a username here, you'll need to pass it down to this component */}
          <ul>
            {arrangement.sounds.map((sound, soundIndex) => (
              <li key={sound._id || soundIndex}>{sound.name}</li>
            ))}
          </ul>
          <button onClick={() => onSelect(arrangement)}>Load Arrangement</button>
          <button onClick={() => onDelete(arrangement)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export default UserLibraryList;
