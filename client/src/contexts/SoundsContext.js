// src/contexts/SoundsContext.js
import React, { createContext, useState, useEffect } from 'react';

export const SoundsContext = createContext();

export const SoundsProvider = ({ children }) => {
  const [sounds, setSounds] = useState([]);

  useEffect(() => {
    setSounds([
      { id: 1, name: 'Light Rain', src: `${process.env.PUBLIC_URL}/sounds/light-rain-30-min.wav` },
      { id: 2, name: 'Soft Sketch', src: `${process.env.PUBLIC_URL}/sounds/Soft-Sketch.wav` },
      { id: 3, name: 'Light Rain, Drone Bass (C)', src: `${process.env.PUBLIC_URL}/sounds/Light-Rain_Drone-Bass_C.wav` },
      { id: 4, name: 'Soft Drone Bass (C)', src: `${process.env.PUBLIC_URL}/sounds/Soft-Drone-Bass_C.wav` },
      { id: 5, name: 'Soft Flute (C)', src: `${process.env.PUBLIC_URL}/sounds/Soft-Flute_C.wav` },
      // ... other sounds
    ]);
  }, []);

  return (
    <SoundsContext.Provider value={{ sounds, setSounds }}>
      {children}
    </SoundsContext.Provider>
  );
};
