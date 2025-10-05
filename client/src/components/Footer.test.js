// Note: these test cases are generated with the help of AI

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

// Mock react-router-dom Link component
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children, to, ...props }) => (
    <a href={to} data-testid="link" {...props}>
      {children}
    </a>
  ),
}));

describe("Testing Footer Component", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

  describe("Testing component structure", () => {
    it("renders without crashing", () => {
      // arrange & act
      const { container } = renderFooter();

      // assert
      expect(container).toBeTruthy();
    });

    it("renders the main footer container", () => {
      // arrange & act
      renderFooter();

      // assert
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");
      expect(footerContainer).toHaveClass("footer");
    });

    it("renders all required elements", () => {
      // arrange & act
      renderFooter();

      // assert
      expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
  });

  describe("Testing copyright heading", () => {
    it("renders the copyright heading", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toBeInTheDocument();
    });

    it("copyright heading is an h4 element", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading.tagName).toBe("H4");
    });

    it("copyright heading has correct CSS classes", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toHaveClass("text-center");
    });

    it("copyright heading contains correct text", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toHaveTextContent("All Rights Reserved © TestingComp");
    });

    it("copyright heading is contained in footer container", () => {
      // arrange & act
      renderFooter();
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");

      // assert
      expect(footerContainer).toContainElement(screen.getByText("All Rights Reserved © TestingComp"));
    });
  });

  describe("Testing navigation links", () => {
    it("renders the navigation paragraph", () => {
      // arrange & act
      renderFooter();

      // assert
      const navParagraph = screen.getByText("About").closest("p");
      expect(navParagraph).toBeInTheDocument();
    });

    it("navigation paragraph has correct CSS classes", () => {
      // arrange & act
      renderFooter();

      // assert
      const navParagraph = screen.getByText("About").closest("p");
      expect(navParagraph).toHaveClass("text-center", "mt-3");
    });

    it("renders About link", () => {
      // arrange & act
      renderFooter();

      // assert
      const aboutLink = screen.getByText("About");
      expect(aboutLink).toBeInTheDocument();
    });

    it("About link has correct href attribute", () => {
      // arrange & act
      renderFooter();

      // assert
      const aboutLink = screen.getByText("About");
      expect(aboutLink).toHaveAttribute("href", "/about");
    });

    it("renders Contact link", () => {
      // arrange & act
      renderFooter();

      // assert
      const contactLink = screen.getByText("Contact");
      expect(contactLink).toBeInTheDocument();
    });

    it("Contact link has correct href attribute", () => {
      // arrange & act
      renderFooter();

      // assert
      const contactLink = screen.getByText("Contact");
      expect(contactLink).toHaveAttribute("href", "/contact");
    });

    it("renders Privacy Policy link", () => {
      // arrange & act
      renderFooter();

      // assert
      const policyLink = screen.getByText("Privacy Policy");
      expect(policyLink).toBeInTheDocument();
    });

    it("Privacy Policy link has correct href attribute", () => {
      // arrange & act
      renderFooter();

      // assert
      const policyLink = screen.getByText("Privacy Policy");
      expect(policyLink).toHaveAttribute("href", "/policy");
    });

    it("all links are contained in the same paragraph", () => {
      // arrange & act
      renderFooter();

      // assert
      const navParagraph = screen.getByText("About").closest("p");
      expect(navParagraph).toContainElement(screen.getByText("About"));
      expect(navParagraph).toContainElement(screen.getByText("Contact"));
      expect(navParagraph).toContainElement(screen.getByText("Privacy Policy"));
    });
  });

  describe("Testing link separators", () => {
    it("renders separators between links", () => {
      // arrange & act
      renderFooter();

      // assert
      const navParagraph = screen.getByText("About").closest("p");
      const paragraphText = navParagraph.textContent;
      
      expect(paragraphText).toContain("About|Contact|Privacy Policy");
    });

    it("has correct separator pattern", () => {
      // arrange & act
      renderFooter();

      // assert
      const navParagraph = screen.getByText("About").closest("p");
      const paragraphText = navParagraph.textContent;
      
      // Should have exactly 2 separators (|)
      const separatorCount = (paragraphText.match(/\|/g) || []).length;
      expect(separatorCount).toBe(2);
    });
  });

  describe("Testing accessibility", () => {
    it("has proper heading structure", () => {
      // arrange & act
      renderFooter();

      // assert
      expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("All Rights Reserved © TestingComp");
    });

    it("has accessible links for navigation", () => {
      // arrange & act
      renderFooter();

      // assert
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
      
      expect(links[0]).toHaveAttribute("href", "/about");
      expect(links[1]).toHaveAttribute("href", "/contact");
      expect(links[2]).toHaveAttribute("href", "/policy");
    });

    it("has semantic HTML structure", () => {
      // arrange & act
      renderFooter();

      // assert
      expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(3);
    });
  });

  describe("Testing CSS classes and styling", () => {
    it("footer container has correct class", () => {
      // arrange & act
      renderFooter();

      // assert
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");
      expect(footerContainer).toHaveClass("footer");
    });

    it("heading has text-center class", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toHaveClass("text-center");
    });

    it("navigation paragraph has correct classes", () => {
      // arrange & act
      renderFooter();

      // assert
      const navParagraph = screen.getByText("About").closest("p");
      expect(navParagraph).toHaveClass("text-center", "mt-3");
    });
  });

  describe("Testing component layout", () => {
    it("renders elements in correct order", () => {
      // arrange & act
      renderFooter();
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");

      // assert
      expect(footerContainer.children[0]).toHaveTextContent("All Rights Reserved © TestingComp");
      expect(footerContainer.children[1]).toHaveTextContent(/About.*Contact.*Privacy Policy/);
    });

    it("has two main sections", () => {
      // arrange & act
      renderFooter();
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");

      // assert
      expect(footerContainer.children).toHaveLength(2);
    });

    it("first section is the heading", () => {
      // arrange & act
      renderFooter();
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");

      // assert
      expect(footerContainer.children[0].tagName).toBe("H4");
    });

    it("second section is the navigation paragraph", () => {
      // arrange & act
      renderFooter();
      const footerContainer = screen.getByText("All Rights Reserved © TestingComp").closest("div");

      // assert
      expect(footerContainer.children[1].tagName).toBe("P");
    });
  });

  describe("Testing content accuracy", () => {
    it("displays correct company name", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toHaveTextContent("TestingComp");
    });

    it("displays copyright symbol", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toHaveTextContent("©");
    });

    it("displays all rights reserved text", () => {
      // arrange & act
      renderFooter();

      // assert
      const heading = screen.getByText("All Rights Reserved © TestingComp");
      expect(heading).toHaveTextContent("All Rights Reserved");
    });

    it("navigation links have correct labels", () => {
      // arrange & act
      renderFooter();

      // assert
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
  });
});
