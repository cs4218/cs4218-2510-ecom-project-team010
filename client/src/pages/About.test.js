// Note: these test cases are generated with the help of AI

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import About from "./About";

// Mock the Layout component to simplify testing
jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));

describe("Testing About Page", () => {
  const renderAbout = () =>
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

  describe("Testing Layout integration", () => {
    it("renders with correct title prop passed to Layout", () => {
      // arrange & act
      renderAbout();
      const layout = screen.getByTestId("layout");

      // assert
      expect(layout).toHaveAttribute("data-title", "About us - Ecommerce app");
    });

    it("renders Layout component", () => {
      // arrange & act
      renderAbout();

      // assert
      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });
  });

  describe("Testing page structure and content", () => {
    it("renders the main container with correct class", () => {
      // arrange & act
      renderAbout();
      const container = screen.getByTestId("layout").querySelector(".row.contactus");

      // assert
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("row", "contactus");
    });

    it("renders two column layout", () => {
      // arrange & act
      renderAbout();
      const layout = screen.getByTestId("layout");
      const columns = layout.querySelectorAll('[class*="col-md-"]');

      // assert
      expect(columns).toHaveLength(2);
    });

    it("first column has correct Bootstrap class", () => {
      // arrange & act
      renderAbout();
      const layout = screen.getByTestId("layout");
      const firstCol = layout.querySelector(".col-md-6");

      // assert
      expect(firstCol).toBeInTheDocument();
    });

    it("second column has correct Bootstrap class", () => {
      // arrange & act
      renderAbout();
      const layout = screen.getByTestId("layout");
      const secondCol = layout.querySelector(".col-md-4");

      // assert
      expect(secondCol).toBeInTheDocument();
    });
  });

  describe("Testing image element", () => {
    it("renders the about image", () => {
      // arrange & act
      renderAbout();
      const image = screen.getByAltText("contactus");

      // assert
      expect(image).toBeInTheDocument();
    });

    it("image has correct src attribute", () => {
      // arrange & act
      renderAbout();
      const image = screen.getByAltText("contactus");

      // assert
      expect(image).toHaveAttribute("src", "/images/about.jpeg");
    });

    it("image has correct alt text", () => {
      // arrange & act
      renderAbout();
      const image = screen.getByAltText("contactus");

      // assert
      expect(image).toHaveAttribute("alt", "contactus");
    });

    it("image has correct inline style", () => {
      // arrange & act
      renderAbout();
      const image = screen.getByAltText("contactus");

      // assert
      expect(image).toHaveStyle({ width: "100%" });
    });

    it("image is contained in first column", () => {
      // arrange & act
      renderAbout();
      const layout = screen.getByTestId("layout");
      const firstCol = layout.querySelector(".col-md-6");
      const image = screen.getByAltText("contactus");

      // assert
      expect(firstCol).toContainElement(image);
    });
  });

  describe("Testing text content", () => {
    it("renders the text paragraph", () => {
      // arrange & act
      renderAbout();
      const text = screen.getByText("Add text");

      // assert
      expect(text).toBeInTheDocument();
    });

    it("text paragraph has correct classes", () => {
      // arrange & act
      renderAbout();
      const paragraph = screen.getByText("Add text");

      // assert
      expect(paragraph).toHaveClass("text-justify", "mt-2");
    });

    it("text paragraph is a p element", () => {
      // arrange & act
      renderAbout();
      const paragraph = screen.getByText("Add text");

      // assert
      expect(paragraph.tagName).toBe("P");
    });

    it("text is contained in second column", () => {
      // arrange & act
      renderAbout();
      const layout = screen.getByTestId("layout");
      const secondCol = layout.querySelector(".col-md-4");
      const text = screen.getByText("Add text");

      // assert
      expect(secondCol).toContainElement(text);
    });
  });

  describe("Testing component rendering", () => {
    it("renders without crashing", () => {
      // arrange & act
      const { container } = renderAbout();

      // assert
      expect(container).toBeTruthy();
    });

  });

  describe("Testing accessibility", () => {
    it("image has alt attribute for accessibility", () => {
      // arrange & act
      renderAbout();
      const image = screen.getByRole("img");

      // assert
      expect(image).toHaveAttribute("alt");
      expect(image.getAttribute("alt")).not.toBe("");
    });

    it("renders accessible image element", () => {
      // arrange & act
      renderAbout();

      // assert
      expect(screen.getByRole("img")).toBeInTheDocument();
    });
  });
});
