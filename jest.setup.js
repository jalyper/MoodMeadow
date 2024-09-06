import Modal from 'react-modal';
import '@testing-library/jest-dom/';

// Create a mock root element for react-modal to attach to
const root = document.createElement('div');
root.setAttribute('id', 'root');
document.body.appendChild(root);

// Set the root element for react-modal
Modal.setAppElement('#root');

console.log('jest.setup.js has run!');