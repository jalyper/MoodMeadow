// __mocks__/audioMock.js

export class Audio {
    constructor() {
      this.play = jest.fn();  // Mock play method
      this.pause = jest.fn();  // Mock pause method
      this.addEventListener = jest.fn((event, handler) => {
        if (event === 'ended') {
          // Simulate the 'ended' event being fired
          setTimeout(handler, 100);  // Simulate the event firing after 100ms
        }
      });
      this.removeEventListener = jest.fn();  // Mock removeEventListener
    }
  }
  