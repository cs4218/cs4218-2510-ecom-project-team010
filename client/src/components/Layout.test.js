// Note: these test cases are generated with the help of AI

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Layout from "./Layout";

// Mock dependencies
jest.mock("react-helmet", () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>,
}));

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

jest.mock("./Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock("./Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

describe("Testing Layout Component", () => {
  const renderLayout = (props = {}) =>
    render(
      <MemoryRouter>
        <Layout {...props}>
          <div data-testid="test-children">Test Content</div>
        </Layout>
      </MemoryRouter>
    );

  describe("Testing basic component structure", () => {
    it("renders without crashing", () => {
      // arrange & act
      const { container } = renderLayout();

      // assert
      expect(container).toBeTruthy();
    });

    it("renders all main components", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(screen.getByTestId("test-children")).toBeInTheDocument();
      expect(screen.getByTestId("toaster")).toBeInTheDocument();
    });

    it("renders children content", () => {
      // arrange & act
      renderLayout();

      // assert
      const children = screen.getByTestId("test-children");
      expect(children).toBeInTheDocument();
      expect(children).toHaveTextContent("Test Content");
    });

    it("has correct main container structure", () => {
      // arrange & act
      renderLayout();

      // assert
      const mainElement = screen.getByRole("main");
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveStyle({ minHeight: "70vh" });
    });
  });

  describe("Testing Helmet integration", () => {
    it("renders Helmet component", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("renders with default props", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      // arrange
      const customProps = {
        title: "Custom Page Title",
      };

      // act
      renderLayout(customProps);

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("renders with custom description", () => {
      // arrange
      const customProps = {
        description: "Custom page description",
      };

      // act
      renderLayout(customProps);

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("renders with custom keywords", () => {
      // arrange
      const customProps = {
        keywords: "custom,keywords,here",
      };

      // act
      renderLayout(customProps);

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("renders with custom author", () => {
      // arrange
      const customProps = {
        author: "Custom Author",
      };

      // act
      renderLayout(customProps);

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("renders with all custom props", () => {
      // arrange
      const customProps = {
        title: "Custom Title",
        description: "Custom Description",
        keywords: "custom,keywords",
        author: "Custom Author",
      };

      // act
      renderLayout(customProps);

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });
  });

  describe("Testing component layout structure", () => {
    it("renders Header component", () => {
      // arrange & act
      renderLayout();

      // assert
      const header = screen.getByTestId("header");
      expect(header).toBeInTheDocument();
    });

    it("renders Footer component", () => {
      // arrange & act
      renderLayout();

      // assert
      const footer = screen.getByTestId("footer");
      expect(footer).toBeInTheDocument();
    });

    it("renders main content area", () => {
      // arrange & act
      renderLayout();

      // assert
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("renders Toaster component", () => {
      // arrange & act
      renderLayout();

      // assert
      const toaster = screen.getByTestId("toaster");
      expect(toaster).toBeInTheDocument();
    });

    it("has correct component order", () => {
      // arrange & act
      const { container } = renderLayout();

      // assert
      const rootDiv = container.firstChild;
      expect(rootDiv.children[0]).toHaveAttribute("data-testid", "helmet");
      expect(rootDiv.children[1]).toHaveAttribute("data-testid", "header");
      expect(rootDiv.children[2].tagName).toBe("MAIN");
      expect(rootDiv.children[3]).toHaveAttribute("data-testid", "footer");
    });
  });

  describe("Testing default props", () => {
    it("uses default title when not provided", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("uses default description when not provided", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("uses default keywords when not provided", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("uses default author when not provided", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });
  });

  describe("Testing inline styles", () => {
    it("applies correct minHeight style to main element", () => {
      // arrange & act
      renderLayout();

      // assert
      const main = screen.getByRole("main");
      expect(main).toHaveStyle({ minHeight: "70vh" });
    });

    it("main element has correct style object", () => {
      // arrange & act
      renderLayout();

      // assert
      const main = screen.getByRole("main");
      expect(main.style.minHeight).toBe("70vh");
    });
  });

  describe("Testing component integration", () => {
    it("integrates Header component correctly", () => {
      // arrange & act
      renderLayout();

      // assert
      const header = screen.getByTestId("header");
      expect(header).toHaveTextContent("Header");
    });

    it("integrates Footer component correctly", () => {
      // arrange & act
      renderLayout();

      // assert
      const footer = screen.getByTestId("footer");
      expect(footer).toHaveTextContent("Footer");
    });

    it("integrates Toaster component correctly", () => {
      // arrange & act
      renderLayout();

      // assert
      const toaster = screen.getByTestId("toaster");
      expect(toaster).toHaveTextContent("Toaster");
    });

    it("integrates Helmet component correctly", () => {
      // arrange & act
      renderLayout();

      // assert
      const helmet = screen.getByTestId("helmet");
      expect(helmet).toBeInTheDocument();
    });
  });

  describe("Testing children rendering", () => {
    it("renders single child correctly", () => {
      // arrange & act
      renderLayout();

      // assert
      const children = screen.getByTestId("test-children");
      expect(children).toBeInTheDocument();
    });

    it("renders multiple children correctly", () => {
      // arrange
      const MultipleChildrenLayout = () => (
        <Layout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </Layout>
      );

      // act
      render(
        <MemoryRouter>
          <MultipleChildrenLayout />
        </MemoryRouter>
      );

      // assert
      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("renders no children gracefully", () => {
      // arrange & act
      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      // assert
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
  });

  describe("Testing prop validation edge cases", () => {
    it("handles undefined title prop", () => {
      // arrange & act
      renderLayout({ title: undefined });

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("handles null description prop", () => {
      // arrange & act
      renderLayout({ description: null });

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("handles empty keywords prop", () => {
      // arrange & act
      renderLayout({ keywords: "" });

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("handles undefined author prop", () => {
      // arrange & act
      renderLayout({ author: undefined });

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });

    it("handles all undefined props", () => {
      // arrange & act
      renderLayout({
        title: undefined,
        description: undefined,
        keywords: undefined,
        author: undefined,
      });

      // assert
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
    });
  });

  describe("Testing component accessibility", () => {
    it("has proper semantic structure", () => {
      // arrange & act
      renderLayout();

      // assert
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("main element is accessible", () => {
      // arrange & act
      renderLayout();

      // assert
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe("MAIN");
    });
  });

  describe("Testing component performance", () => {
    it("renders efficiently with default props", () => {
      // arrange & act
      const startTime = performance.now();
      renderLayout();
      const endTime = performance.now();

      // assert
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
    });

    it("renders efficiently with custom props", () => {
      // arrange
      const customProps = {
        title: "Test Title",
        description: "Test Description",
        keywords: "test,keywords",
        author: "Test Author",
      };

      // act
      const startTime = performance.now();
      renderLayout(customProps);
      const endTime = performance.now();

      // assert
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
    });
  });

  describe("Testing component consistency", () => {
    it("maintains consistent structure across renders", () => {
      // arrange
      const { rerender } = renderLayout();

      // act
      rerender(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-children">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // assert
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(screen.getByTestId("test-children")).toBeInTheDocument();
    });

    it("maintains consistent structure with different props", () => {
      // arrange
      const { rerender } = renderLayout();

      // act
      rerender(
        <MemoryRouter>
          <Layout title="Different Title">
            <div data-testid="test-children">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // assert
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(screen.getByTestId("test-children")).toBeInTheDocument();
    });
  });
});
