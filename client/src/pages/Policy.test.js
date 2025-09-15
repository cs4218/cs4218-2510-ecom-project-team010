import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Policy from './Policy';

// arrange
jest.mock('../components/Header', () => () => <div/>);

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };  

describe('Policy Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders policy page', () => {
      // act
        const { getByText} = render(
          <MemoryRouter initialEntries={['/policy']}>
            <Routes>
              <Route path="/policy" element={<Policy />} />
            </Routes>
          </MemoryRouter>
        );
    
        const text = screen.getAllByText(/add privacy policy/i);

        // assert
        expect(text).toHaveLength(7); 
      });
      
    // can add test case about image too
});
