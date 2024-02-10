// src/contexts/SoundsContext.js
import React, { createContext, useState, useEffect } from 'react';

export const SoundsContext = createContext();

export const SoundsProvider = ({ children }) => {
  const [sounds, setSounds] = useState([]);

  useEffect(() => {
    setSounds([
      { id: 1, name: 'Light Rain', src: '/sounds/light-rain-30-min.wav' },
      { id: 2, name: 'Soft Sketch', src: '/sounds/Soft Sketch.wav' },
      { id: 3, name: 'Light Rain, Drone Bass (C)', src: '/sounds/Light-Rain_Drone-Bass_C.wav' },
      { id: 4, name: 'Soft Drone Bass (C)', src: '/sounds/Soft-Drone-Bass_C.wav' },
      { id: 5, name: 'Soft Flute (C)', src: '/sounds/Soft-Flute_C.wav' },
      // ... other sounds
    ]);
  }, []);

  return (
    <SoundsContext.Provider value={{ sounds, setSounds }}>
      {children}
    </SoundsContext.Provider>
  );
};
