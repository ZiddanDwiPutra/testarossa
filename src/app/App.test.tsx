import React from 'react';
import { render } from '@testing-library/react';
import App from 'App.tsx';

describe('App', () => {
  test('it should render correctly', () => {
    render(<App />);
  });
});