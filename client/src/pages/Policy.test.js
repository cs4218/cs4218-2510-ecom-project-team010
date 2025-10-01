import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Policy from './Policy';

// Note: these test cases are generated with the help of AI

// arrange
jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));

jest.mock('../components/Header', () => () => <div/>);

describe('Testing rendering of policy page components.', () => {
    // arrange
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Renders image.', () => {
    // act
    render(
      <MemoryRouter initialEntries={['/policy']}>
        <Routes>
          <Route path="/policy" element={<Policy />} />
        </Routes>
      </MemoryRouter>
    );
    const img = screen.getByAltText("contactus");

    // assert
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg"); // correct image is rendered
    });

    it('Renders text.', () => {
    // act
    render(
      <MemoryRouter initialEntries={['/policy']}>
        <Routes>
          <Route path="/policy" element={<Policy />} />
        </Routes>
      </MemoryRouter>
    );
    const paras = screen.getAllByText("We are commited to selling you products of the highest quality for reasonable prices.");

    // assert 
    expect(paras).toHaveLength(1); // correct text is rendered once.
    });
});