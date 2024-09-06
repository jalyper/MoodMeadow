import { render } from '@testing-library/react';
import Modal from 'react-modal';
import App from './App';
import React from 'react';

test('App component renders', () => {
  // Create a mock root element for react-modal
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);

  Modal.setAppElement('#root');  // Set the app element to this mock root

  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
