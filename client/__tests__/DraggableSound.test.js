import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DraggableSound from '../../client/src/components/DraggableSound';  // Path to your component
import { Audio } from '../../__mocks__/audioMock';  // Import the mocked Audio class
import { AudioContext } from '../../__mocks__/audioContextMock';  // Import the mocked AudioContext class
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';  // Add this line

// Use the mock Audio in the global environment
global.Audio = Audio;
global.AudioContext = AudioContext;

describe('DraggableSound Component', () => {
  const soundMock = {
    id: 1,
    name: 'Test Sound',
    src: 'test-sound.mp3',
  };

  it('plays the sound when the play button is clicked', () => {
    const { getByText } = render(
      <DndProvider backend={HTML5Backend}>  // Add backend={HTML5Backend}
        <DraggableSound sound={soundMock} isDropped={false} onPlay={jest.fn()} />
      </DndProvider>
    );
    const playButton = getByText('Play');  // Locate the Play button
    fireEvent.click(playButton);  // Simulate click event

    // Verify the play function of Audio is called
    expect(Audio.prototype.play).toHaveBeenCalled();
  });

  it('pauses the sound when the stop button is clicked', () => {
    const { getByText } = render(
      <DndProvider backend={HTML5Backend}>  // Add backend={HTML5Backend}
        <DraggableSound sound={soundMock} isDropped={false} onPlay={jest.fn()} />
      </DndProvider>
    );

    const playButton = getByText('Play');
    fireEvent.click(playButton);  // Start playing

    const stopButton = getByText('Stop');  // Button text changes to 'Stop'
    fireEvent.click(stopButton);  // Simulate stop click

    // Verify the pause function of Audio is called
    expect(Audio.prototype.pause).toHaveBeenCalled();
  });

  it('plays only the respective sound for each DraggableSound instance', () => {
    const soundMock1 = { id: 1, name: 'Sound 1', src: 'sound1.mp3' };
    const soundMock2 = { id: 2, name: 'Sound 2', src: 'sound2.mp3' };

    const { getByText } = render(
      <DndProvider backend={HTML5Backend}>  // Add backend={HTML5Backend}
        <DraggableSound sound={soundMock1} isDropped={false} onPlay={jest.fn()} />
        <DraggableSound sound={soundMock2} isDropped={false} onPlay={jest.fn()} />
      </DndProvider>
    );

    const playButton1 = getByText('Play', { selector: 'button' });
    const playButton2 = getByText('Play', { selector: 'button' });

    fireEvent.click(playButton1);  // Play sound 1
    expect(Audio.prototype.play).toHaveBeenCalledTimes(1);
    expect(Audio.prototype.src).toBe('sound1.mp3');

    fireEvent.click(playButton2);  // Play sound 2
    expect(Audio.prototype.play).toHaveBeenCalledTimes(2);
    expect(Audio.prototype.src).toBe('sound2.mp3');
  });
});
