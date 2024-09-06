// __mocks__/audioContextMock.js
class AudioContext {
    constructor() {
      this.createOscillator = jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      }));
      this.createGain = jest.fn(() => ({
        connect: jest.fn(),
        gain: { value: 1 },
      }));
      this.connect = jest.fn();
    }
  }
  
  export default AudioContext;
  