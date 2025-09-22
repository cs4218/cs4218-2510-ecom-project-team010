import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Policy from './Policy';

// Note: these test cases are genereated with the help of AI

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

describe('Testing layout component.', () => {
    // arrange
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Renders layout component.', () => {
      // act
      render(
        <MemoryRouter initialEntries={['/policy']}>
          <Routes>
            <Route path="/policy" element={<Policy />} />
          </Routes>
        </MemoryRouter>
      );

      // assert
      expect(screen.getByTestId("layout")).toHaveAttribute(
        "data-title",
        "Privacy Policy"
      );
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
      expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
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
      expect(paras).toHaveLength(1);
      });
});