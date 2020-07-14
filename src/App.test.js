import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const Heading = getByText(/EdiTDor - The best tool for viewing WoT-TDs/i);
  expect(Heading).toBeInTheDocument();
});
