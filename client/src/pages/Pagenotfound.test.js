// Note: these test cases are generated with the help of AI

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Pagenotfound from "./Pagenotfound";

// Mock the Layout component to simplify testing
jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));

// Mock react-router-dom Link component
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children, to, className, ...props }) => (
    <a href={to} className={className} data-testid="link" {...props}>
      {children}
    </a>
  ),
}));

describe("Testing Pagenotfound Page", () => {
  const renderPagenotfound = () =>
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

  describe("Testing Layout integration", () => {
    it("renders with correct title prop passed to Layout", () => {
      // arrange & act
      renderPagenotfound();
      const layout = screen.getByTestId("layout");

      // assert
      expect(layout).toHaveAttribute("data-title", "go back- page not found");
    });

    it("renders Layout component", () => {
      // arrange & act
      renderPagenotfound();

      // assert
      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });
  });

  describe("Testing page structure and content", () => {
    it("renders the main container with correct class", () => {
      // arrange & act
      renderPagenotfound();
      const container = screen.getByTestId("layout").querySelector(".pnf");

      // assert
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("pnf");
    });

    it("renders all required elements", () => {
      // arrange & act
      renderPagenotfound();
      const layout = screen.getByTestId("layout");
      const pnfContainer = layout.querySelector(".pnf");

      // assert
      expect(pnfContainer).toBeInTheDocument();
      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
  });

  describe("Testing 404 heading", () => {
    it("renders the 404 title", () => {
      // arrange & act
      renderPagenotfound();
      const title = screen.getByText("404");

      // assert
      expect(title).toBeInTheDocument();
    });

    it("404 title has correct class", () => {
      // arrange & act
      renderPagenotfound();
      const title = screen.getByText("404");

      // assert
      expect(title).toHaveClass("pnf-title");
    });

    it("404 title is an h1 element", () => {
      // arrange & act
      renderPagenotfound();
      const title = screen.getByText("404");

      // assert
      expect(title.tagName).toBe("H1");
    });

    it("404 title is contained in pnf container", () => {
      // arrange & act
      renderPagenotfound();
      const layout = screen.getByTestId("layout");
      const pnfContainer = layout.querySelector(".pnf");
      const title = screen.getByText("404");

      // assert
      expect(pnfContainer).toContainElement(title);
    });
  });

  describe("Testing page not found heading", () => {
    it("renders the page not found heading", () => {
      // arrange & act
      renderPagenotfound();
      const heading = screen.getByText("Oops ! Page Not Found");

      // assert
      expect(heading).toBeInTheDocument();
    });

    it("page not found heading has correct class", () => {
      // arrange & act
      renderPagenotfound();
      const heading = screen.getByText("Oops ! Page Not Found");

      // assert
      expect(heading).toHaveClass("pnf-heading");
    });

    it("page not found heading is an h2 element", () => {
      // arrange & act
      renderPagenotfound();
      const heading = screen.getByText("Oops ! Page Not Found");

      // assert
      expect(heading.tagName).toBe("H2");
    });

    it("page not found heading is contained in pnf container", () => {
      // arrange & act
      renderPagenotfound();
      const layout = screen.getByTestId("layout");
      const pnfContainer = layout.querySelector(".pnf");
      const heading = screen.getByText("Oops ! Page Not Found");

      // assert
      expect(pnfContainer).toContainElement(heading);
    });
  });

  describe("Testing Go Back link", () => {
    it("renders the Go Back link", () => {
      // arrange & act
      renderPagenotfound();
      const link = screen.getByText("Go Back");

      // assert
      expect(link).toBeInTheDocument();
    });

    it("Go Back link has correct href attribute", () => {
      // arrange & act
      renderPagenotfound();
      const link = screen.getByTestId("link");

      // assert
      expect(link).toHaveAttribute("href", "/");
    });

    it("Go Back link has correct class", () => {
      // arrange & act
      renderPagenotfound();
      const link = screen.getByTestId("link");

      // assert
      expect(link).toHaveClass("pnf-btn");
    });

    it("Go Back link is contained in pnf container", () => {
      // arrange & act
      renderPagenotfound();
      const layout = screen.getByTestId("layout");
      const pnfContainer = layout.querySelector(".pnf");
      const link = screen.getByTestId("link");

      // assert
      expect(pnfContainer).toContainElement(link);
    });

    it("Go Back link displays correct text", () => {
      // arrange & act
      renderPagenotfound();
      const link = screen.getByTestId("link");

      // assert
      expect(link).toHaveTextContent("Go Back");
    });
  });

  describe("Testing component rendering", () => {
    it("renders without crashing", () => {
      // arrange & act
      const { container } = renderPagenotfound();

      // assert
      expect(container).toBeTruthy();
    });

    it("renders all elements in correct order", () => {
      // arrange & act
      renderPagenotfound();
      const layout = screen.getByTestId("layout");
      const pnfContainer = layout.querySelector(".pnf");

      // assert
      expect(pnfContainer.children[0]).toHaveTextContent("404");
      expect(pnfContainer.children[1]).toHaveTextContent("Oops ! Page Not Found");
      expect(pnfContainer.children[2]).toHaveTextContent("Go Back");
    });
  });

  describe("Testing accessibility", () => {
    it("has proper heading hierarchy", () => {
      // arrange & act
      renderPagenotfound();

      // assert
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Oops ! Page Not Found");
    });

    it("has accessible link for navigation", () => {
      // arrange & act
      renderPagenotfound();

      // assert
      expect(screen.getByRole("link")).toHaveAttribute("href", "/");
      expect(screen.getByRole("link")).toHaveTextContent("Go Back");
    });

    it("has semantic HTML structure", () => {
      // arrange & act
      renderPagenotfound();

      // assert
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("link")).toBeInTheDocument();
    });
  });

  describe("Testing navigation functionality", () => {
    it("link navigates to home page", () => {
      // arrange & act
      renderPagenotfound();
      const link = screen.getByTestId("link");

      // assert
      expect(link).toHaveAttribute("href", "/");
    });

    it("link is clickable", () => {
      // arrange & act
      renderPagenotfound();
      const link = screen.getByTestId("link");

      // assert
      expect(link).not.toBeDisabled();
      expect(link).toBeVisible();
    });
  });
});
